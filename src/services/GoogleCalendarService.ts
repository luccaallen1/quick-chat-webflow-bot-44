import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  start: {
    dateTime: string;
    timeZone: string;
  };
  end: {
    dateTime: string;
    timeZone: string;
  };
  attendees?: Array<{
    email: string;
    displayName?: string;
  }>;
  location?: string;
  reminders?: {
    useDefault: boolean;
    overrides?: Array<{
      method: 'email' | 'popup';
      minutes: number;
    }>;
  };
}

interface BookingRequest {
  patientName: string;
  patientEmail?: string;
  patientPhone?: string;
  appointmentTime: Date;
  duration: number; // in minutes
  symptoms?: string;
  clinicName: string;
  clinicAddress: string;
  clinicPhone: string;
}

interface BookingResult {
  success: boolean;
  eventId?: string;
  eventLink?: string;
  message: string;
  error?: string;
}

export interface GoogleCredentials {
  id?: string;
  user_id: string;
  access_token: string;
  refresh_token: string;
  expires_at: string;
  scope: string;
  token_type: string;
  google_email: string;
  calendar_list?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GoogleCalendarInfo {
  id: string;
  summary: string;
  primary?: boolean;
  accessRole: string;
}

export class GoogleCalendarService {
  private baseUrl = 'https://www.googleapis.com/calendar/v3';
  private clientId = import.meta.env.REACT_APP_GOOGLE_CLIENT_ID;
  private clientSecret = import.meta.env.REACT_APP_GOOGLE_CLIENT_SECRET;
  private redirectUri = `${window.location.origin}/auth/google/callback`;

  // OAuth scopes needed for calendar access
  private scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/userinfo.email'
  ].join(' ');

  /**
   * Generate Google OAuth URL for user authorization
   */
  generateAuthUrl(): string {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: this.scopes,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent',
      state: this.generateState()
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleCredentials> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        grant_type: 'authorization_code',
        redirect_uri: this.redirectUri,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for tokens');
    }

    const tokens = await response.json();
    
    // Get user email
    const userInfo = await this.getUserInfo(tokens.access_token);
    
    // Get calendar list
    const calendars = await this.getCalendarList(tokens.access_token);

    const credentials: GoogleCredentials = {
      user_id: '', // Will be set by the calling function
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      scope: tokens.scope || this.scopes,
      token_type: tokens.token_type || 'Bearer',
      google_email: userInfo.email,
      calendar_list: JSON.stringify(calendars),
    };

    return credentials;
  }

  /**
   * Save Google credentials to Supabase
   */
  async saveCredentials(credentials: GoogleCredentials): Promise<GoogleCredentials> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    credentials.user_id = userData.user.id;

    const { data, error } = await supabase
      .from('google_credentials')
      .upsert([credentials], { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Error saving Google credentials:', error);
      throw error;
    }

    return data;
  }

  /**
   * Get user's Google credentials from Supabase
   */
  async getUserCredentials(): Promise<GoogleCredentials | null> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('google_credentials')
      .select('*')
      .eq('user_id', userData.user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No credentials found
        return null;
      }
      console.error('Error fetching Google credentials:', error);
      throw error;
    }

    return data;
  }

  /**
   * Check if access token is expired and refresh if needed
   */
  async getValidAccessToken(): Promise<string | null> {
    const credentials = await this.getUserCredentials();
    if (!credentials) {
      return null;
    }

    const expiresAt = new Date(credentials.expires_at);
    const now = new Date();
    
    // If token expires in less than 5 minutes, refresh it
    if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
      try {
        const refreshed = await this.refreshAccessToken(credentials.refresh_token);
        
        // Update credentials in database
        await supabase
          .from('google_credentials')
          .update({
            access_token: refreshed.access_token,
            expires_at: refreshed.expires_at,
          })
          .eq('user_id', credentials.user_id);

        return refreshed.access_token;
      } catch (error) {
        console.error('Failed to refresh token:', error);
        return null;
      }
    }

    return credentials.access_token;
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ access_token: string; expires_at: string }> {
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to refresh access token');
    }

    const tokens = await response.json();
    
    return {
      access_token: tokens.access_token,
      expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
    };
  }

  /**
   * Start OAuth flow by redirecting to Google
   */
  startOAuthFlow(): void {
    const authUrl = this.generateAuthUrl();
    window.location.href = authUrl;
  }

  /**
   * Disconnect Google Calendar (delete credentials)
   */
  async disconnect(): Promise<void> {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      throw new Error('User not authenticated');
    }

    const { error } = await supabase
      .from('google_credentials')
      .delete()
      .eq('user_id', userData.user.id);

    if (error) {
      console.error('Error deleting Google credentials:', error);
      throw error;
    }
  }

  /**
   * Get user info from Google API
   */
  private async getUserInfo(accessToken: string): Promise<{ email: string; name: string }> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get user info');
    }

    return await response.json();
  }

  /**
   * Get list of user's calendars
   */
  private async getCalendarList(accessToken: string): Promise<GoogleCalendarInfo[]> {
    const response = await fetch('https://www.googleapis.com/calendar/v3/users/me/calendarList', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get calendar list');
    }

    const data = await response.json();
    return data.items || [];
  }

  /**
   * Get user's calendars from stored credentials
   */
  async getUserCalendars(): Promise<GoogleCalendarInfo[]> {
    const credentials = await this.getUserCredentials();
    if (!credentials || !credentials.calendar_list) {
      return [];
    }

    try {
      return JSON.parse(credentials.calendar_list);
    } catch (error) {
      console.error('Error parsing calendar list:', error);
      return [];
    }
  }

  /**
   * Generate random state for OAuth security
   */
  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Create appointment in user's Google Calendar
  async createAppointment(bookingRequest: BookingRequest, accessToken: string): Promise<BookingResult> {
    try {
      const event = this.buildCalendarEvent(bookingRequest);

      const response = await fetch(`${this.baseUrl}/calendars/primary/events`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Calendar API error:', errorData);
        
        // Handle token expiration
        if (response.status === 401) {
          return {
            success: false,
            message: 'Your Google Calendar access has expired. Please sign in again.',
            error: 'token_expired'
          };
        }

        return {
          success: false,
          message: 'Failed to create calendar event. Please try again.',
          error: errorData.error?.message || 'Unknown error'
        };
      }

      const createdEvent = await response.json();

      return {
        success: true,
        eventId: createdEvent.id,
        eventLink: createdEvent.htmlLink,
        message: `Perfect! I've added your appointment to your Google Calendar for ${this.formatDateTime(bookingRequest.appointmentTime)} at ${bookingRequest.clinicName}. You'll receive a calendar notification reminder.`
      };

    } catch (error) {
      console.error('Error creating calendar event:', error);
      return {
        success: false,
        message: 'There was an issue connecting to Google Calendar. Please try again.',
        error: 'network_error'
      };
    }
  }

  // Check availability in user's calendar
  async checkAvailability(
    startTime: Date, 
    endTime: Date, 
    accessToken: string
  ): Promise<{ available: boolean; conflicts?: any[] }> {
    try {
      const response = await fetch(`${this.baseUrl}/freeBusy`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeMin: startTime.toISOString(),
          timeMax: endTime.toISOString(),
          items: [{ id: 'primary' }]
        }),
      });

      if (!response.ok) {
        console.error('FreeBusy API error:', await response.text());
        return { available: true }; // Assume available if we can't check
      }

      const data = await response.json();
      const busyTimes = data.calendars?.primary?.busy || [];

      return {
        available: busyTimes.length === 0,
        conflicts: busyTimes
      };

    } catch (error) {
      console.error('Error checking availability:', error);
      return { available: true }; // Assume available if we can't check
    }
  }

  // List upcoming appointments
  async getUpcomingAppointments(accessToken: string, maxResults: number = 10): Promise<any[]> {
    try {
      const now = new Date().toISOString();
      const response = await fetch(
        `${this.baseUrl}/calendars/primary/events?timeMin=${now}&maxResults=${maxResults}&singleEvents=true&orderBy=startTime`,
        {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        console.error('Error fetching events:', await response.text());
        return [];
      }

      const data = await response.json();
      return data.items || [];

    } catch (error) {
      console.error('Error getting appointments:', error);
      return [];
    }
  }

  // Update appointment
  async updateAppointment(
    eventId: string, 
    updates: Partial<BookingRequest>, 
    accessToken: string
  ): Promise<BookingResult> {
    try {
      // First get the existing event
      const getResponse = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!getResponse.ok) {
        return {
          success: false,
          message: 'Could not find the appointment to update.'
        };
      }

      const existingEvent = await getResponse.json();
      
      // Merge updates
      const updatedEvent = {
        ...existingEvent,
        summary: updates.clinicName ? `Chiropractic Appointment - ${updates.clinicName}` : existingEvent.summary,
        description: updates.symptoms ? `Patient: ${updates.patientName}\nSymptoms: ${updates.symptoms}` : existingEvent.description,
        location: updates.clinicAddress || existingEvent.location,
      };

      if (updates.appointmentTime) {
        const endTime = new Date(updates.appointmentTime.getTime() + (30 * 60 * 1000)); // 30 min default
        updatedEvent.start = {
          dateTime: updates.appointmentTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
        updatedEvent.end = {
          dateTime: endTime.toISOString(),
          timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        };
      }

      // Update the event
      const updateResponse = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!updateResponse.ok) {
        return {
          success: false,
          message: 'Failed to update the appointment.'
        };
      }

      const updated = await updateResponse.json();

      return {
        success: true,
        eventId: updated.id,
        eventLink: updated.htmlLink,
        message: 'Your appointment has been updated in Google Calendar!'
      };

    } catch (error) {
      console.error('Error updating appointment:', error);
      return {
        success: false,
        message: 'There was an issue updating your appointment.',
        error: 'update_error'
      };
    }
  }

  // Cancel appointment
  async cancelAppointment(eventId: string, accessToken: string): Promise<BookingResult> {
    try {
      const response = await fetch(`${this.baseUrl}/calendars/primary/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        return {
          success: false,
          message: 'Could not cancel the appointment. It may have already been removed.'
        };
      }

      return {
        success: true,
        message: 'Your appointment has been cancelled and removed from Google Calendar.'
      };

    } catch (error) {
      console.error('Error cancelling appointment:', error);
      return {
        success: false,
        message: 'There was an issue cancelling your appointment.'
      };
    }
  }

  private buildCalendarEvent(booking: BookingRequest): CalendarEvent {
    const endTime = new Date(booking.appointmentTime.getTime() + (booking.duration * 60 * 1000));
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

    const event: CalendarEvent = {
      summary: `Chiropractic Appointment - ${booking.clinicName}`,
      description: `Patient: ${booking.patientName}\n` +
                  `Phone: ${booking.patientPhone || 'Not provided'}\n` +
                  `Email: ${booking.patientEmail || 'Not provided'}\n` +
                  `Symptoms: ${booking.symptoms || 'General consultation'}\n\n` +
                  `Clinic: ${booking.clinicName}\n` +
                  `Address: ${booking.clinicAddress}\n` +
                  `Clinic Phone: ${booking.clinicPhone}\n\n` +
                  `Please arrive 15 minutes early for check-in.`,
      start: {
        dateTime: booking.appointmentTime.toISOString(),
        timeZone: timeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: timeZone,
      },
      location: `${booking.clinicName}, ${booking.clinicAddress}`,
      reminders: {
        useDefault: false,
        overrides: [
          { method: 'email', minutes: 24 * 60 }, // 1 day before
          { method: 'popup', minutes: 60 }, // 1 hour before
        ],
      },
    };

    // Add attendees if patient email is provided
    if (booking.patientEmail) {
      event.attendees = [
        {
          email: booking.patientEmail,
          displayName: booking.patientName,
        },
      ];
    }

    return event;
  }

  private formatDateTime(date: Date): string {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  }
}

export default GoogleCalendarService;