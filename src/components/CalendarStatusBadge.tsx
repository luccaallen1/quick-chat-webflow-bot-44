import React, { useState, useEffect } from 'react';
import { unipileService } from '@/services/unipileService';
import { useAuth } from '@/contexts/AuthContext';

interface CalendarStatusBadgeProps {
  className?: string;
  showText?: boolean;
}

export const CalendarStatusBadge: React.FC<CalendarStatusBadgeProps> = ({ 
  className = '', 
  showText = true 
}) => {
  const { user } = useAuth();
  const [connected, setConnected] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkStatus();
  }, [user]);

  const checkStatus = async () => {
    if (!user) {
      setConnected(false);
      setLoading(false);
      return;
    }

    try {
      const status = await unipileService.getConnectionStatus();
      console.log('🔍 Calendar Status Badge - Connection Status:', status);
      setConnected(status.connected);
    } catch (error) {
      console.error('❌ Calendar Status Badge - Error getting connection status:', error);
      setConnected(false);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`inline-flex items-center space-x-1 ${className}`}>
        <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
        {showText && <span className="text-xs text-gray-500">Checking...</span>}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-1 ${className}`}>
      <div className={`w-2 h-2 rounded-full ${
        connected ? 'bg-green-500' : 'bg-gray-300'
      }`}></div>
      {showText && (
        <span className={`text-xs font-medium ${
          connected ? 'text-green-600' : 'text-gray-500'
        }`}>
          {connected ? 'Calendar Connected' : 'No Calendar'}
        </span>
      )}
    </div>
  );
};