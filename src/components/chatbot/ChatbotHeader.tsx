import React from 'react';
import { X, Phone, Shield } from 'lucide-react';

interface ChatbotHeaderProps {
  title: string;
  bio: string;
  logoSrc: string;
  primaryColor: string;
  headerButtonColor: string;
  isVoiceEnabled: boolean;
  isVoiceMode: boolean;
  isElevenLabsEnabled: boolean;
  elevenLabsAgentId?: string;
  onClose: () => void;
  onCallMode: () => void;
}

export const ChatbotHeader: React.FC<ChatbotHeaderProps> = ({
  title,
  bio,
  logoSrc,
  primaryColor,
  headerButtonColor,
  isVoiceEnabled,
  isVoiceMode,
  isElevenLabsEnabled,
  elevenLabsAgentId,
  onClose,
  onCallMode
}) => {
  return (
    <div className="chatbot-widget-header" style={{ backgroundColor: primaryColor }}>
      <div className="chatbot-widget-header-content">
        <div className="chatbot-widget-header-avatar">
          {logoSrc && (
            <img 
              src={logoSrc} 
              alt="Logo" 
              className="chatbot-widget-logo"
              onError={(e) => {
                console.error('Logo failed to load:', logoSrc);
                e.currentTarget.style.display = 'none';
              }}
              onLoad={() => {
                console.log('Logo loaded successfully:', logoSrc);
              }}
            />
          )}
        </div>
        <div>
          <h3 className="chatbot-widget-header-title">{title}</h3>
          <p className="chatbot-widget-header-subtitle">
            {bio}
            {isVoiceEnabled && isVoiceMode && (
              <span style={{ marginLeft: '8px', fontSize: '10px' }}>
                🎤 Voice Mode
              </span>
            )}
          </p>
        </div>
      </div>
      
      <div className="chatbot-widget-header-actions">
        {/* Voice Agent Call Button */}
        {isElevenLabsEnabled && elevenLabsAgentId && (
          <button 
            className="chatbot-widget-button" 
            onClick={onCallMode}
            title="Start a call"
            style={{
              marginRight: '2px',
              width: '48px',
              height: '48px',
              padding: '0',
              display: 'flex !important',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'transparent',
              border: 'none',
              borderRadius: '50%',
              cursor: 'pointer',
              opacity: '1',
              visibility: 'visible'
            }}
          >
            <Phone style={{ width: '26px', height: '26px', color: '#1f2937 !important' }} />
          </button>
        )}

        {/* Privacy Policy Button */}
        <button 
          className="chatbot-widget-button" 
          onClick={() => window.open('/privacy-policy', '_blank')} 
          title="Privacy Policy" 
          style={{
            marginRight: '0px',
            width: '32px',
            height: '32px',
            padding: '0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'transparent',
            border: 'none',
            borderRadius: '50%',
            cursor: 'pointer',
            opacity: '0.8',
            transition: 'opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
          onMouseLeave={(e) => e.currentTarget.style.opacity = '0.8'}
        >
          <Shield style={{ width: '16px', height: '16px', color: headerButtonColor || '#ffffff' }} />
        </button>
        
        {/* Close Button */}
        <button className="chatbot-widget-button" onClick={onClose}>
          <X style={{ width: '16px', height: '16px' }} />
        </button>
      </div>
    </div>
  );
};