// Simplified Chatbot Widget - Same styling, no complexity
import React, { useState, useRef, useEffect } from 'react';

// Simple icons (you can replace with lucide-react if needed)
const SendIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22,2 15,22 11,13 2,9"></polygon>
  </svg>
);

const MessageCircleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 3.8 3.8z"></path>
  </svg>
);

const XIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);

// Helper function to render text with line breaks
const renderTextWithLineBreaks = (text) => {
  return text.split('\n').map((line, index) => (
    <span key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </span>
  ));
};

// Generate session ID
const generateSessionId = () => {
  if (typeof window !== 'undefined') {
    try {
      return crypto.randomUUID();
    } catch {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
  }
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const getSessionId = () => {
  if (typeof window === 'undefined') return generateSessionId();
  let sessionId = sessionStorage.getItem('chatbot-session-id');
  if (!sessionId) {
    sessionId = generateSessionId();
    sessionStorage.setItem('chatbot-session-id', sessionId);
  }
  return sessionId;
};

const SimpleChatbotWidget = ({
  webhookUrl = 'https://luccatora.app.n8n.cloud/webhook/webbot-test',
  title = 'Chat Support',
  bio = 'Your assistant',
  placeholder = 'Type your message...',
  position = 'bottom-right',
  primaryColor = '#6366f1',
  secondaryColor = '#f1f5f9',
  chatBackground = '#ffffff',
  botTextColor = '#1f2937',
  userTextColor = '#ffffff',
  headerGradientColor = '#8b5cf6',
  headerMainColor = '#6366f1',
  userId = 'anonymous',
  clinicName = 'Demo Clinic',
  clinicId = '104',
  logoUrl = '',
  avatarUrl = '',
  welcomeMessage = 'Hi! How can I help you today?',
  welcomeTooltipMessage = 'Click to start chatting!',
  showWelcomeScreen = true,
  welcomeButtons = [
    { id: '1', text: 'Get Support', message: 'I need help' },
    { id: '2', text: 'Ask Question', message: 'I have a question' }
  ]
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWelcome, setShowWelcome] = useState(showWelcomeScreen && messages.length === 0);
  const [sessionId] = useState(() => getSessionId());

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  // Initialize welcome message
  useEffect(() => {
    setMessages([{
      id: 'welcome-1',
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      showSuggestions: true
    }]);
  }, [welcomeMessage]);

  // Auto-scroll to bottom
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Send message to webhook
  const sendMessage = async (messageText) => {
    if (!messageText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      text: messageText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);
    setShowWelcome(false);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: messageText,
          userId,
          sessionId,
          clinicName,
          clinicId,
          timestamp: new Date().toISOString(),
          type: 'user_message'
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const botMessage = {
        id: (Date.now() + 1).toString(),
        text: data.response || data.message || "I'm here to help! How can I assist you?",
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I'm having trouble connecting. Please try again.",
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(inputValue);
  };

  const handleWelcomeButtonClick = (buttonMessage) => {
    sendMessage(buttonMessage);
  };

  // CSS styles object (keeping all your original styles)
  const styles = {
    container: {
      fontFamily: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`,
      WebkitFontSmoothing: 'antialiased',
      MozOsxFontSmoothing: 'grayscale',
      position: 'fixed',
      zIndex: 2147483647,
      pointerEvents: 'auto',
      [position.includes('right') ? 'right' : 'left']: '1.5rem',
      [position.includes('top') ? 'top' : 'bottom']: '1.5rem',
      '--chatbot-primary': primaryColor,
      '--chatbot-secondary': secondaryColor,
      '--chatbot-background': chatBackground,
      '--chatbot-bot-text': botTextColor,
      '--chatbot-user-text': userTextColor,
      '--chatbot-header-gradient': headerGradientColor,
      '--chatbot-header-main': headerMainColor
    },

    toggleButton: {
      width: '60px',
      height: '60px',
      borderRadius: '50%',
      backgroundColor: primaryColor,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      transition: 'all 0.3s ease',
      fontSize: '0'
    },

    chatWindow: {
      width: '400px',
      height: '720px',
      marginBottom: '1rem',
      borderRadius: '12px',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb',
      display: isOpen ? 'flex' : 'none',
      flexDirection: 'column',
      overflow: 'hidden',
      position: 'relative',
      background: chatBackground
    },

    header: {
      padding: '0.6rem',
      background: `linear-gradient(135deg, ${headerGradientColor} 0%, ${headerMainColor} 50%, ${headerGradientColor} 100%)`,
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '12px 12px 6px 6px',
      flexShrink: 0
    },

    headerContent: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem'
    },

    logo: {
      width: '32px',
      height: '32px',
      borderRadius: '50%',
      overflow: 'hidden',
      flexShrink: 0
    },

    headerText: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0.1rem'
    },

    title: {
      fontWeight: 600,
      fontSize: '1.1rem',
      lineHeight: 1.5
    },

    subtitle: {
      fontSize: '0.8rem',
      opacity: 0.9,
      fontWeight: 400
    },

    closeButton: {
      background: 'none',
      border: 'none',
      color: 'white',
      cursor: 'pointer',
      padding: '4px',
      borderRadius: '4px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    },

    messagesContainer: {
      flex: 1,
      overflowY: 'auto',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem'
    },

    message: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-start'
    },

    messageBubble: {
      padding: '0.75rem 1rem',
      borderRadius: '18px',
      fontSize: '0.9rem',
      lineHeight: 1.4,
      maxWidth: '85%',
      wordWrap: 'break-word'
    },

    userMessage: {
      backgroundColor: primaryColor,
      color: userTextColor,
      borderRadius: '18px 18px 4px 18px',
      marginLeft: 'auto'
    },

    botMessage: {
      backgroundColor: secondaryColor,
      color: botTextColor,
      border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`,
      borderRadius: '18px 18px 18px 4px'
    },

    welcomeContainer: {
      padding: '1rem',
      textAlign: 'center'
    },

    welcomeButtons: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '0.75rem',
      marginBottom: '1rem'
    },

    welcomeButton: {
      padding: '0.6rem 0.8rem',
      background: `linear-gradient(135deg, ${headerGradientColor} 0%, ${primaryColor} 100%)`,
      border: 'none',
      borderRadius: '8px',
      color: 'white',
      cursor: 'pointer',
      fontSize: '0.8rem',
      fontWeight: 500,
      transition: 'all 0.2s ease',
      minHeight: '40px',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },

    inputContainer: {
      padding: '1rem',
      borderTop: '1px solid #e5e7eb',
      backgroundColor: chatBackground
    },

    inputForm: {
      display: 'flex',
      gap: '0.5rem',
      alignItems: 'flex-end'
    },

    input: {
      flex: 1,
      padding: '0.75rem',
      border: '1px solid #d1d5db',
      borderRadius: '24px',
      fontSize: '0.9rem',
      outline: 'none',
      resize: 'none',
      minHeight: '44px',
      maxHeight: '120px'
    },

    sendButton: {
      width: '44px',
      height: '44px',
      borderRadius: '50%',
      backgroundColor: primaryColor,
      border: 'none',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      transition: 'all 0.2s ease'
    },

    loadingDots: {
      display: 'flex',
      gap: '4px',
      padding: '0.75rem 1rem'
    },

    dot: {
      width: '8px',
      height: '8px',
      borderRadius: '50%',
      backgroundColor: '#9ca3af',
      animation: 'bounce 1.4s infinite ease-in-out'
    }
  };

  return (
    <div style={styles.container} className="chatbot-widget-container">
      {/* Chat Window */}
      <div style={styles.chatWindow}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerContent}>
            {logoUrl && (
              <div style={styles.logo}>
                <img
                  src={logoUrl}
                  alt="Logo"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
            )}
            <div style={styles.headerText}>
              <div style={styles.title}>{title}</div>
              <div style={styles.subtitle}>{bio}</div>
            </div>
          </div>
          <button
            style={styles.closeButton}
            onClick={() => setIsOpen(false)}
          >
            <XIcon />
          </button>
        </div>

        {/* Welcome Screen */}
        {showWelcome && (
          <div style={styles.welcomeContainer}>
            {avatarUrl && (
              <img
                src={avatarUrl}
                alt="Avatar"
                style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  marginBottom: '1rem'
                }}
              />
            )}
            <div style={styles.welcomeButtons}>
              {welcomeButtons.map((button) => (
                <button
                  key={button.id}
                  style={styles.welcomeButton}
                  onClick={() => handleWelcomeButtonClick(button.message)}
                  onMouseEnter={(e) => {
                    e.target.style.background = `linear-gradient(135deg, ${primaryColor} 0%, ${headerGradientColor} 100%)`;
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = `linear-gradient(135deg, ${headerGradientColor} 0%, ${primaryColor} 100%)`;
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  {button.text}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages */}
        <div style={styles.messagesContainer}>
          {messages.map((message) => (
            <div
              key={message.id}
              style={{
                ...styles.message,
                justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              {message.sender === 'bot' && avatarUrl && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={avatarUrl}
                    alt="Bot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div
                style={{
                  ...styles.messageBubble,
                  ...(message.sender === 'user' ? styles.userMessage : styles.botMessage)
                }}
              >
                {renderTextWithLineBreaks(message.text)}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div style={{ ...styles.message, justifyContent: 'flex-start' }}>
              {avatarUrl && (
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', overflow: 'hidden', flexShrink: 0 }}>
                  <img
                    src={avatarUrl}
                    alt="Bot"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
              )}
              <div style={{ ...styles.messageBubble, ...styles.botMessage }}>
                <div style={styles.loadingDots}>
                  <div style={{ ...styles.dot, animationDelay: '0s' }}></div>
                  <div style={{ ...styles.dot, animationDelay: '0.2s' }}></div>
                  <div style={{ ...styles.dot, animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={styles.inputContainer}>
          <form onSubmit={handleSubmit} style={styles.inputForm}>
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={placeholder}
              style={styles.input}
              rows={1}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e);
                }
              }}
              disabled={isLoading}
            />
            <button
              type="submit"
              style={{
                ...styles.sendButton,
                opacity: inputValue.trim() ? 1 : 0.5,
                cursor: inputValue.trim() ? 'pointer' : 'not-allowed'
              }}
              disabled={!inputValue.trim() || isLoading}
            >
              <SendIcon />
            </button>
          </form>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        style={{
          ...styles.toggleButton,
          transform: isOpen ? 'scale(0.9)' : 'scale(1)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) => e.target.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.target.style.transform = isOpen ? 'scale(0.9)' : 'scale(1)'}
        title={welcomeTooltipMessage}
      >
        <MessageCircleIcon />
      </button>

      {/* CSS Animation for loading dots */}
      <style>
        {`
          @keyframes bounce {
            0%, 80%, 100% { transform: scale(0); opacity: 0.5; }
            40% { transform: scale(1); opacity: 1; }
          }
        `}
      </style>
    </div>
  );
};

export default SimpleChatbotWidget;