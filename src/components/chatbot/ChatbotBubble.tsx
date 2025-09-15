import React from 'react';
import { MessageCircle } from 'lucide-react';

interface ChatbotBubbleProps {
  primaryColor: string;
  avatarSrc: string;
  logoBackgroundColor: string;
  companyName: string;
  agentName: string;
  welcomeMessage: string;
  callToAction?: string;
  isMobile: boolean;
  isSmallMobile: boolean;
  onClick: () => void;
}

export const ChatbotBubble: React.FC<ChatbotBubbleProps> = ({
  primaryColor,
  avatarSrc,
  logoBackgroundColor,
  companyName,
  agentName,
  welcomeMessage,
  callToAction,
  isMobile,
  isSmallMobile,
  onClick
}) => {
  console.log('ChatbotBubble received welcomeMessage:', welcomeMessage);
  return (
    <div className="voice-chat-widget" style={{ 
      position: 'fixed', 
      bottom: '20px', 
      right: '20px', 
      zIndex: 9999 
    }}>
      <div 
        className="chat-bubble" 
        style={{
          background: '#ffffff',
          borderRadius: isSmallMobile ? '18px' : isMobile ? '20px' : '24px',
          padding: isSmallMobile ? '10px 14px' : isMobile ? '12px 16px' : '16px 20px',
          boxShadow: '0 4px 24px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08)',
          maxWidth: isSmallMobile ? '240px' : isMobile ? '280px' : '380px',
          cursor: 'pointer'
        }} 
        onClick={onClick}
      >
        {/* Header with avatar and message */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: isSmallMobile ? '8px' : isMobile ? '10px' : '12px',
          marginBottom: isSmallMobile ? '10px' : isMobile ? '12px' : '16px'
        }}>
          {/* Avatar circle */}
          <div style={{
            width: isSmallMobile ? '32px' : isMobile ? '36px' : '48px',
            height: isSmallMobile ? '32px' : isMobile ? '36px' : '48px',
            background: avatarSrc ? (logoBackgroundColor || 'transparent') : primaryColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            overflow: 'hidden'
          }}>
            {avatarSrc ? (
              <img 
                src={avatarSrc} 
                alt="Avatar" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.05) saturate(1.1)'
                }}
                onError={e => {
                  console.error('Avatar logo failed to load:', avatarSrc);
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div style={{
                color: '#ffffff',
                fontSize: isSmallMobile ? '8px' : isMobile ? '9px' : '11px',
                fontWeight: '600',
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {companyName.split(' ').slice(0, 2).join('\n').toUpperCase() || 'AI'}
              </div>
            )}
          </div>
          
          {/* Message text */}
          <div style={{ flex: 1 }}>
            <p style={{
              color: '#1a1a1a',
              fontSize: isSmallMobile ? '12px' : isMobile ? '13px' : '15px',
              lineHeight: '1.4',
              margin: 0,
              display: 'flex',
              alignItems: 'center'
            }}>
              {welcomeMessage}
            </p>
          </div>
        </div>
        
        {/* Call to action button */}
        <button 
          style={{
            background: primaryColor,
            color: '#ffffff',
            border: 'none',
            borderRadius: isSmallMobile ? '18px' : isMobile ? '20px' : '24px',
            padding: isSmallMobile ? '10px 16px' : isMobile ? '12px 18px' : '14px 24px',
            fontSize: isSmallMobile ? '13px' : isMobile ? '14px' : '16px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: isSmallMobile ? '6px' : isMobile ? '8px' : '10px',
            width: '100%',
            transition: 'all 0.2s ease'
          }} 
          onMouseEnter={e => {
            e.currentTarget.style.background = `${primaryColor}dd`;
            e.currentTarget.style.transform = 'translateY(-1px)';
          }} 
          onMouseLeave={e => {
            e.currentTarget.style.background = primaryColor;
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <MessageCircle style={{ 
            width: isSmallMobile ? '14px' : isMobile ? '16px' : '20px', 
            height: isSmallMobile ? '14px' : isMobile ? '16px' : '20px' 
          }} />
          {isSmallMobile ? 'Chat' : isMobile ? 'Chat' : (callToAction || 'Start a conversation')}
        </button>
      </div>
    </div>
  );
};