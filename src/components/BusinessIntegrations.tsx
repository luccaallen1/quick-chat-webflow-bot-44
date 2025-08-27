import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { CalendarStatusBadge } from '@/components/CalendarStatusBadge';
import { unipileService } from '@/services/unipileService';
import { configService } from '@/services/configService';

interface BusinessIntegrationsProps {
  configurationId?: string;
  onIntegrationChange?: (status: boolean) => void;
  className?: string;
}

export const BusinessIntegrations: React.FC<BusinessIntegrationsProps> = ({
  configurationId,
  onIntegrationChange,
  className = ''
}) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState({
    connected: false,
    status: 'none',
    email: '',
    calendars: []
  });
  const [availableCalendars, setAvailableCalendars] = useState([]);
  const [selectedCalendar, setSelectedCalendar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [calendarsLoading, setCalendarsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkConnectionStatus();
    }
  }, [user, configurationId]);

  // Fetch calendars when connection status changes to connected
  useEffect(() => {
    if (connectionStatus.connected && user) {
      fetchAvailableCalendars();
    }
  }, [connectionStatus.connected, user]);

  const checkConnectionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Check integration status using the unified endpoint
      let status = null;
      
      try {
        const response = await fetch('http://localhost:3001/api/integrations/get-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            userId: user.id, 
            sessionId: user.id,
            configId: configurationId 
          })
        });
        
        if (response.ok) {
          const statusData = await response.json();
          console.log('🔍 BusinessIntegrations - Status data:', statusData);
          
          status = {
            connected: statusData.google_calendar_connected || false,
            status: statusData.integration_status || 'none',
            email: statusData.integrations?.google_calendar?.email || '',
            account_id: statusData.integrations?.google_calendar?.account_id || '',
            calendars: []
          };
          
          console.log('🔍 BusinessIntegrations - Processed status:', status);
        }
      } catch (statusError) {
        console.log('🔍 Status check failed, falling back to unipileService:', statusError.message);
      }
      
      // Fallback to unipileService if status check didn't work
      if (!status) {
        status = await unipileService.getConnectionStatus();
        console.log('🔍 BusinessIntegrations - Fallback status from unipileService:', status);
      }
      
      setConnectionStatus(status);
      
      // Notify parent component of integration status
      if (onIntegrationChange) {
        onIntegrationChange(status.connected);
      }
      
    } catch (error) {
      console.error('❌ BusinessIntegrations - Error checking connection:', error);
      setConnectionStatus({
        connected: false,
        status: 'error',
        email: '',
        calendars: []
      });
    } finally {
      setLoading(false);
    }
  };

  const syncIntegrationToConfig = async (configId: string, status: any) => {
    try {
      console.log('🔄 Syncing integration data to config:', configId, status);
      
      if (configId && configId !== 'default') {
        // Update specific configuration with integration data
        await configService.updateIntegrationFields(configId, {
          googleCalendarConnected: status.connected,
          googleCalendarAccountId: status.account_id || null,
          googleCalendarEmail: status.email || null,
          integrationStatus: status.connected ? 'partial' : 'none',
          connectedIntegrations: status.connected ? {
            google_calendar: {
              connected: true,
              account_id: status.account_id,
              email: status.email,
              status: status.status
            }
          } : {}
        });
        console.log('✅ Successfully synced integration data to configuration');
      } else {
        // For default configuration, just sync to user's integration table
        await configService.syncIntegrationToConfig(configId || 'default', status);
        console.log('✅ Successfully synced integration data to default configuration');
      }
    } catch (error) {
      console.error('❌ Error syncing integration to config:', error);
    }
  };

  const fetchAvailableCalendars = async () => {
    if (!user) return;

    try {
      setCalendarsLoading(true);
      console.log('📅 Fetching available calendars for user:', user.id);

      const response = await fetch('http://localhost:3001/api/integrations/calendars/list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ Calendars fetched:', data);
        
        setAvailableCalendars(data.calendars || []);
        
        // Check if there's already a selected calendar in the business configuration
        try {
          const configResponse = await configService.getBotConfiguration(user.id);
          if (configResponse?.booking_calendar_id) {
            const existingCalendar = data.calendars?.find(cal => 
              cal.calendar_id === configResponse.booking_calendar_id
            );
            if (existingCalendar) {
              setSelectedCalendar(existingCalendar);
              console.log('📌 Found existing calendar selection:', existingCalendar.name);
            }
          } else {
            // Auto-select primary calendar if no selection exists
            const primaryCalendar = data.calendars?.find(cal => cal.primary);
            if (primaryCalendar) {
              setSelectedCalendar(primaryCalendar);
              console.log('🎯 Auto-selected primary calendar:', primaryCalendar.name);
            }
          }
        } catch (configError) {
          console.log('⚠️  Could not check existing calendar selection:', configError.message);
        }
        
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to fetch calendars:', response.status, errorData);
        alert('Failed to load calendars. Please try refreshing the page.');
      }
    } catch (error) {
      console.error('❌ Error fetching calendars:', error);
      alert('Failed to load calendars. Please check your connection.');
    } finally {
      setCalendarsLoading(false);
    }
  };

  const handleCalendarSelect = async (calendar) => {
    if (!user || !calendar) return;

    try {
      console.log('📅 Selecting calendar:', calendar);
      
      const response = await fetch('http://localhost:3001/api/integrations/calendars/select', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          calendarId: calendar.calendar_id,
          calendarName: calendar.name,
          configId: configurationId
        })
      });

      if (response.ok) {
        setSelectedCalendar(calendar);
        console.log('✅ Calendar selection saved:', calendar.name);
        
        // Optional: Show success message
        // alert(`Calendar "${calendar.name}" selected successfully!`);
      } else {
        const errorData = await response.text();
        console.error('❌ Failed to save calendar selection:', errorData);
        alert('Failed to save calendar selection. Please try again.');
      }
    } catch (error) {
      console.error('❌ Error selecting calendar:', error);
      alert('Failed to save calendar selection. Please try again.');
    }
  };

  const handleConnect = async () => {
    if (!user) {
      console.error('❌ BusinessIntegrations - No user found');
      alert('Please sign in first to connect Google Calendar.');
      return;
    }

    try {
      setConnecting(true);
      console.log('🚀 Connecting Google Calendar for user:', user.id);
      
      // Simple call to backend
      const response = await fetch('http://localhost:3001/api/integrations/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || error.error || 'Failed to get auth URL');
      }

      const { url } = await response.json();
      console.log('🌐 Redirecting to Unipile auth:', url);
      
      // Redirect to Unipile hosted auth
      window.location.href = url;
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      alert(`Failed to connect Google Calendar: ${error.message}`);
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!user) return;

    if (!confirm('Are you sure you want to disconnect Google Calendar? This will affect your booking functionality.')) {
      return;
    }

    try {
      setLoading(true);
      await unipileService.disconnect();
      
      setConnectionStatus({
        connected: false,
        status: 'none',
        email: '',
        calendars: []
      });

      if (onIntegrationChange) {
        onIntegrationChange(false);
      }

      alert('Google Calendar disconnected successfully');
    } catch (error) {
      console.error('❌ BusinessIntegrations - Disconnect error:', error);
      alert('Failed to disconnect Google Calendar. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshCalendars = async () => {
    if (!user || !connectionStatus.connected) return;

    try {
      setLoading(true);
      const calendars = await unipileService.refreshCalendars();
      setConnectionStatus(prev => ({
        ...prev,
        calendars
      }));
      alert('Calendars refreshed successfully');
    } catch (error) {
      console.error('❌ BusinessIntegrations - Refresh error:', error);
      alert('Failed to refresh calendars. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = () => {
    if (connectionStatus.connected) return 'bg-green-50 border-green-200';
    if (connectionStatus.status === 'error') return 'bg-red-50 border-red-200';
    return 'bg-gray-50 border-gray-200';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Business Integrations</h4>
        <CalendarStatusBadge className="text-sm" />
      </div>

      {/* Google Calendar Integration */}
      <div className={`p-4 rounded-lg border-2 ${getStatusColor()}`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-900">Google Calendar</h5>
              <p className="text-sm text-gray-600">
                {connectionStatus.connected ? 
                  `Connected${connectionStatus.email ? ` as ${connectionStatus.email}` : ' (Account verified)'}` :
                  'Connect your Google Calendar for automated booking'
                }
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {connectionStatus.connected ? (
              <>
                <button
                  onClick={handleRefreshCalendars}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50"
                >
                  {loading ? 'Refreshing...' : 'Refresh'}
                </button>
                <button
                  onClick={handleDisconnect}
                  disabled={loading}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200 disabled:opacity-50"
                >
                  {loading ? 'Disconnecting...' : 'Disconnect'}
                </button>
              </>
            ) : (
              <button
                onClick={handleConnect}
                disabled={connecting || loading}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {connecting ? 'Connecting...' : 'Connect Calendar'}
              </button>
            )}
          </div>
        </div>

        {/* Connection Details */}
        {connectionStatus.connected && (
          <div className="mt-3 p-3 bg-white rounded border">
            <h6 className="text-sm font-medium text-gray-700 mb-2">Integration Details:</h6>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 text-green-600 font-medium">✅ Connected</span>
              </div>
              <div>
                <span className="text-gray-500">Email:</span>
                <span className="ml-2 text-gray-900">{connectionStatus.email || 'Account verified'}</span>
              </div>
              <div>
                <span className="text-gray-500">Calendars:</span>
                <span className="ml-2 text-gray-900">{availableCalendars.length} available</span>
              </div>
              <div>
                <span className="text-gray-500">Config:</span>
                <span className="ml-2 text-gray-900">{configurationId || 'Default'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Selection */}
        {connectionStatus.connected && (
          <div className="mt-3 p-3 bg-green-50 rounded border border-green-200">
            <h6 className="text-sm font-medium text-green-800 mb-2">📅 Calendar for Bookings</h6>
            
            {calendarsLoading ? (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span>Loading calendars...</span>
              </div>
            ) : availableCalendars.length > 0 ? (
              <div className="space-y-2">
                <p className="text-xs text-green-700">Select which calendar to use for appointment bookings:</p>
                <select 
                  className="w-full px-3 py-2 text-sm border border-green-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
                  value={selectedCalendar?.calendar_id || ''}
                  onChange={(e) => {
                    const calendar = availableCalendars.find(cal => cal.calendar_id === e.target.value);
                    if (calendar) handleCalendarSelect(calendar);
                  }}
                >
                  <option value="">Select a calendar...</option>
                  {availableCalendars.map(calendar => (
                    <option key={calendar.calendar_id} value={calendar.calendar_id}>
                      {calendar.name} {calendar.primary ? '(Primary)' : ''}
                    </option>
                  ))}
                </select>
                
                {selectedCalendar && (
                  <div className="mt-2 p-2 bg-white rounded border border-green-200">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-sm font-medium text-green-800">
                        Selected: {selectedCalendar.name}
                      </span>
                      {selectedCalendar.primary && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">Primary</span>
                      )}
                    </div>
                    {selectedCalendar.time_zone && (
                      <p className="text-xs text-green-600 mt-1">Time Zone: {selectedCalendar.time_zone}</p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-sm text-orange-700">
                <p>⚠️ No calendars found. Please check your Google Calendar permissions.</p>
                <button 
                  onClick={fetchAvailableCalendars}
                  className="mt-2 px-3 py-1 text-xs bg-orange-100 text-orange-700 rounded hover:bg-orange-200"
                >
                  Retry Loading Calendars
                </button>
              </div>
            )}
          </div>
        )}

        {/* Integration Benefits */}
        {!connectionStatus.connected && (
          <div className="mt-3 p-3 bg-blue-50 rounded border border-blue-200">
            <h6 className="text-sm font-medium text-blue-800 mb-1">Why Connect Google Calendar?</h6>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Automatic appointment booking directly to your calendar</li>
              <li>• Real-time availability checking for customers</li>
              <li>• Seamless integration with your existing workflow</li>
              <li>• Reduce double bookings and scheduling conflicts</li>
            </ul>
          </div>
        )}
      </div>

      {/* Future Integrations Placeholder */}
      <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-75">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">✉️</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-600">Email Integration</h5>
              <p className="text-sm text-gray-500">Gmail, Outlook, IMAP (Coming Soon)</p>
            </div>
          </div>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
          >
            Coming Soon
          </button>
        </div>
      </div>

      <div className="p-4 rounded-lg border-2 border-gray-200 bg-gray-50 opacity-75">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <span className="text-xl">💬</span>
            </div>
            <div>
              <h5 className="font-medium text-gray-600">Messaging Integration</h5>
              <p className="text-sm text-gray-500">WhatsApp, Instagram, Facebook (Coming Soon)</p>
            </div>
          </div>
          <button
            disabled
            className="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed text-sm"
          >
            Coming Soon
          </button>
        </div>
      </div>

      {/* Integration Status Summary */}
      <div className="mt-4 p-3 bg-blue-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <span className="text-blue-800 font-medium">Integration Status:</span>
          <span className={`px-2 py-1 rounded text-sm font-medium ${
            connectionStatus.connected ? 
            'bg-green-100 text-green-800' : 
            'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus.connected ? 
              'Ready for Automated Booking' : 
              'Manual Configuration Only'
            }
          </span>
        </div>
        <p className="text-sm text-blue-700 mt-1">
          {connectionStatus.connected ? 
            'Your chatbot can now automatically book appointments and check availability.' :
            'Connect integrations to enable automated booking and enhanced functionality.'
          }
        </p>
      </div>
    </div>
  );
};