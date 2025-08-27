import React, { useState } from 'react';
import { IntegrationsHub } from '@/components/IntegrationsHub';
import { CalendarStatusBadge } from '@/components/CalendarStatusBadge';
import { useAuth } from '@/contexts/AuthContext';
import { ConnectionStatus } from '@/services/multiProviderService';

export const Integrations: React.FC = () => {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);

  const handleConnectionChange = (status: ConnectionStatus) => {
    setConnectionStatus(status);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Integrations</h1>
              <p className="text-lg text-gray-600 mt-2">
                Connect your favorite platforms to unlock powerful automation features
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <CalendarStatusBadge className="text-sm" />
              {connectionStatus && connectionStatus.total_connections > 0 && (
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                  {connectionStatus.total_connections} Connected
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Connection Benefits */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-start space-x-3">
            <div className="text-2xl">💡</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-2">
                Why Connect Your Platforms?
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm text-blue-800">
                <div>
                  <strong>📅 Smart Scheduling</strong><br />
                  Automatic appointment booking with real-time availability
                </div>
                <div>
                  <strong>📧 Automated Communications</strong><br />
                  Send confirmations, reminders, and follow-ups automatically
                </div>
                <div>
                  <strong>💬 Multi-Channel Messaging</strong><br />
                  Reach patients via WhatsApp, LinkedIn, email, and more
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Integration Categories */}
        {connectionStatus && (
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">📅</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Calendar</h3>
                  <p className="text-sm text-gray-600">Appointment scheduling</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {connectionStatus.calendar_connections}
              </div>
              <div className="text-sm text-gray-500">Connected</div>
              {connectionStatus.capabilities.includes('calendar') && (
                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ Booking Enabled
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">📧</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Email</h3>
                  <p className="text-sm text-gray-600">Automated communications</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {connectionStatus.email_connections}
              </div>
              <div className="text-sm text-gray-500">Connected</div>
              {connectionStatus.capabilities.includes('email') && (
                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ Auto-emails Active
                </div>
              )}
            </div>

            <div className="bg-white rounded-lg border p-6">
              <div className="flex items-center space-x-3 mb-3">
                <span className="text-3xl">💬</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Messaging</h3>
                  <p className="text-sm text-gray-600">Multi-channel outreach</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-purple-600">
                {connectionStatus.messaging_connections}
              </div>
              <div className="text-sm text-gray-500">Connected</div>
              {connectionStatus.capabilities.includes('messaging') && (
                <div className="mt-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  ✓ Multi-channel Ready
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Integration Hub */}
        <IntegrationsHub onConnectionChange={handleConnectionChange} />

        {/* Capabilities Overview */}
        {connectionStatus && connectionStatus.capabilities.length > 0 && (
          <div className="mt-8 bg-white rounded-lg border p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              🚀 Active Capabilities
            </h3>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {connectionStatus.capabilities.map((capability) => (
                <div
                  key={capability}
                  className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium text-gray-900">
                    {capability.charAt(0).toUpperCase() + capability.slice(1)}
                  </span>
                </div>
              ))}
            </div>
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                💡 <strong>These capabilities are automatically available in your chatbot conversations</strong> - 
                enabling advanced features like appointment booking, email confirmations, and multi-channel messaging.
              </p>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            📚 Need Help?
          </h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>🔗 Connection Issues?</strong><br />
              Make sure you're signed in and have the necessary permissions for each platform you're connecting.
            </div>
            <div>
              <strong>🛡️ Privacy & Security</strong><br />
              All integrations use secure OAuth flows. We only access data necessary for the features you enable.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};