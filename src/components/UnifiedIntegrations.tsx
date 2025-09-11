import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ConnectionStatus {
  total_connections: number;
  connected_providers: Array<{
    provider: string;
    provider_type: string;
    display_name: string;
    email?: string;
    username?: string;
    connected_at: string;
  }>;
  available_providers: Array<{
    provider: string;
    provider_type: string;
    display_name: string;
    description: string;
  }>;
}

interface UnifiedIntegrationsProps {
  configurationId?: string;
}

export const UnifiedIntegrations: React.FC<UnifiedIntegrationsProps> = ({ configurationId }) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadConnectionStatus();
    }
  }, [user]);

  const loadConnectionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/integrations/get-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('📊 Integration status loaded:', data);
        
        // Convert the old format to the new unified format
        const unifiedStatus: ConnectionStatus = {
          total_connections: (data.google_calendar_connected ? 1 : 0) + (data.instagram_connected ? 1 : 0),
          connected_providers: [],
          available_providers: []
        };

        // Add connected providers
        if (data.integrations?.google_calendar?.connected) {
          unifiedStatus.connected_providers.push({
            provider: 'GOOGLE',
            provider_type: 'calendar',
            display_name: 'Google Calendar',
            email: data.integrations.google_calendar.email,
            connected_at: new Date().toISOString()
          });
        }

        if (data.integrations?.instagram?.connected) {
          unifiedStatus.connected_providers.push({
            provider: 'INSTAGRAM',
            provider_type: 'messaging',
            display_name: 'Instagram',
            username: data.integrations.instagram.username,
            connected_at: new Date().toISOString()
          });
        }

        setConnectionStatus(unifiedStatus);
      }
    } catch (error) {
      console.error('❌ Failed to load integration status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnectAccount = async () => {
    if (!user) {
      alert('Please sign in first to connect accounts.');
      return;
    }

    try {
      setConnecting(true);
      console.log('🚀 Opening Unipile connection wizard for user:', user.id);
      
      // Call backend to generate hosted auth URL with all supported providers
      const response = await fetch('http://localhost:3001/api/integrations/hosted-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id,
          providers: ["GOOGLE", "LINKEDIN", "WHATSAPP", "INSTAGRAM", "MESSENGER", "TELEGRAM"], // Explicitly list supported providers
          successRedirect: `${window.location.origin}/integrations/success`,
          failureRedirect: `${window.location.origin}/integrations/failure`
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.details || error.error || 'Failed to get auth URL');
      }

      const { auth_url } = await response.json();
      console.log('🌐 Redirecting to Unipile hosted auth wizard:', auth_url);
      
      // Redirect to Unipile hosted auth wizard
      window.location.href = auth_url;
      
    } catch (error) {
      console.error('❌ Connection error:', error);
      alert(`Failed to open connection wizard: ${error.message}`);
      setConnecting(false);
    }
  };

  const handleDisconnectAll = async () => {
    if (!user || !connectionStatus?.connected_providers.length) return;

    if (!confirm('Are you sure you want to disconnect all integrations? This will affect your bot functionality.')) {
      return;
    }

    try {
      setLoading(true);
      // For now, we'll just refresh - individual disconnect logic can be added later
      await loadConnectionStatus();
      alert('Please use individual provider disconnect options or reconnect through the wizard.');
    } catch (error) {
      console.error('❌ Disconnect error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !connectionStatus) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const hasConnections = connectionStatus?.connected_providers.length > 0;

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-semibold text-gray-900 flex items-center space-x-2">
            <span>🔗</span>
            <span>Account Integrations</span>
          </h3>
          <p className="text-gray-600 mt-1">
            Connect your social media and business accounts
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {connectionStatus?.total_connections || 0}
          </div>
          <div className="text-sm text-gray-500">Connected</div>
        </div>
      </div>

      {/* Connection Status */}
      {hasConnections ? (
        <div className="space-y-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="flex items-center space-x-2 mb-3">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600">✅</span>
              </div>
              <h4 className="font-semibold text-green-800">Connected Accounts</h4>
            </div>
            
            <div className="space-y-2">
              {connectionStatus?.connected_providers.map((provider, index) => (
                <div key={index} className="flex items-center justify-between bg-white rounded p-3 border border-green-200">
                  <div className="flex items-center space-x-3">
                    <span className="text-lg">
                      {provider.provider === 'GOOGLE' ? '📅' : 
                       provider.provider === 'INSTAGRAM' ? '📸' : 
                       provider.provider === 'LINKEDIN' ? '💼' : 
                       provider.provider === 'WHATSAPP' ? '💬' : '🔗'}
                    </span>
                    <div>
                      <div className="font-medium text-gray-900">{provider.display_name}</div>
                      <div className="text-sm text-gray-600">
                        {provider.email || provider.username || 'Connected'}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-green-600 font-medium">
                    Connected
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-blue-50 rounded-lg p-6 border border-blue-200 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🔗</span>
            </div>
            <h4 className="text-lg font-semibold text-blue-900 mb-2">
              No Accounts Connected
            </h4>
            <p className="text-blue-700 mb-4">
              Connect your accounts to unlock powerful integrations for your chatbot
            </p>
          </div>
        </div>
      )}

      {/* Available Providers Info */}
      <div className="bg-gray-50 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-gray-900 mb-3">Available Integrations</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { name: 'Google Calendar', icon: '📅', type: 'Scheduling' },
            { name: 'Instagram', icon: '📸', type: 'Social Media' },
            { name: 'WhatsApp', icon: '💬', type: 'Messaging' },
            { name: 'LinkedIn', icon: '💼', type: 'Professional' }
          ].map((provider, index) => (
            <div key={index} className="text-center p-3 bg-white rounded border">
              <div className="text-2xl mb-1">{provider.icon}</div>
              <div className="text-sm font-medium text-gray-900">{provider.name}</div>
              <div className="text-xs text-gray-500">{provider.type}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleConnectAccount}
          disabled={connecting}
          className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium text-center"
        >
          {connecting ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Opening wizard...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center space-x-2">
              <span>🚀</span>
              <span>{hasConnections ? 'Add More Integrations' : 'Connect Accounts'}</span>
            </div>
          )}
        </button>

        {hasConnections && (
          <button
            onClick={() => loadConnectionStatus()}
            disabled={loading}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:opacity-50"
          >
            {loading ? '🔄' : '🔄'} Refresh
          </button>
        )}
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <div className="flex items-start space-x-3">
          <span className="text-yellow-600 text-lg">💡</span>
          <div>
            <h5 className="font-medium text-yellow-800 mb-1">How it works</h5>
            <ul className="text-sm text-yellow-700 space-y-1">
              <li>• Click "Connect Accounts" to open Unipile's secure connection wizard</li>
              <li>• Choose from: Google Calendar, Instagram, WhatsApp, LinkedIn, Messenger, Telegram</li>
              <li>• Follow the authentication steps for each platform</li>
              <li>• Your chatbot will automatically gain new capabilities</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};