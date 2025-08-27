import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { GoogleCalendarService } from '@/services/googleCalendarService';

const GoogleCallback: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Connecting your Google Calendar...');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Check if user is authenticated
        if (!user) {
          setStatus('error');
          setMessage('Please sign in first to connect Google Calendar');
          setTimeout(() => navigate('/saas'), 3000);
          return;
        }

        // Get authorization code from URL
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');
        const error = urlParams.get('error');

        if (error) {
          setStatus('error');
          setMessage(`Authorization failed: ${error}`);
          setTimeout(() => navigate('/saas'), 3000);
          return;
        }

        if (!code) {
          setStatus('error');
          setMessage('No authorization code received');
          setTimeout(() => navigate('/saas'), 3000);
          return;
        }

        // Exchange code for tokens
        const calendarService = new GoogleCalendarService();
        const credentials = await calendarService.exchangeCodeForTokens(code);
        
        // Save credentials to database
        await calendarService.saveCredentials(credentials);

        setStatus('success');
        setMessage('Google Calendar connected successfully!');
        
        // Redirect back to SaaS page after short delay
        setTimeout(() => navigate('/saas'), 2000);

      } catch (error) {
        console.error('Google OAuth callback error:', error);
        setStatus('error');
        setMessage('Failed to connect Google Calendar. Please try again.');
        setTimeout(() => navigate('/saas'), 3000);
      }
    };

    handleCallback();
  }, [user, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {status === 'success' && (
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          )}
          
          {status === 'error' && (
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          )}
        </div>

        <h2 className="text-xl font-semibold text-gray-900 mb-2">
          {status === 'loading' && 'Connecting Google Calendar'}
          {status === 'success' && 'Connection Successful'}
          {status === 'error' && 'Connection Failed'}
        </h2>

        <p className="text-gray-600 mb-4">{message}</p>

        {status === 'success' && (
          <div className="text-sm text-gray-500">
            Redirecting you back to the configuration page...
          </div>
        )}

        {status === 'error' && (
          <div className="text-sm text-gray-500">
            You'll be redirected back to try again...
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleCallback;