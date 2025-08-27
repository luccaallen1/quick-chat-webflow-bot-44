import { GoogleAuth } from 'google-auth-library';

interface GoogleOAuthConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

interface AuthResult {
  success: boolean;
  accessToken?: string;
  refreshToken?: string;
  error?: string;
}

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

export class GoogleOAuthService {
  private config: GoogleOAuthConfig;
  private authUrl: string;

  constructor(config: GoogleOAuthConfig) {
    this.config = config;
    this.authUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  }

  // Generate OAuth URL for user authorization
  getAuthorizationUrl(): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      scope: [
        'https://www.googleapis.com/auth/calendar',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
      ].join(' '),
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    });

    return `${this.authUrl}?${params.toString()}`;
  }

  // Exchange authorization code for access token
  async exchangeCodeForToken(authorizationCode: string): Promise<AuthResult> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          code: authorizationCode,
          grant_type: 'authorization_code',
          redirect_uri: this.config.redirectUri,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_description || 'Failed to exchange code for token'
        };
      }

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token
      };

    } catch (error) {
      console.error('OAuth token exchange error:', error);
      return {
        success: false,
        error: 'Network error during token exchange'
      };
    }
  }

  // Get user profile information
  async getUserProfile(accessToken: string): Promise<UserProfile | null> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profile = await response.json();
      
      return {
        email: profile.email,
        name: profile.name,
        picture: profile.picture
      };

    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  // Refresh access token using refresh token
  async refreshAccessToken(refreshToken: string): Promise<AuthResult> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: refreshToken,
          grant_type: 'refresh_token',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          error: data.error_description || 'Failed to refresh token'
        };
      }

      return {
        success: true,
        accessToken: data.access_token,
        refreshToken: data.refresh_token || refreshToken // Keep existing refresh token if not provided
      };

    } catch (error) {
      console.error('Token refresh error:', error);
      return {
        success: false,
        error: 'Network error during token refresh'
      };
    }
  }

  // Revoke access token (logout)
  async revokeToken(token: string): Promise<boolean> {
    try {
      const response = await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      return response.ok;

    } catch (error) {
      console.error('Token revoke error:', error);
      return false;
    }
  }

  // Check if token is still valid
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      const response = await fetch(`https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=${accessToken}`);
      return response.ok;
    } catch {
      return false;
    }
  }

  // Store tokens securely (in production, use secure backend storage)
  storeTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('google_access_token', accessToken);
    if (refreshToken) {
      localStorage.setItem('google_refresh_token', refreshToken);
    }
  }

  // Retrieve stored tokens
  getStoredTokens(): { accessToken?: string; refreshToken?: string } {
    return {
      accessToken: localStorage.getItem('google_access_token') || undefined,
      refreshToken: localStorage.getItem('google_refresh_token') || undefined
    };
  }

  // Clear stored tokens
  clearStoredTokens(): void {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_refresh_token');
    localStorage.removeItem('google_user_profile');
  }

  // Store user profile
  storeUserProfile(profile: UserProfile): void {
    localStorage.setItem('google_user_profile', JSON.stringify(profile));
  }

  // Get stored user profile
  getStoredUserProfile(): UserProfile | null {
    const stored = localStorage.getItem('google_user_profile');
    return stored ? JSON.parse(stored) : null;
  }
}

export default GoogleOAuthService;