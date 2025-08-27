import React, { useState, useEffect } from 'react';
import { unipileService, UnipileAccount, GoogleCalendar } from '@/services/unipileService';
import { useAuth } from '@/contexts/AuthContext';

interface GoogleCalendarConnectionProps {
  onConnectionChange?: (connected: boolean) => void;
}

export const GoogleCalendarConnection: React.FC<GoogleCalendarConnectionProps> = ({ 
  onConnectionChange 
}) => {
  const { user } = useAuth();
  const [account, setAccount] = useState<UnipileAccount | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  const [selectedCalendar, setSelectedCalendar] = useState<GoogleCalendar | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadConnectionStatus();
  }, [user]);

  const loadConnectionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const status = await unipileService.getConnectionStatus();
      
      setAccount(status.connected ? {
        id: '',
        user_id: user.id,
        provider: 'GOOGLE',
        account_id: '',
        status: status.status as any,
        email: status.email,
        created_at: '',
        updated_at: ''
      } : null);
      
      setCalendars(status.calendars);
      setSelectedCalendar(status.selectedCalendar || null);
      onConnectionChange?.(status.connected);
      setError('');
    } catch (error) {
      console.error('Error loading connection status:', error);
      setError('Failed to load Google Calendar connection');
      onConnectionChange?.(false);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    if (!user) {
      setError('Please sign in first to connect Google Calendar');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Get hosted auth URL from backend
      const authResponse = await unipileService.initGoogleConnection(user.id);
      
      // Redirect to Unipile hosted auth
      window.location.href = authResponse.url;
    } catch (error) {
      console.error('Error connecting Google Calendar:', error);
      setError('Failed to start Google Calendar connection');
      setLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Are you sure you want to disconnect Google Calendar?')) {
      return;
    }

    try {
      setLoading(true);
      await unipileService.disconnect();
      setAccount(null);
      setCalendars([]);
      setSelectedCalendar(null);
      onConnectionChange?.(false);
      setError('');
    } catch (error) {
      console.error('Error disconnecting Google Calendar:', error);
      setError('Failed to disconnect Google Calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleCalendarSelect = async (calendarId: string) => {
    try {
      setLoading(true);
      await unipileService.selectCalendar(calendarId);
      
      // Update local state
      const updated = calendars.map(cal => ({
        ...cal,
        selected: cal.calendar_id === calendarId
      }));
      setCalendars(updated);
      setSelectedCalendar(updated.find(cal => cal.selected) || null);
    } catch (error) {
      console.error('Error selecting calendar:', error);
      setError('Failed to select calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCalendars = async () => {
    try {
      setLoading(true);
      const refreshedCalendars = await unipileService.refreshCalendars();
      setCalendars(refreshedCalendars);
      setSelectedCalendar(refreshedCalendars.find(cal => cal.selected) || null);
    } catch (error) {
      console.error('Error refreshing calendars:', error);
      setError('Failed to refresh calendars');
    } finally {
      setLoading(false);
    }
  };

  const getConnectionStatus = () => {
    if (!account) return 'disconnected';
    
    if (account.status === 'credentials_error') return 'expired';
    if (account.status === 'connected') return 'connected';
    return 'disconnected';
  };

  const status = getConnectionStatus();

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Enhanced Status Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center transition-colors ${
            status === 'connected' ? 'bg-gradient-to-r from-green-500 to-blue-500' :
            status === 'expired' ? 'bg-gradient-to-r from-yellow-500 to-orange-500' :
            'bg-gradient-to-r from-gray-400 to-gray-500'
          }`}>
            <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z"/>
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-lg text-gray-900">Google Calendar Integration</h3>
            <p className="text-sm text-gray-600">
              {status === 'connected' ? 'Active - Calendar data included in all chat messages' :
               status === 'expired' ? 'Expired - Reconnect to restore calendar features' :
               'Connect to enable automatic appointment booking'}
            </p>
          </div>
        </div>
        
        {/* Large Status Indicator */}
        <div className="text-right">
          <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-semibold ${
            status === 'connected' ? 'bg-green-100 text-green-800 border border-green-200' : 
            status === 'expired' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' : 
            'bg-gray-100 text-gray-600 border border-gray-200'
          }`}>
            <div className={`w-2 h-2 rounded-full mr-2 ${
              status === 'connected' ? 'bg-green-500' : 
              status === 'expired' ? 'bg-yellow-500' : 'bg-gray-400'
            }`}></div>
            {status === 'connected' ? '🟢 CONNECTED' :
             status === 'expired' ? '🟡 EXPIRED' : '⚫ DISCONNECTED'}
          </div>
          {status === 'connected' && (
            <p className="text-xs text-gray-500 mt-1">Webhooks enhanced</p>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {account && (
        <div className={`mb-6 p-5 rounded-lg border-2 ${
          status === 'connected' ? 'bg-green-50 border-green-200' : 
          status === 'expired' ? 'bg-yellow-50 border-yellow-200' : 
          'bg-gray-50 border-gray-200'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${
                status === 'connected' ? 'bg-green-500' : 
                status === 'expired' ? 'bg-yellow-500' : 'bg-gray-400'
              }`}></div>
              <span className={`text-sm font-semibold ${
                status === 'connected' ? 'text-green-800' : 
                status === 'expired' ? 'text-yellow-800' : 'text-gray-700'
              }`}>
                Connected as: {account.email}
              </span>
            </div>
            <div className="text-right">
              <span className={`text-xs font-medium px-2 py-1 rounded ${
                status === 'connected' ? 'bg-green-100 text-green-700' : 
                status === 'expired' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-600'
              }`}>
                {calendars.length} calendar{calendars.length !== 1 ? 's' : ''} available
              </span>
            </div>
          </div>
          
          {status === 'connected' && (
            <div className="bg-white bg-opacity-60 p-3 rounded border border-green-200 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm font-medium text-green-800">✅ Integration Status:</span>
              </div>
              <ul className="text-xs text-green-700 space-y-1">
                <li>• Calendar data automatically sent in all chat messages</li>
                <li>• n8n workflows can access appointment booking features</li>
                <li>• Real-time calendar availability checking enabled</li>
              </ul>
            </div>
          )}
          
          {selectedCalendar && (
            <div className={`text-sm mb-2 flex items-center space-x-2 ${
              status === 'connected' ? 'text-green-700' : 'text-yellow-700'
            }`}>
              <span>📅 Selected Calendar:</span>
              <strong>{selectedCalendar.summary}</strong>
              {selectedCalendar.primary_calendar && (
                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Primary</span>
              )}
            </div>
          )}
          
          {status === 'expired' && (
            <div className="bg-yellow-100 p-3 rounded border border-yellow-300 text-sm text-yellow-800">
              ⚠️ <strong>Access Expired:</strong> Your Google Calendar connection has expired. 
              Reconnect now to restore automatic booking and calendar features in chat messages.
            </div>
          )}
        </div>
      )}

      <div className="flex space-x-3">
        {!account || status === 'expired' ? (
          <button
            onClick={handleConnect}
            disabled={loading || !user}
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                <span>{status === 'expired' ? 'Reconnect' : 'Connect'} Google Calendar</span>
              </>
            )}
          </button>
        ) : (
          <>
            <button
              onClick={handleRefreshCalendars}
              disabled={loading}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                  </svg>
                  <span>Refresh</span>
                </>
              )}
            </button>
            <button
              onClick={handleDisconnect}
              disabled={loading}
              className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11H7v-2h10v2z"/>
                  </svg>
                  <span>Disconnect</span>
                </>
              )}
            </button>
          </>
        )}
      </div>

      {!user && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          Please sign in to connect Google Calendar
        </div>
      )}

      {account && calendars.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-700">Select Calendar for Bookings:</h4>
          </div>
          <div className="space-y-2">
            {calendars.map((calendar) => (
              <div 
                key={calendar.calendar_id} 
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  calendar.selected 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => handleCalendarSelect(calendar.calendar_id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      calendar.selected ? 'bg-blue-500' : 'bg-gray-300'
                    }`} />
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {calendar.summary}
                      </div>
                      {calendar.primary_calendar && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                          Primary
                        </span>
                      )}
                    </div>
                  </div>
                  {calendar.selected && (
                    <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};