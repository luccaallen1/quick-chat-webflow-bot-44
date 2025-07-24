import React, { useState } from 'react';
import { Phone, PhoneOff } from 'lucide-react';
import { useConversation } from '@11labs/react';

interface CallInterfaceProps {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  chatBackground: string;
  logoUrl?: string;
  agentId: string;
  onBackToChat: () => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  primaryColor,
  secondaryColor,
  textColor,
  chatBackground,
  logoUrl,
  agentId,
  onBackToChat
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('ElevenLabs connected');
      setIsCallActive(true);
    },
    onDisconnect: () => {
      console.log('ElevenLabs disconnected');
      setIsCallActive(false);
    },
    onMessage: (message) => {
      console.log('ElevenLabs message:', message);
    },
    onError: (error) => {
      console.error('ElevenLabs error:', error);
    }
  });

  const startCall = async () => {
    try {
      await conversation.startSession({ 
        agentId: agentId 
      });
    } catch (error) {
      console.error('Failed to start call:', error);
    }
  };

  const endCall = async () => {
    try {
      await conversation.endSession();
      setIsCallActive(false);
    } catch (error) {
      console.error('Failed to end call:', error);
    }
  };

  return (
    <div 
      style={{ 
        backgroundColor: chatBackground,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <div 
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            position: 'relative',
            boxShadow: isCallActive ? '0 0 30px rgba(59, 130, 246, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.15)',
            animation: isCallActive ? 'voicePulse 1.5s ease-in-out infinite' : 'none',
            transition: 'all 0.3s ease'
          }}
        >
          {/* Outer pulse ring when active */}
          {isCallActive && (
            <div 
              style={{
                position: 'absolute',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                border: `3px solid ${primaryColor}`,
                opacity: 0.6,
                animation: 'voiceRipple 1.5s ease-out infinite'
              }}
            />
          )}
          
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Logo" 
              style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                // Fallback to phone icon if logo fails to load
                e.currentTarget.style.display = 'none';
                const phoneIcon = e.currentTarget.nextElementSibling as HTMLElement;
                if (phoneIcon) phoneIcon.style.display = 'block';
              }}
            />
          ) : null}
          
          <Phone 
            style={{ 
              width: '40px', 
              height: '40px', 
              color: 'white',
              display: logoUrl ? 'none' : 'block'
            }} 
          />
        </div>
        
        <h3 style={{ 
          color: textColor, 
          margin: '0 0 0.5rem 0',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {isCallActive ? 'Voice Agent Active' : 'Voice Assistant'}
        </h3>
        
        <p style={{ 
          color: textColor, 
          opacity: 0.7,
          margin: '0 0 2rem 0',
          fontSize: '16px'
        }}>
          {isCallActive 
            ? 'Speak naturally to interact with the AI assistant'
            : 'Connect to our AI voice assistant for hands-free support'
          }
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {!isCallActive ? (
          <button
            onClick={startCall}
            style={{
              backgroundColor: primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Phone style={{ width: '20px', height: '20px' }} />
          </button>
        ) : (
          <button
            onClick={endCall}
            style={{
              backgroundColor: '#ef4444',
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <PhoneOff style={{ width: '20px', height: '20px' }} />
          </button>
        )}
        
        <button
          onClick={onBackToChat}
          style={{
            backgroundColor: secondaryColor,
            color: textColor,
            border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '28px',
            padding: '0 1rem',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Chat
        </button>
      </div>
    </div>
  );
};