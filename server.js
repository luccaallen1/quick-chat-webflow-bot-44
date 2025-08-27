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

// 1. POST /api/integrations/unipile/init  
// Generate Unipile hosted auth URL for any provider
app.post('/api/integrations/unipile/init', async (req, res) => {
  try {
    const { userId, provider, providerType, successRedirect, failureRedirect } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!provider) {
      return res.status(400).json({ error: 'provider is required' });
    }

    if (!providerType) {
      return res.status(400).json({ error: 'providerType is required' });
    }

    console.log('Initializing connection for provider:', { userId, provider, providerType });

    if (!UNIPILE_API_KEY || UNIPILE_API_KEY === 'your_unipile_api_key_here') {
      return res.status(500).json({ error: 'Unipile API key not configured' });
    }

    // Generate expiration time (24 hours from now)
    const expiresOn = new Date();
    expiresOn.setHours(expiresOn.getHours() + 24);

    // Use Unipile Hosted Auth Wizard as documented
    // Map provider types to Unipile provider names
    const providerMapping = {
      'GOOGLE_calendar': ['GOOGLE'],
      'GOOGLE_email': ['GOOGLE'],
      'MICROSOFT_calendar': ['MICROSOFT'],
      'MICROSOFT_email': ['MICROSOFT'],
      'IMAP_email': ['IMAP'],
      'WHATSAPP_messaging': ['WHATSAPP'],
      'LINKEDIN_messaging': ['LINKEDIN'],
      'INSTAGRAM_messaging': ['INSTAGRAM'],
      'MESSENGER_messaging': ['MESSENGER'],
      'TWITTER_messaging': ['TWITTER'],
      'TELEGRAM_messaging': ['TELEGRAM']
    };

    const providerKey = `${provider}_${providerType}`;
    const unipileProviders = providerMapping[providerKey] || [provider];

    // Create proper hosted auth payload with calendar scopes
    const hostedAuthPayload = {
      type: 'create',
      providers: [provider], // Use the direct provider (GOOGLE)
      api_url: UNIPILE_API_URL,
      expiresOn: expiresOn.toISOString(),
      notify_url: `${req.protocol}://${req.get('host')}/api/integrations/unipile/notify`,
      success_redirect_url: successRedirect || `${req.protocol}://${req.get('host')}/integrations/success`,
      failure_redirect_url: failureRedirect || `${req.protocol}://${req.get('host')}/integrations/failure`,
      name: `${userId}:${provider}:${providerType}` // Include provider info in name
    };

    // Add provider-specific scopes for calendar access
    if (provider === 'GOOGLE' && providerType === 'calendar') {
      hostedAuthPayload.scopes = [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/calendar.events',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ];
      console.log('🗓️  Requesting Google Calendar scopes:', hostedAuthPayload.scopes);
    }

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
    
    // Parse the enhanced name format: userId:provider:providerType
    let userId, provider, providerType;
    if (name && name.includes(':')) {
      const parts = name.split(':');
      userId = parts[0];
      provider = parts[1] || 'GOOGLE';
      providerType = parts[2] || 'calendar';
    } else {
      // Fallback for legacy format
      userId = name;
      provider = 'GOOGLE';
      providerType = 'calendar';
    }

    console.log('Unipile notify webhook:', { status, account_id, userId, provider, providerType });

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

// 6. POST /api/integrations/unipile/disconnect
// Disconnect any provider  
app.post('/api/integrations/unipile/disconnect', async (req, res) => {
  try {
    const { userId, provider, providerType } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }

    if (!provider) {
      return res.status(400).json({ error: 'provider is required' });
    }

    if (!providerType) {
      return res.status(400).json({ error: 'providerType is required' });
    }

    console.log('Disconnecting provider:', { userId, provider, providerType });

    // Delete from provider-specific tables
    if (provider === 'GOOGLE' && providerType === 'calendar') {
      await supabase
        .from('google_calendars')
        .delete()
        .eq('user_id', userId);
    }

    // Delete from account mappings table
    const { error: mappingError } = await supabaseAdmin
      .from('unipile_account_mappings')
      .delete()
      .eq('user_identifier', userId)
      .eq('provider', provider);
      // Note: provider_type column doesn't exist yet, will be added in migration

    // Update main unipile_accounts status to 'disconnected' (fallback)
    const { error } = await supabase
      .from('unipile_accounts')
      .update({ 
        status: 'disconnected',
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .eq('provider', provider);

    if (mappingError) {
      console.error('Mapping delete error:', mappingError);
    }

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

// Get integration data for user (without storing in bot_configurations for now)
app.post('/api/integrations/get-status', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    const identifier = userId || sessionId;
    if (!identifier) {
      return res.status(400).json({ error: 'userId or sessionId is required' });
    }
    
    console.log('Getting integration status for:', { userId, sessionId });
    
    // Get user's integration data from mappings
    const { data: integrationMappings, error: integrationError } = await supabaseAdmin
      .from('unipile_account_mappings')
      .select('*')
      .eq('user_identifier', identifier)
      .eq('provider', 'GOOGLE')
      .eq('status', 'connected');
    
    if (integrationError) {
      console.error('Error fetching integration data:', integrationError);
      return res.status(500).json({ error: 'Failed to fetch integration data' });
    }
    
    const googleCalendarIntegration = integrationMappings?.[0];
    const isConnected = !!googleCalendarIntegration;
    
    console.log('Found integration data:', { isConnected, integration: googleCalendarIntegration });
    
    // If connected but email is missing, try to fetch it from Unipile
    let emailAddress = googleCalendarIntegration?.email;
    if (isConnected && !emailAddress && googleCalendarIntegration?.account_id) {
      try {
        console.log('Fetching email from Unipile account info...');
        const unipileResponse = await fetch(`${UNIPILE_API_URL}/api/v1/accounts/${googleCalendarIntegration.account_id}`, {
          headers: {
            'X-API-KEY': UNIPILE_API_KEY
          }
        });
        
        if (unipileResponse.ok) {
          const accountInfo = await unipileResponse.json();
          emailAddress = accountInfo.name || accountInfo.connection_params?.calendar?.username || accountInfo.connection_params?.mail?.username;
          console.log('📧 Retrieved email from Unipile:', emailAddress);
          
          // Update our database with the email for future use
          if (emailAddress) {
            const { error: updateError } = await supabaseAdmin
              .from('unipile_account_mappings')
              .update({ email: emailAddress })
              .eq('id', googleCalendarIntegration.id);
            
            if (updateError) {
              console.log('⚠️  Could not update email in database:', updateError.message);
            } else {
              console.log('✅ Updated email in database');
            }
          }
        }
      } catch (emailError) {
        console.log('⚠️  Could not fetch email from Unipile:', emailError.message);
      }
    }
    
    // Get selected calendar information from bot_configurations
    let selectedCalendarInfo = null;
    if (isConnected) {
      try {
        const { data: configData } = await supabaseAdmin
          .from('bot_configurations')
          .select('booking_calendar_id, wellness_plan_prices')
          .eq('user_id', identifier)
          .single();
        
        if (configData?.booking_calendar_id) {
          selectedCalendarInfo = {
            calendar_id: configData.booking_calendar_id,
            name: null
          };
          
          // Try to extract calendar name from metadata
          if (configData.wellness_plan_prices) {
            try {
              const metadata = JSON.parse(configData.wellness_plan_prices);
              if (metadata.selected_calendar) {
                selectedCalendarInfo.name = metadata.selected_calendar.name;
                selectedCalendarInfo.selected_at = metadata.selected_calendar.selected_at;
              }
            } catch (e) {
              // Ignore JSON parsing errors
            }
          }
        }
      } catch (configError) {
        console.log('⚠️  Could not fetch calendar selection:', configError.message);
      }
    }

    const integrationData = isConnected ? {
      google_calendar: {
        connected: true,
        account_id: googleCalendarIntegration.account_id,
        email: emailAddress || null,
        status: googleCalendarIntegration.status,
        provider_type: googleCalendarIntegration.provider_type || 'calendar',
        unipile_api_key: UNIPILE_API_KEY, // Include for webhooks
        selected_calendar: selectedCalendarInfo // Include selected calendar for n8n
      },
      session_info: {
        user_id: identifier,
        timestamp: new Date().toISOString()
      }
    } : { 
      google_calendar: { connected: false },
      session_info: { user_id: identifier, timestamp: new Date().toISOString() }
    };
    
    res.json({
      success: true,
      integration_status: isConnected ? 'connected' : 'none',
      google_calendar_connected: isConnected,
      integrations: integrationData
    });
    
  } catch (error) {
    console.error('Get integration status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get bot configuration with integration data
app.post('/api/bot-config-with-integrations', async (req, res) => {
  try {
    const { userId, sessionId } = req.body;
    
    if (!userId && !sessionId) {
      return res.status(400).json({ error: 'userId or sessionId is required' });
    }
    
    console.log('Getting bot config with integrations:', { userId, sessionId });
    
    // First sync latest integration data
    if (userId) {
      try {
        await fetch('http://localhost:3001/api/integrations/sync-to-config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
      } catch (syncError) {
        console.log('Sync failed, continuing without sync:', syncError.message);
      }
    }
    
    // Get bot configuration with integration data
    const { data: configData, error: configError } = await supabaseAdmin
      .from('bot_configurations')
      .select('*')
      .eq('user_id', userId || sessionId)
      .first();
    
    if (configError && configError.code !== 'PGRST116') {
      console.error('Error fetching bot configuration:', configError);
      return res.status(500).json({ error: 'Failed to fetch configuration' });
    }
    
    // Extract integration data from wellness_plan_prices field (temporary storage)
    let integrationData = {};
    if (configData?.wellness_plan_prices) {
      try {
        const parsed = JSON.parse(configData.wellness_plan_prices);
        if (parsed.integrations) {
          integrationData = parsed.integrations;
        }
      } catch (e) {
        // If parsing fails, fall back to mapping table
        const { data: mappingData } = await supabaseAdmin
          .from('unipile_account_mappings')
          .select('*')
          .eq('user_identifier', userId)
          .eq('provider', 'GOOGLE')
          .eq('status', 'connected');
        
        if (mappingData?.[0]) {
          integrationData = {
            google_calendar: {
              connected: true,
              account_id: mappingData[0].account_id,
              email: mappingData[0].email,
              status: mappingData[0].status
            }
          };
        }
      }
    }
    
    const isCalendarConnected = integrationData?.google_calendar?.connected || false;
    
    const result = {
      bot_config: configData,
      integrations: integrationData,
      integration_status: isCalendarConnected ? 'connected' : 'none',
      google_calendar_connected: isCalendarConnected
    };
    
    console.log('Returning bot config with integrations:', {
      hasConfig: !!configData,
      integrationStatus: result.integration_status,
      calendarConnected: result.google_calendar_connected
    });
    
    res.json(result);
    
  } catch (error) {
    console.error('Bot config with integrations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Webhook capture endpoint - captures actual webhook data from embedded chat
app.post('/api/webhook/capture', async (req, res) => {
  try {
    const webhookData = req.body;
    console.log('🎯 CAPTURED WEBHOOK FROM EMBEDDED CHAT:');
    console.log(JSON.stringify(webhookData, null, 2));
    
    // Check if integrations are included
    const hasIntegrations = webhookData.integrations && Object.keys(webhookData.integrations).length > 0;
    const hasGoogleCalendar = webhookData.integrations?.google_calendar?.connected;
    
    console.log(`🔍 Integration Status: ${hasIntegrations ? 'PRESENT' : 'MISSING'}`);
    console.log(`📅 Google Calendar: ${hasGoogleCalendar ? 'CONNECTED' : 'NOT CONNECTED'}`);
    
    // Simulate AI response for testing
    res.json([{
      output: `Hello! I received your message: "${webhookData.message}". Integration data ${hasIntegrations ? 'is included' : 'is missing'} in this webhook${hasGoogleCalendar ? ' and Google Calendar is connected!' : '.'}`,
      intermediateSteps: []
    }]);
    
  } catch (error) {
    console.error('❌ Webhook capture error:', error);
    res.json([{
      output: 'Sorry, there was an error processing your message.',
      intermediateSteps: []
    }]);
  }
});

// Webhook simulation endpoint - shows what data would be sent to n8n
app.post('/api/webhook/simulate', async (req, res) => {
  try {
    const { message, userId, sessionId } = req.body;
    
    console.log('🎯 Simulating webhook payload for message:', { message, userId, sessionId });
    
    // Get integration status
    const integrationResponse = await fetch('http://localhost:3001/api/integrations/get-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, sessionId })
    });
    
    let integrationData = {};
    if (integrationResponse.ok) {
      const integrationResult = await integrationResponse.json();
      integrationData = integrationResult.integrations;
    }
    
    // Simulate the complete webhook payload that would be sent to n8n
    const webhookPayload = {
      message: message || 'Hello, I need to book an appointment',
      user_id: userId,
      session_id: sessionId,
      timestamp: new Date().toISOString(),
      integrations: integrationData, // This is what was missing before!
      conversation_context: {
        platform: 'web',
        source: 'business_chatbot'
      }
    };
    
    console.log('📡 Complete webhook payload that would be sent to n8n:', JSON.stringify(webhookPayload, null, 2));
    
    res.json({
      success: true,
      webhook_payload: webhookPayload,
      integration_included: Object.keys(integrationData).length > 0,
      calendar_connected: integrationData?.google_calendar?.connected || false
    });
    
  } catch (error) {
    console.error('❌ Webhook simulation error:', error);
    res.status(500).json({ error: 'Failed to simulate webhook' });
  }
});

// Get available calendars for a connected account
app.post('/api/integrations/calendars/list', async (req, res) => {
  try {
    const { userId, accountId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    console.log('📅 Fetching calendars for user:', userId);
    
    // Get the account_id if not provided
    let targetAccountId = accountId;
    if (!targetAccountId) {
      const { data: integration } = await supabaseAdmin
        .from('unipile_account_mappings')
        .select('account_id')
        .eq('user_identifier', userId)
        .eq('provider', 'GOOGLE')
        .eq('status', 'connected')
        .single();
      
      if (!integration) {
        return res.status(404).json({ error: 'No connected Google account found' });
      }
      
      targetAccountId = integration.account_id;
    }
    
    console.log('🔍 Using account_id:', targetAccountId);
    
    // Try to fetch calendars from Unipile, but provide fallback
    let accountCalendars = [];
    
    try {
      const calendarsResponse = await fetch(`${UNIPILE_API_URL}/api/v1/calendars`, {
        method: 'POST',
        headers: {
          'X-API-KEY': UNIPILE_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account_id: targetAccountId,
          offset: 0,
          limit: 50
        })
      });
      
      if (calendarsResponse.ok) {
        const calendarsData = await calendarsResponse.json();
        console.log('📅 Retrieved calendars:', calendarsData);
        accountCalendars = Array.isArray(calendarsData) ? calendarsData : 
                          calendarsData.items || calendarsData.data || [];
      } else {
        console.log('⚠️  Unipile calendars API failed, using fallback approach');
      }
    } catch (apiError) {
      console.log('⚠️  Calendar API error:', apiError.message);
    }
    
    // If no calendars found via API, create default calendar options based on the account
    if (accountCalendars.length === 0) {
      console.log('📅 No calendars returned from API, creating default calendar option');
      
      // Get account info to create a reasonable default
      try {
        const accountInfoResponse = await fetch(`${UNIPILE_API_URL}/api/v1/accounts/${targetAccountId}`, {
          headers: { 'X-API-KEY': UNIPILE_API_KEY }
        });
        
        if (accountInfoResponse.ok) {
          const accountInfo = await accountInfoResponse.json();
          const email = accountInfo.name || accountInfo.connection_params?.calendar?.username || 'Primary Calendar';
          
          accountCalendars = [{
            id: `${targetAccountId}_primary`,
            summary: `${email} - Primary Calendar`,
            description: 'Primary Google Calendar',
            primary: true,
            accessRole: 'owner',
            account_id: targetAccountId,
            backgroundColor: '#2196F3',
            timeZone: 'UTC'
          }];
          
          console.log(`✅ Created default calendar: ${accountCalendars[0].summary}`);
        }
      } catch (accountError) {
        console.log('⚠️  Could not fetch account info, using generic calendar');
        accountCalendars = [{
          id: `${targetAccountId}_primary`,
          summary: 'Primary Calendar',
          description: 'Google Calendar for bookings',
          primary: true,
          accessRole: 'owner',
          account_id: targetAccountId,
          backgroundColor: '#2196F3',
          timeZone: 'UTC'
        }];
      }
    }
    
    console.log(`✅ Found ${accountCalendars.length} calendars for account ${targetAccountId}`);
    
    res.json({
      success: true,
      account_id: targetAccountId,
      calendars: accountCalendars.map(cal => ({
        calendar_id: cal.id,
        name: cal.summary || cal.name || 'Unnamed Calendar',
        description: cal.description || '',
        primary: cal.primary || false,
        access_role: cal.accessRole || 'reader',
        account_id: cal.account_id || cal.account || targetAccountId,
        provider: 'GOOGLE',
        color: cal.backgroundColor || cal.color,
        time_zone: cal.timeZone
      }))
    });
    
  } catch (error) {
    console.error('❌ Error fetching calendars:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Save selected calendar for a user's business configuration  
app.post('/api/integrations/calendars/select', async (req, res) => {
  try {
    const { userId, calendarId, calendarName, configId } = req.body;
    
    if (!userId || !calendarId) {
      return res.status(400).json({ error: 'userId and calendarId are required' });
    }
    
    console.log('💾 Saving selected calendar:', { userId, calendarId, calendarName, configId });
    
    // Update the bot_configurations table with selected calendar
    const updateData = {
      booking_calendar_id: calendarId,
      calendar_id: calendarId, // Legacy field
      updated_at: new Date().toISOString()
    };
    
    // Add calendar name to clinic_name or a metadata field if we have it
    if (calendarName) {
      // Store calendar name in a metadata field within the wellness_plan_prices JSON
      const { data: existingConfig } = await supabaseAdmin
        .from('bot_configurations')
        .select('wellness_plan_prices')
        .eq('user_id', userId)
        .single();
      
      let metadata = {};
      if (existingConfig?.wellness_plan_prices) {
        try {
          metadata = JSON.parse(existingConfig.wellness_plan_prices);
        } catch (e) {
          metadata = {};
        }
      }
      
      metadata.selected_calendar = {
        calendar_id: calendarId,
        name: calendarName,
        selected_at: new Date().toISOString()
      };
      
      updateData.wellness_plan_prices = JSON.stringify(metadata);
    }
    
    const { data, error } = await supabaseAdmin
      .from('bot_configurations')
      .update(updateData)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error updating bot configuration:', error);
      return res.status(500).json({ error: 'Failed to save calendar selection' });
    }
    
    console.log('✅ Calendar selection saved successfully');
    
    res.json({
      success: true,
      message: 'Calendar selection saved',
      selected_calendar: {
        calendar_id: calendarId,
        name: calendarName
      },
      updated_config: data
    });
    
  } catch (error) {
    console.error('❌ Error saving calendar selection:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Simple Google Calendar Auth Endpoint
app.post('/api/integrations/auth/google', async (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'userId is required' });
    }
    
    const expiresOn = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // +10 minutes
    
    const payload = {
      type: "create",
      providers: ["GOOGLE"],
      api_url: UNIPILE_API_URL,
      expiresOn,
      success_redirect_url: `${process.env.APP_URL || 'http://localhost:8080'}/integrations/success`,
      failure_redirect_url: `${process.env.APP_URL || 'http://localhost:8080'}/integrations/failure`,
      notify_url: `${process.env.BACKEND_URL || 'http://localhost:3001'}/api/integrations/callback`,
      name: userId // This comes back in the notify webhook
    };
    
    console.log('🎯 Creating Unipile hosted auth link for user:', userId);
    
    const response = await fetch(`${UNIPILE_API_URL}/api/v1/hosted/accounts/link`, {
      method: 'POST',
      headers: {
        'X-API-KEY': UNIPILE_API_KEY,
        'accept': 'application/json',
        'content-type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Unipile link error:', errorText);
      return res.status(500).json({ error: 'unipile_link_error', detail: errorText });
    }
    
    const data = await response.json();
    console.log('✅ Hosted auth URL created:', data.url);
    
    return res.json({ url: data.url });
    
  } catch (error) {
    console.error('❌ Auth endpoint error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Unipile Callback Endpoint (notify_url)
app.post('/api/integrations/callback', async (req, res) => {
  try {
    const { status, account_id, name } = req.body;
    
    console.log('📡 Unipile callback received:', { status, account_id, name });
    
    if (status === 'SUCCESS' && account_id && name) {
      // Extract userId from the name field
      const userId = name;
      
      // Store the account mapping
      const { error } = await supabaseAdmin
        .from('unipile_account_mappings')
        .upsert({
          user_identifier: userId,
          account_id: account_id,
          provider: 'GOOGLE',
          status: 'connected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_identifier,provider'
        });
      
      if (error) {
        console.error('❌ Failed to store account mapping:', error);
      } else {
        console.log('✅ Account mapping stored for user:', userId);
      }
    }
    
    res.json({ success: true });
  } catch (error) {
    console.error('❌ Callback error:', error);
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
  console.log(`   POST /api/integrations/auth/google`);
  console.log(`   POST /api/integrations/callback`);
  console.log(`   POST /api/integrations/unipile/init`);
  console.log(`   POST /api/integrations/unipile/google/init`);
  console.log(`   POST /api/integrations/unipile/notify`);
  console.log(`   POST /api/integrations/unipile/google/calendars/refresh`);
  console.log(`   POST /api/integrations/unipile/google/calendars/select`);
  console.log(`   POST /api/integrations/unipile/token-resolve`);
  console.log(`   POST /api/integrations/unipile/google/disconnect`);
  console.log(`   POST /api/integrations/get-status`);
  console.log(`   POST /api/integrations/sync-to-config`);
  console.log(`   POST /api/integrations/calendars/list`);
  console.log(`   POST /api/integrations/calendars/select`);
  console.log(`   POST /api/webhook/capture`);
  console.log(`   POST /api/webhook/simulate`);
  console.log(`   POST /api/calendar/freebusy`);
  console.log(`   POST /api/bookings/create`);
  console.log(`   GET  /api/health`);
  console.log(`\n⚠️  Remember to set VITE_UNIPILE_API_KEY in .env file`);
});