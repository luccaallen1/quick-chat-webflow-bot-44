import { supabase } from '@/lib/supabase';

export interface UnipileAccount {
  id: string;
  user_id: string;
  provider: string;
  account_id: string;
  status: 'connected' | 'disconnected' | 'credentials_error';
  email?: string;
  created_at: string;
  updated_at: string;
}

export interface GoogleCalendar {
  id: string;
  user_id: string;
  calendar_id: string;
  summary: string;
  description?: string;
  primary_calendar: boolean;
  selected: boolean;
  access_role?: string;
  time_zone?: string;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  user_id: string;
  calendar_id: string;
  event_id: string;
  start_time: string;
  end_time: string;
  patient_name: string;
  patient_email?: string;
  patient_phone?: string;
  source: 'web' | 'sms' | 'facebook' | 'instagram';
  status: 'confirmed' | 'cancelled' | 'rescheduled';
  created_at: string;
  updated_at: string;
}

export interface HostedAuthResponse {
  url: string;
  expiresOn: string;
}

export interface UnipileNotifyPayload {
  status: 'CREATION_SUCCESS' | 'CREATION_FAILED' | 'CREDENTIALS_ERROR';
  account_id: string;
  name: string; // our internal user_id
}

class UnipileService {
  private backendUrl = process.env.NODE_ENV === 'production' 
    ? 'https://quick-chat-webflow-bot-44-production.up.railway.app'
    : 'http://localhost:3001'; // Use local backend in development

  /**
   * Initialize Google Calendar connection for a user
   */
  async initGoogleConnection(
    userId: string, 
    successRedirect?: string, 
    failureRedirect?: string
  ): Promise<HostedAuthResponse> {
    // Get current user to ensure we pass the correct ID
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    console.log('Initializing connection for user:', { 
      passedUserId: userId, 
      actualUserId: userData.user.id,
      userEmail: userData.user.email 
    });

    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id, // Use actual Supabase user ID
        provider: 'GOOGLE',
        providerType: 'calendar',
        successRedirect: successRedirect || `${window.location.origin}/integrations/success`,
        failureRedirect: failureRedirect || `${window.location.origin}/integrations/failure`
      })
    });

    if (!response.ok) {
      throw new Error('Failed to initialize Google connection');
    }

    return await response.json();
  }

  /**
   * Get user's Unipile account status
   */
  async getUserAccount(): Promise<UnipileAccount | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    // First try to find account by user UUID (with provider_type for new connections)
    let { data: mappingData, error: mappingError } = await supabase
      .from('unipile_account_mappings')
      .select('*')
      .eq('user_identifier', userData.user.id)
      .eq('provider', 'GOOGLE')
      .eq('provider_type', 'calendar')
      .eq('status', 'connected')
      .single();

    // If not found with provider_type, try without it (for legacy connections)
    if (!mappingData) {
      ({ data: mappingData, error: mappingError } = await supabase
        .from('unipile_account_mappings')
        .select('*')
        .eq('user_identifier', userData.user.id)
        .eq('provider', 'GOOGLE')
        .eq('status', 'connected')
        .single());
    }

    console.log('🔍 Searching for user mapping by UUID:', {
      userId: userData.user.id,
      provider: 'GOOGLE',
      providerType: 'calendar',
      foundMapping: !!mappingData,
      mappingData: mappingData,
      error: mappingError
    });

    // Also check what mappings exist for this user without filters
    const { data: allMappings } = await supabase
      .from('unipile_account_mappings')
      .select('*')
      .eq('user_identifier', userData.user.id);
    
    console.log('🔍 All mappings for user:', allMappings);

    if (mappingData) {
      return {
        id: mappingData.id,
        user_id: userData.user.id,
        provider: mappingData.provider,
        account_id: mappingData.account_id,
        status: mappingData.status as any,
        email: mappingData.email,
        created_at: mappingData.created_at,
        updated_at: mappingData.updated_at
      };
    }

    // If not found by UUID, try to find by email and automatically link it
    if (!mappingData && userData.user.email) {
      console.log('Account not found by UUID, trying to auto-link by email:', userData.user.email);
      
      try {
        const response = await fetch(`${this.backendUrl}/api/integrations/unipile/manual-link`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentUserId: userData.user.id,
            emailIdentifier: userData.user.email
          })
        });

        if (response.ok) {
          console.log('Successfully auto-linked account by email');
          // Retry the lookup now that it's linked
          return this.getUserAccount();
        } else {
          console.log('No account found to auto-link for this email');
        }
      } catch (error) {
        console.log('Auto-link attempt failed:', error);
      }
    }

    // Fallback to main table
    const { data, error } = await supabase
      .from('unipile_accounts')
      .select('*')
      .eq('user_id', userData.user.id)
      .eq('provider', 'GOOGLE')
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching Unipile account:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get user's Google calendars
   */
  async getUserCalendars(): Promise<GoogleCalendar[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('google_calendars')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('primary_calendar', { ascending: false })
      .order('summary');

    if (error) {
      console.error('Error fetching Google calendars:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Refresh user's calendar list from Google via Unipile
   */
  async refreshCalendars(): Promise<GoogleCalendar[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/google/calendars/refresh`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh calendars');
    }

    return await response.json();
  }

  /**
   * Select a calendar as the default for bookings
   */
  async selectCalendar(calendarId: string): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/google/calendars/select`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id,
        calendarId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to select calendar');
    }

    // Update local state
    await supabase
      .from('google_calendars')
      .update({ selected: false })
      .eq('user_id', userData.user.id);

    await supabase
      .from('google_calendars')
      .update({ selected: true })
      .eq('user_id', userData.user.id)
      .eq('calendar_id', calendarId);
  }

  /**
   * Disconnect Google Calendar
   */
  async disconnect(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/disconnect`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userData.user.id,
        provider: 'GOOGLE',
        providerType: 'calendar'
      })
    });

    if (!response.ok) {
      throw new Error('Failed to disconnect Google Calendar');
    }

    // Clean up local data
    await supabase
      .from('google_calendars')
      .delete()
      .eq('user_id', userData.user.id);

    await supabase
      .from('unipile_accounts')
      .delete()
      .eq('user_id', userData.user.id)
      .eq('provider', 'GOOGLE');
  }

  /**
   * Get user's bookings
   */
  async getUserBookings(limit = 50): Promise<Booking[]> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('user_id', userData.user.id)
      .order('start_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching bookings:', error);
      throw error;
    }

    return data || [];
  }

  /**
   * Get connection status for UI
   */
  async getConnectionStatus(): Promise<{
    connected: boolean;
    status?: string;
    email?: string;
    selectedCalendar?: GoogleCalendar;
    calendars: GoogleCalendar[];
  }> {
    try {
      const [account, calendars] = await Promise.all([
        this.getUserAccount(),
        this.getUserCalendars()
      ]);

      console.log('🔍 getConnectionStatus - Account:', account);
      console.log('🔍 getConnectionStatus - Calendars:', calendars);

      const selectedCalendar = calendars.find(cal => cal.selected);
      
      const connectionStatus = {
        connected: account?.status === 'connected',
        status: account?.status,
        email: account?.email,
        selectedCalendar,
        calendars
      };
      
      console.log('🔍 getConnectionStatus - Final Status:', connectionStatus);
      
      return connectionStatus;
    } catch (error) {
      console.error('❌ Error getting connection status:', error);
      return {
        connected: false,
        calendars: []
      };
    }
  }

  /**
   * Handle Unipile webhook notification (called by backend)
   */
  static async handleNotifyWebhook(payload: UnipileNotifyPayload): Promise<void> {
    const { status, account_id, name: userId } = payload;

    if (status === 'CREATION_SUCCESS') {
      // Store the account mapping
      const { error } = await supabase
        .from('unipile_accounts')
        .upsert({
          user_id: userId,
          provider: 'GOOGLE',
          account_id,
          status: 'connected'
        }, {
          onConflict: 'user_id,provider'
        });

      if (error) {
        console.error('Error storing Unipile account:', error);
        throw error;
      }
    } else if (status === 'CREATION_FAILED') {
      // Mark as disconnected
      await supabase
        .from('unipile_accounts')
        .update({ status: 'disconnected' })
        .eq('user_id', userId)
        .eq('provider', 'GOOGLE');
    } else if (status === 'CREDENTIALS_ERROR') {
      // Mark as needing reconnection
      await supabase
        .from('unipile_accounts')
        .update({ status: 'credentials_error' })
        .eq('user_id', userId)
        .eq('provider', 'GOOGLE');
    }
  }

  /**
   * Get Unipile account ID for n8n workflows
   */
  async getUnipileAccountForN8N(userId: string): Promise<{ account_id: string } | null> {
    const response = await fetch(`${this.backendUrl}/api/integrations/unipile/token-resolve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ user_id: userId })
    });

    if (!response.ok) {
      return null;
    }

    return await response.json();
  }
}

export const unipileService = new UnipileService();