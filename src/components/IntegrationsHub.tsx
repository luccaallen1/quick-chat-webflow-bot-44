import React, { useState, useEffect } from 'react';
import { multiProviderService, ProviderConfiguration, ConnectedProvider, ConnectionStatus, ProviderType } from '@/services/multiProviderService';
import { useAuth } from '@/contexts/AuthContext';

interface IntegrationsHubProps {
  onConnectionChange?: (status: ConnectionStatus) => void;
}

const providerIcons: Record<string, string> = {
  GOOGLE: '🟢',
  MICROSOFT: '🔵', 
  IMAP: '📧',
  WHATSAPP: '💬',
  LINKEDIN: '💼',
  INSTAGRAM: '📸',
  MESSENGER: '💭',
  TWITTER: '🐦',
  TELEGRAM: '✈️'
};

const typeIcons: Record<ProviderType, string> = {
  calendar: '📅',
  email: '📧',
  messaging: '💬'
};

const typeColors: Record<ProviderType, string> = {
  calendar: 'blue',
  email: 'green', 
  messaging: 'purple'
};

export const IntegrationsHub: React.FC<IntegrationsHubProps> = ({ onConnectionChange }) => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedType, setSelectedType] = useState<ProviderType | 'all'>('all');

  useEffect(() => {
    loadConnectionStatus();
  }, [user]);

  const loadConnectionStatus = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const status = await multiProviderService.getConnectionStatus();
      setConnectionStatus(status);
      onConnectionChange?.(status);
      setError('');
    } catch (error) {
      console.error('Error loading integrations:', error);
      setError('Failed to load integrations');
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (provider: ProviderConfiguration) => {
    if (!user) {
      setError('Please sign in first to connect integrations');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      const authResponse = await multiProviderService.initializeConnection(
        provider.provider,
        provider.provider_type
      );
      
      // Redirect to hosted auth
      window.location.href = authResponse.url;
    } catch (error) {
      console.error(`Error connecting ${provider.display_name}:`, error);
      setError(`Failed to start ${provider.display_name} connection`);
      setLoading(false);
    }
  };

  const handleDisconnect = async (connectedProvider: ConnectedProvider) => {
    if (!confirm(`Are you sure you want to disconnect ${connectedProvider.display_name}?`)) {
      return;
    }

    try {
      setLoading(true);
      await multiProviderService.disconnect(
        connectedProvider.provider,
        connectedProvider.provider_type
      );
      await loadConnectionStatus(); // Reload status
      setError('');
    } catch (error) {
      console.error(`Error disconnecting ${connectedProvider.display_name}:`, error);
      setError(`Failed to disconnect ${connectedProvider.display_name}`);
    } finally {
      setLoading(false);
    }
  };

  if (!connectionStatus) {
    return (
      <div className="bg-white rounded-lg border p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const filteredProviders = selectedType === 'all' 
    ? connectionStatus.available_providers
    : connectionStatus.available_providers.filter(p => p.provider_type === selectedType);

  const filteredConnectedProviders = selectedType === 'all'
    ? connectionStatus.connected_providers  
    : connectionStatus.connected_providers.filter(p => p.provider_type === selectedType);

  return (
    <div className="bg-white rounded-lg border p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Integrations Hub</h2>
          <p className="text-gray-600 mt-1">
            Connect your platforms to enable advanced features
          </p>
        </div>
        
        {/* Status Summary */}
        <div className="text-right">
          <div className="text-2xl font-bold text-gray-900">
            {connectionStatus.total_connections}
          </div>
          <div className="text-sm text-gray-500">Connected</div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📅</span>
            <div>
              <div className="text-lg font-semibold text-blue-800">
                {connectionStatus.calendar_connections}
              </div>
              <div className="text-sm text-blue-600">Calendar</div>
            </div>
          </div>
        </div>
        
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">📧</span>
            <div>
              <div className="text-lg font-semibold text-green-800">
                {connectionStatus.email_connections}
              </div>
              <div className="text-sm text-green-600">Email</div>
            </div>
          </div>
        </div>
        
        <div className="bg-purple-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">💬</span>
            <div>
              <div className="text-lg font-semibold text-purple-800">
                {connectionStatus.messaging_connections}
              </div>
              <div className="text-sm text-purple-600">Messaging</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-6">
        {(['all', 'calendar', 'email', 'messaging'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {type === 'all' ? '🌐 All' : `${typeIcons[type as ProviderType]} ${type.charAt(0).toUpperCase() + type.slice(1)}`}
          </button>
        ))}
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Connected Providers */}
      {filteredConnectedProviders.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Connected Integrations</h3>
          <div className="grid gap-4">
            {filteredConnectedProviders.map((connectedProvider) => (
              <div
                key={`${connectedProvider.provider}-${connectedProvider.provider_type}`}
                className={`p-4 border-2 rounded-lg bg-${typeColors[connectedProvider.provider_type]}-50 border-${typeColors[connectedProvider.provider_type]}-200`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">
                      {providerIcons[connectedProvider.provider]}
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {connectedProvider.display_name}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {connectedProvider.email || `Connected ${new Date(connectedProvider.connected_at).toLocaleDateString()}`}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {connectedProvider.capabilities.map((capability) => (
                          <span
                            key={capability}
                            className={`text-xs px-2 py-1 rounded bg-${typeColors[connectedProvider.provider_type]}-100 text-${typeColors[connectedProvider.provider_type]}-700`}
                          >
                            {capability}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className={`px-3 py-1 rounded-full text-sm font-semibold bg-green-100 text-green-800`}>
                      🟢 Connected
                    </div>
                    <button
                      onClick={() => handleDisconnect(connectedProvider)}
                      disabled={loading}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      Disconnect
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Available Providers */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Available Integrations</h3>
        <div className="grid gap-4">
          {filteredProviders
            .filter(provider => !filteredConnectedProviders.some(
              cp => cp.provider === provider.provider && cp.provider_type === provider.provider_type
            ))
            .map((provider) => (
            <div
              key={`${provider.provider}-${provider.provider_type}`}
              className="p-4 border rounded-lg hover:border-gray-300 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">
                    {providerIcons[provider.provider]}
                  </span>
                  <div>
                    <h4 className="font-semibold text-gray-900">
                      {provider.display_name}
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      {provider.description}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {provider.capabilities.map((capability) => (
                        <span
                          key={capability}
                          className={`text-xs px-2 py-1 rounded bg-${typeColors[provider.provider_type]}-100 text-${typeColors[provider.provider_type]}-700`}
                        >
                          {capability}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => handleConnect(provider)}
                  disabled={loading || !user}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Connecting...' : 'Connect'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {!user && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg text-sm">
          Please sign in to manage integrations
        </div>
      )}

      {connectionStatus.capabilities.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-900 mb-2">Available Capabilities</h4>
          <div className="flex flex-wrap gap-2">
            {connectionStatus.capabilities.map((capability) => (
              <span
                key={capability}
                className="text-sm px-3 py-1 rounded-full bg-blue-100 text-blue-800"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};