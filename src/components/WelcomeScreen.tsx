import React from 'react';

interface WelcomeButton {
  id: string;
  text: string;
  message: string;
  icon?: string;
}

interface WelcomeScreenProps {
  avatarUrl?: string;
  title: string;
  bio?: string;
  welcomeMessage: string;
  buttons: WelcomeButton[];
  primaryColor: string;
  secondaryColor: string;
  chatBackground: string;
  textColor: string;
  headerGradientColor: string;
  onButtonClick: (message: string) => void;
  isMobile: boolean;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  avatarUrl,
  title,
  welcomeMessage,
  buttons,
  primaryColor,
  secondaryColor,
  chatBackground,
  textColor,
  headerGradientColor,
  onButtonClick,
  isMobile
}) => {
  return (
    <div className="welcome-message-wrapper" style={{
      padding: '1rem',
      backgroundColor: chatBackground,
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    }}>
      
      {/* 1. LOGO - Centered at top */}
      {avatarUrl && (
        <div className="welcome-logo-container" style={{
          textAlign: 'center'
        }}>
          <img 
            src={avatarUrl} 
            alt={title} 
            className="welcome-logo"
            style={{
              width: isMobile ? '100px' : '120px',
              height: isMobile ? '100px' : '120px',
              borderRadius: '50%',
              objectFit: 'cover',
              marginBottom: '20px',
              display: 'block',
              margin: '0 auto 20px auto'
            }}
            onError={(e) => {
              console.error('Avatar failed to load:', avatarUrl);
              e.currentTarget.style.display = 'none';
            }}
          />
        </div>
      )}
      
      {/* 2. BUTTONS - Grid layout under logo */}
      <div className="welcome-buttons-grid" style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '12px',
        marginBottom: '20px'
      }}>
        {buttons.map((button, index) => (
          <button 
            key={button.id || index}
            className="welcome-button"
            onClick={() => onButtonClick(button.message)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '8px 12px',
              background: `linear-gradient(135deg, ${headerGradientColor} 0%, ${primaryColor} 100%)`,
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: '500',
              color: 'white',
              transition: 'all 0.2s ease',
              minHeight: '40px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${headerGradientColor} 100%)`;
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `linear-gradient(135deg, ${headerGradientColor} 0%, ${primaryColor} 100%)`;
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
            }}
          >
            <span>{button.text}</span>
          </button>
        ))}
      </div>
      
      {/* 3. WELCOME MESSAGE - Styled as bot message in bottom left */}
      <div style={{ 
        marginTop: 'auto',
        alignSelf: 'flex-start',
        width: '100%'
      }}>
        <div className="chatbot-widget-message chatbot-widget-message-bot chatbot-message-animate" style={{
          display: 'flex',
          gap: '8px',
          alignItems: 'flex-start',
          justifyContent: 'flex-start'
        }}>
          {/* Bot Avatar */}
          {avatarUrl && (
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              background: secondaryColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img 
                src={avatarUrl} 
                alt="Bot Avatar" 
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover'
                }}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                }}
              />
            </div>
          )}
          
          {/* Message Bubble */}
          <div 
            className="chatbot-widget-message-bubble chatbot-widget-message-bubble-bot"
            style={{
              backgroundColor: secondaryColor,
              color: textColor,
              padding: '12px 16px',
              borderRadius: '18px 18px 18px 4px',
              border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`,
              fontSize: '14px',
              lineHeight: '1.4',
              maxWidth: '85%'
            }}
          >
            <p className="chatbot-widget-message-text" style={{ margin: 0 }}>
              {welcomeMessage}
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
};