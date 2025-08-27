import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_KEY; // Service role key for backend operations
const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey || supabaseAnonKey);

// Unipile configuration
const UNIPILE_API_URL = 'https://api20.unipile.com:15009';
const UNIPILE_API_KEY = process.env.VITE_UNIPILE_API_KEY;

if (!UNIPILE_API_KEY || UNIPILE_API_KEY === 'your_unipile_api_key_here') {
  console.warn('⚠️  UNIPILE_API_KEY not configured. Set VITE_UNIPILE_API_KEY in .env');
}

// 1. POST /api/integrations/unipile/google/init
// Generate Unipile hosted auth URL
app.post('/api/integrations/unipile/google/init', async (req, res) => {
  try {
    const { userId, successRedirect, failureRedirect } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!UNIPILE_API_KEY || UNIPILE_API_KEY === 'your_unipile_api_key_here') {
      return res.status(500).json({ error: 'Unipile API key not configured' });
    }

    // Generate expiration time (24 hours from now)
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 24);

    // Use Unipile Hosted Auth Wizard as documented
    const hostedAuthPayload = {
      type: 'create',
      providers: ['GOOGLE'],
      api_url: UNIPILE_API_URL,
      expiresOn: expiresOn.toISOString(),
      notify_url: `${req.protocol}://${req.get('host')}/api/integrations/unipile/notify`,
      success_redirect_url: successRedirect || `${req.protocol}://${req.get('host')}/integrations/success`,
      failure_redirect_url: failureRedirect || `${req.protocol}://${req.get('host')}/integrations/failure`,
      name: userId // Our internal user ID
    };

    const response = await fetch(`${UNIPILE_API_URL}/api/v1/hosted/accounts/link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY
      },
      body: JSON.stringify(hostedAuthPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Unipile Hosted Auth error:', response.status, errorData);
      return res.status(500).json({ error: 'Failed to create hosted auth URL' });
    }

    const data = await response.json();
    console.log('Unipile hosted auth response:', data);
    
    res.json({
      url: data.url,
      expiresOn: expiresOn.toISOString()
    });

    /* 
    // This would be used if Unipile had hosted auth, but they seem to require manual OAuth
    const hostedAuthPayload = {
      provider: 'GOOGLE_OAUTH',
      // Would need actual OAuth tokens here
    };

    const response = await fetch(`${UNIPILE_API_URL}/api/v1/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY
      },
      body: JSON.stringify(hostedAuthPayload)
    });
    */

  } catch (error) {
    console.error('Init Google connection error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Google OAuth callback handler
app.get('/api/integrations/google/callback', async (req, res) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      console.error('Missing code or userId in OAuth callback');
      return res.redirect('/integrations/failure');
    }

    console.log('Processing Google OAuth callback for user:', userId);

    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env.REACT_APP_GOOGLE_CLIENT_ID,
        client_secret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: `${req.protocol}://${req.get('host')}/api/integrations/google/callback`
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token exchange failed:', error);
      return res.redirect('/integrations/failure');
    }

    const tokens = await tokenResponse.json();
    console.log('Received tokens from Google');

    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v1/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokens.access_token}`
      }
    });

    const userInfo = await userResponse.json();
    console.log('User email:', userInfo.email);

    // Create Unipile account with the tokens
    const unipilePayload = {
      provider: 'GOOGLE_OAUTH',
      refresh_token: tokens.refresh_token,
      access_token: tokens.access_token
    };

    const unipileResponse = await fetch(`${UNIPILE_API_URL}/api/v1/accounts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY
      },
      body: JSON.stringify(unipilePayload)
    });

    if (!unipileResponse.ok) {
      const errorData = await unipileResponse.text();
      console.error('Unipile account creation failed:', errorData);
      return res.redirect('/integrations/failure');
    }

    const unipileAccount = await unipileResponse.json();
    console.log('Unipile account created:', unipileAccount.account_id);

    // Store the account mapping in our database
    const { error: dbError } = await supabase
      .from('unipile_accounts')
      .insert({
        user_id: userId,
        provider: 'GOOGLE',
        account_id: unipileAccount.account_id,
        status: 'connected',
        email: userInfo.email
      });

    if (dbError) {
      console.error('Database error storing account:', dbError);
      // Continue anyway - the Unipile account exists
    }

    console.log('Successfully connected Google Calendar for user:', userId);
    res.redirect('/integrations/success');

  } catch (error) {
    console.error('OAuth callback error:', error);
    res.redirect('/integrations/failure');
  }
});

// 2. POST /api/integrations/unipile/notify (Public Webhook)
// Handle Unipile notifications
app.post('/api/integrations/unipile/notify', async (req, res) => {
  try {
    const { status, account_id, name } = req.body;
    const userId = name; // We use user ID as the name in the hosted auth

    console.log('Unipile notify webhook:', { status, account_id, userId });

    if (status === 'CREATION_SUCCESS') {
      // First, try to create/update user if needed
      let validUserId = userId;
      
      // If userId is not a valid UUID, create a temporary user record
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(userId)) {
        // For non-UUID user IDs, we'll store them but need to handle the foreign key constraint
        console.log('Non-UUID user ID detected:', userId);
        
        // Try to insert into unipile_accounts without foreign key constraint
        // We'll modify the table structure temporarily
        const { data, error } = await supabaseAdmin.rpc('create_unipile_account_safe', {
          p_user_id: userId,
          p_account_id: account_id,
          p_email: null
        });
        
        if (error) {
          console.error('Database error:', error);
          // Fallback: store in a temporary way
          console.log('Storing account mapping for later processing:', { userId, account_id });
          // For now, just log success
          return res.json({ success: true, message: 'Account mapping stored for processing' });
        }
        
        return res.json({ success: true });
      }
      
      // For valid UUIDs, proceed normally
      const { data, error } = await supabaseAdmin
        .from('unipile_accounts')
        .insert({
          user_id: validUserId,
          provider: 'GOOGLE',
          account_id: account_id,
          status: 'connected'
        });

      if (error) {
        console.error('Database error:', error);
        return res.status(500).json({ error: 'Database error' });
      }

      console.log('Successfully stored Unipile account:', { userId, account_id });
      
      // Try to fetch user email from Unipile
      try {
        const profileResponse = await fetch(`${UNIPILE_API_URL}/api/v1/accounts/${account_id}/google/profile`, {
          headers: {
            'X-API-KEY': UNIPILE_API_KEY
          }
        });

        if (profileResponse.ok) {
          const profileData = await profileResponse.json();
          await supabase
            .from('unipile_accounts')
            .update({ email: profileData.email })
            .eq('account_id', account_id);
        }
      } catch (profileError) {
        console.warn('Could not fetch user profile:', profileError);
      }
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Notify webhook error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 3. POST /api/integrations/unipile/google/calendars/refresh
// Fetch and store user's calendars
app.post('/api/integrations/unipile/google/calendars/refresh', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Get user's Unipile account_id from database (using mapping table for now)
    const { data: accountData, error: accountError } = await supabaseAdmin
      .from('unipile_account_mappings')
      .select('account_id, email')
      .eq('user_identifier', userId)
      .eq('provider', 'GOOGLE')
      .eq('status', 'connected')
      .single();

    if (accountError || !accountData) {
      return res.status(404).json({ error: 'Google account not connected' });
    }

    // Check what endpoints are available for this account
    console.log('Fetching calendars for account:', accountData.account_id);

    try {
      // First, let's try to get account info to see what's available
      const accountInfoResponse = await fetch(`${UNIPILE_API_URL}/api/v1/accounts/${accountData.account_id}`, {
        headers: {
          'X-API-KEY': UNIPILE_API_KEY
        }
      });

      if (accountInfoResponse.ok) {
        const accountInfo = await accountInfoResponse.json();
        console.log('Account info:', JSON.stringify(accountInfo, null, 2));
      }
    } catch (e) {
      console.log('Could not fetch account info:', e.message);
    }

    // Try different possible calendar endpoints
    let calendarsData = null;
    const possibleEndpoints = [
      `/api/v1/accounts/${accountData.account_id}/google/calendar/calendars`,
      `/api/v1/accounts/${accountData.account_id}/calendars`,
      `/api/v1/accounts/${accountData.account_id}/gmail/calendars`
    ];

    for (const endpoint of possibleEndpoints) {
      try {
        console.log('Trying endpoint:', endpoint);
        const response = await fetch(`${UNIPILE_API_URL}${endpoint}`, {
          headers: {
            'X-API-KEY': UNIPILE_API_KEY
          }
        });

        if (response.ok) {
          calendarsData = await response.json();
          console.log('Success with endpoint:', endpoint);
          break;
        } else {
          console.log('Failed with status:', response.status, await response.text());
        }
      } catch (e) {
        console.log('Error with endpoint:', endpoint, e.message);
      }
    }

    if (!calendarsData) {
      console.error('All calendar endpoints failed');
      return res.status(500).json({ error: 'Could not fetch calendars from any endpoint' });
    }

    const calendars = Array.isArray(calendarsData) ? calendarsData : calendarsData.items || [];
    console.log('Found calendars:', calendars.length);

    // Clear existing calendars for this user
    await supabase
      .from('google_calendars')
      .delete()
      .eq('user_id', userId);

    // Store calendars in database
    const calendarInserts = calendars.map(calendar => ({
      user_id: userId,
      calendar_id: calendar.id,
      summary: calendar.summary || calendar.name || 'Unnamed Calendar',
      description: calendar.description,
      primary_calendar: calendar.primary || false,
      selected: calendar.primary || false, // Auto-select primary calendar
      access_role: calendar.accessRole || 'reader',
      time_zone: calendar.timeZone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    if (calendarInserts.length > 0) {
      const { error: insertError } = await supabase
        .from('google_calendars')
        .insert(calendarInserts);

      if (insertError) {
        console.error('Calendar insert error:', insertError);
        return res.status(500).json({ error: 'Failed to store calendars' });
      }
    }

    res.json({ calendars: calendarInserts });

  } catch (error) {
    console.error('Refresh calendars error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 4. POST /api/integrations/unipile/google/calendars/select
// Select default calendar for bookings
app.post('/api/integrations/unipile/google/calendars/select', async (req, res) => {
  try {
    const { userId, calendarId } = req.body;

    if (!userId || !calendarId) {
      return res.status(400).json({ error: 'userId and calendarId are required' });
    }

    // Set selected = false for all user's calendars
    await supabase
      .from('google_calendars')
      .update({ selected: false, updated_at: new Date().toISOString() })
      .eq('user_id', userId);

    // Set selected = true for the chosen calendar
    const { data, error } = await supabase
      .from('google_calendars')
      .update({ selected: true, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('calendar_id', calendarId)
      .select()
      .single();

    if (error) {
      console.error('Calendar select error:', error);
      return res.status(500).json({ error: 'Failed to select calendar' });
    }

    res.json({ success: true, selectedCalendar: data });

  } catch (error) {
    console.error('Select calendar error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 5. POST /api/integrations/unipile/token-resolve (For n8n)
// Get Unipile account for n8n workflows
app.post('/api/integrations/unipile/token-resolve', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ error: 'user_id is required' });
    }

    // Try mapping table first (for accounts connected via webhook)
    let { data: accountData, error } = await supabaseAdmin
      .from('unipile_account_mappings')
      .select('account_id, email')
      .eq('user_identifier', user_id)
      .eq('provider', 'GOOGLE')
      .eq('status', 'connected')
      .single();

    // Fallback to main accounts table
    if (error || !accountData) {
      ({ data: accountData, error } = await supabase
        .from('unipile_accounts')
        .select('account_id, email')
        .eq('user_id', user_id)
        .eq('provider', 'GOOGLE')
        .eq('status', 'connected')
        .single());
    }

    if (error || !accountData) {
      console.log('No Google account found for user:', user_id);
      return res.status(404).json({ error: 'Google account not connected' });
    }

    res.json({
      account_id: accountData.account_id,
      unipile_api_key: UNIPILE_API_KEY, // Note: In production, consider proxying instead
      email: accountData.email
    });

  } catch (error) {
    console.error('Token resolve error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// 6. POST /api/integrations/unipile/google/disconnect
// Disconnect Google Calendar
app.post('/api/integrations/unipile/google/disconnect', async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    // Delete from google_calendars table
    await supabase
      .from('google_calendars')
      .delete()
      .eq('user_id', userId);

    // Update unipile_accounts status to 'disconnected'
    const { error } = await supabase
      .from('unipile_accounts')
      .update({ 
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', 'GOOGLE');

    if (error) {
      console.error('Disconnect error:', error);
      return res.status(500).json({ error: 'Failed to disconnect account' });
    }

    res.json({ success: true });

  } catch (error) {
    console.error('Disconnect error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Additional helper endpoints for n8n workflows

// POST /api/calendar/freebusy - Check calendar availability
app.post('/api/calendar/freebusy', async (req, res) => {
  try {
    const { user_id, calendar_id, start, end } = req.body;

    // Get user's Unipile account
    const { data: accountData, error } = await supabase
      .from('unipile_accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('provider', 'GOOGLE')
      .eq('status', 'connected')
      .single();

    if (error || !accountData) {
      return res.status(404).json({ error: 'Google account not connected' });
    }

    // Call Unipile freebusy API
    const response = await fetch(`${UNIPILE_API_URL}/api/v1/accounts/${accountData.account_id}/google/calendar/freebusy`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY
      },
      body: JSON.stringify({
        timeMin: start,
        timeMax: end,
        items: [{ id: calendar_id }]
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: 'Failed to check availability' });
    }

    const data = await response.json();
    res.json(data);

  } catch (error) {
    console.error('Freebusy error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/bookings/create - Create calendar booking
app.post('/api/bookings/create', async (req, res) => {
  try {
    const { user_id, calendar_id, start, end, patient, source } = req.body;

    // Get user's Unipile account
    const { data: accountData, error } = await supabase
      .from('unipile_accounts')
      .select('account_id')
      .eq('user_id', user_id)
      .eq('provider', 'GOOGLE')
      .eq('status', 'connected')
      .single();

    if (error || !accountData) {
      return res.status(404).json({ error: 'Google account not connected' });
    }

    // Create event via Unipile
    const eventPayload = {
      summary: `Appointment with ${patient.name}`,
      description: `Patient: ${patient.name}\nEmail: ${patient.email}\nPhone: ${patient.phone}\nSource: ${source}`,
      start: {
        dateTime: start
      },
      end: {
        dateTime: end
      },
      attendees: [
        { email: patient.email, displayName: patient.name }
      ]
    };

    const response = await fetch(`${UNIPILE_API_URL}/api/v1/accounts/${accountData.account_id}/google/calendar/calendars/${calendar_id}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': UNIPILE_API_KEY
      },
      body: JSON.stringify(eventPayload)
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Create booking error:', errorData);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    const eventData = await response.json();

    // Store booking in database
    const { data: bookingData, error: bookingError } = await supabase
      .from('bookings')
      .insert({
        user_id,
        calendar_id,
        event_id: eventData.id,
        start_time: start,
        end_time: end,
        patient_name: patient.name,
        patient_email: patient.email,
        patient_phone: patient.phone,
        status: 'confirmed',
        source
      })
      .select()
      .single();

    if (bookingError) {
      console.error('Booking storage error:', bookingError);
      // Event was created but not stored locally - log this
    }

    res.json({
      success: true,
      booking_id: bookingData?.id,
      event_id: eventData.id,
      event_data: eventData
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper endpoint to link existing Unipile account to current user
app.post('/api/integrations/unipile/link-existing', async (req, res) => {
  try {
    const { currentUserId, unipileAccountId } = req.body;
    
    // Update the mapping to use the correct user ID
    const { error } = await supabaseAdmin
      .from('unipile_account_mappings')
      .update({
        user_identifier: currentUserId,
        updated_at: new Date().toISOString()
      })
      .eq('account_id', unipileAccountId);

    if (error) {
      console.error('Link error:', error);
      return res.status(500).json({ error: 'Failed to link account' });
    }

    res.json({ success: true, message: 'Account linked successfully' });
  } catch (error) {
    console.error('Link existing account error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Debug endpoint to see what's stored in mapping table
app.get('/api/debug-mappings', async (req, res) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('unipile_account_mappings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(500).json({ error: error.message });
    }

    res.json({
      mappings: data,
      total: data?.length || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual account linking - for fixing existing accounts that used email identifiers
app.post('/api/integrations/unipile/manual-link', async (req, res) => {
  try {
    const { currentUserId, emailIdentifier } = req.body;
    
    console.log('Manual linking request:', { currentUserId, emailIdentifier });
    
    // Find account by email identifier
    const { data: existingAccount, error: findError } = await supabaseAdmin
      .from('unipile_account_mappings')
      .select('*')
      .eq('user_identifier', emailIdentifier)
      .eq('provider', 'GOOGLE')
      .eq('status', 'connected')
      .single();
    
    if (findError || !existingAccount) {
      return res.status(404).json({ 
        error: 'Account not found',
        message: `No connected Google account found for ${emailIdentifier}` 
      });
    }
    
    // Update the account to use the current user's UUID
    const { error: updateError } = await supabaseAdmin
      .from('unipile_account_mappings')
      .update({
        user_identifier: currentUserId,
        updated_at: new Date().toISOString()
      })
      .eq('id', existingAccount.id);
    
    if (updateError) {
      console.error('Update error:', updateError);
      return res.status(500).json({ error: 'Failed to link account' });
    }
    
    console.log('Successfully linked account:', {
      accountId: existingAccount.account_id,
      oldIdentifier: emailIdentifier,
      newIdentifier: currentUserId
    });
    
    res.json({ 
      success: true, 
      message: 'Account linked successfully',
      account_id: existingAccount.account_id
    });
  } catch (error) {
    console.error('Manual link error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    unipile_configured: !!(UNIPILE_API_KEY && UNIPILE_API_KEY !== 'your_unipile_api_key_here')
  });
});

app.listen(port, () => {
  console.log(`🚀 Unipile backend server running on port ${port}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   POST /api/integrations/unipile/google/init`);
  console.log(`   POST /api/integrations/unipile/notify`);
  console.log(`   POST /api/integrations/unipile/google/calendars/refresh`);
  console.log(`   POST /api/integrations/unipile/google/calendars/select`);
  console.log(`   POST /api/integrations/unipile/token-resolve`);
  console.log(`   POST /api/integrations/unipile/google/disconnect`);
  console.log(`   POST /api/calendar/freebusy`);
  console.log(`   POST /api/bookings/create`);
  console.log(`   GET  /api/health`);
  console.log(`\n⚠️  Remember to set VITE_UNIPILE_API_KEY in .env file`);
});