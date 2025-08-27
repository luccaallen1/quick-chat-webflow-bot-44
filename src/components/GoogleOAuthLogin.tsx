import React, { useState, useEffect } from 'react';
import { User, Calendar, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { GoogleOAuthService } from '../services/GoogleOAuthService';

interface GoogleOAuthLoginProps {
  onAuthSuccess: (accessToken: string, userProfile: any) => void;
  onAuthError: (error: string) => void;
}

interface UserProfile {
  email: string;
  name: string;
  picture?: string;
}

export const GoogleOAuthLogin: React.FC<GoogleOAuthLoginProps> = ({
  onAuthSuccess,
  onAuthError
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string>('');

  // Initialize OAuth service
  const oauthService = new GoogleOAuthService({
    clientId: process.env.REACT_APP_GOOGLE_CLIENT_ID,
    clientSecret: process.env.REACT_APP_GOOGLE_CLIENT_SECRET,
    redirectUri: window.location.origin + '/agent' // Current page as redirect
  });

  useEffect(() => {
    checkExistingAuth();
    handleOAuthCallback();
  }, []);

  const checkExistingAuth = async () => {
    const storedTokens = oauthService.getStoredTokens();
    const storedProfile = oauthService.getStoredUserProfile();

    if (storedTokens.accessToken && storedProfile) {
      // Validate token is still valid
      const isValid = await oauthService.validateToken(storedTokens.accessToken);
      
      if (isValid) {
        setIsAuthenticated(true);
        setUserProfile(storedProfile);
        onAuthSuccess(storedTokens.accessToken, storedProfile);
      } else {
        // Try to refresh token
        if (storedTokens.refreshToken) {
          await refreshToken(storedTokens.refreshToken);
        } else {
          // Clear invalid tokens
          oauthService.clearStoredTokens();
        }
      }
    }
  };

  const handleOAuthCallback = async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const authCode = urlParams.get('code');
    const error = urlParams.get('error');

    if (error) {
      setAuthError(`OAuth error: ${error}`);
      onAuthError(`OAuth error: ${error}`);
      return;
    }

    if (authCode && !isAuthenticated) {
      setIsLoading(true);
      try {
        const tokenResult = await oauthService.exchangeCodeForToken(authCode);
        
        if (tokenResult.success && tokenResult.accessToken) {
          // Get user profile
          const profile = await oauthService.getUserProfile(tokenResult.accessToken);
          
          if (profile) {
            // Store tokens and profile
            oauthService.storeTokens(tokenResult.accessToken, tokenResult.refreshToken);
            oauthService.storeUserProfile(profile);
            
            setIsAuthenticated(true);
            setUserProfile(profile);
            setAuthError('');
            
            onAuthSuccess(tokenResult.accessToken, profile);
            
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            throw new Error('Failed to get user profile');
          }
        } else {
          throw new Error(tokenResult.error || 'Failed to authenticate');
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
        setAuthError(errorMessage);
        onAuthError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const refreshToken = async (refreshToken: string) => {
    try {
      const result = await oauthService.refreshAccessToken(refreshToken);
      
      if (result.success && result.accessToken) {
        oauthService.storeTokens(result.accessToken, result.refreshToken);
        
        const profile = await oauthService.getUserProfile(result.accessToken);
        if (profile) {
          setIsAuthenticated(true);
          setUserProfile(profile);
          onAuthSuccess(result.accessToken, profile);
        }
      } else {
        oauthService.clearStoredTokens();
        setAuthError('Session expired. Please sign in again.');
      }
    } catch (error) {
      oauthService.clearStoredTokens();
      setAuthError('Session expired. Please sign in again.');
    }
  };

  const handleLogin = () => {
    const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;
    const redirectUri = window.location.origin + '/agent';
    
    console.log('OAuth Configuration:', {
      clientId,
      redirectUri,
      currentUrl: window.location.href
    });
    
    // Build OAuth URL manually to ensure it's correct
    const scopes = [
      'https://www.googleapis.com/auth/calendar',
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile'
    ].join(' ');
    
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` + new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      scope: scopes,
      response_type: 'code',
      access_type: 'offline',
      prompt: 'consent'
    }).toString();
    
    console.log('Generated OAuth URL:', authUrl);
    
    setIsLoading(true);
    setAuthError('');
    
    // Test if we can reach the URL
    window.location.href = authUrl;
  };

  const handleLogout = async () => {
    const tokens = oauthService.getStoredTokens();
    
    if (tokens.accessToken) {
      await oauthService.revokeToken(tokens.accessToken);
    }
    
    oauthService.clearStoredTokens();
    setIsAuthenticated(false);
    setUserProfile(null);
    setAuthError('');
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Connecting to Google Calendar...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated && userProfile) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              {userProfile.picture ? (
                <img 
                  src={userProfile.picture} 
                  alt={userProfile.name}
                  className="w-10 h-10 rounded-full"
                />
              ) : (
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
              )}
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white flex items-center justify-center">
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </div>
            </div>
            <div>
              <p className="font-semibold text-gray-900">{userProfile.name}</p>
              <p className="text-xs text-gray-600">{userProfile.email}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
              <Calendar className="w-3 h-3" />
              <span>Calendar Connected</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-600 transition-colors"
              title="Disconnect Google Calendar"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      {authError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5" />
          <div>
            <p className="text-sm text-red-800 font-medium">Authentication Error</p>
            <p className="text-xs text-red-600">{authError}</p>
          </div>
        </div>
      )}
      
      <div className="text-center">
        <div className="mb-4">
          <Calendar className="w-12 h-12 text-blue-600 mx-auto mb-2" />
          <h3 className="font-semibold text-gray-900 mb-1">Connect Google Calendar</h3>
          <p className="text-sm text-gray-600">
            Allow us to book appointments directly into your Google Calendar for seamless scheduling.
          </p>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Connect with Google
        </button>
        
        <div className="mt-3 text-xs text-gray-500">
          <div className="flex items-center justify-center gap-4">
            <span>✓ Secure OAuth 2.0</span>
            <span>✓ Calendar permissions only</span>
            <span>✓ Revoke anytime</span>
          </div>
        </div>
      </div>
    </div>
  );
};