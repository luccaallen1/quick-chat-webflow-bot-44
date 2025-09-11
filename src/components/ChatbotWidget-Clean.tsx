import React, { useState, useRef, useEffect } from 'react';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { WelcomeScreen } from './WelcomeScreen';
import { CallInterface } from './CallInterface';
import { ChatbotHeader } from './chatbot/ChatbotHeader';
import { ChatbotInput } from './chatbot/ChatbotInput';
import { ChatbotBubble } from './chatbot/ChatbotBubble';
import { ChatbotMessage } from './chatbot/ChatbotMessage';
import { Message, getOrCreateSessionId, logError } from './chatbot/utils';
import { ChatbotWidgetProps } from './chatbot/types';
import './ChatbotWidget.css';

// Default props
const DEFAULT_WELCOME_BUTTONS = [
  { id: '1', text: 'Ask a Question', message: 'I have a medical question' },
  { id: '2', text: 'Book Appointment', message: 'I would like to book an appointment' },
  { id: '3', text: 'Get Health Info', message: 'I need health information' },
  { id: '4', text: 'Contact Support', message: 'I need to contact support' }
];

export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  webhookUrl = 'https://luccatora.app.n8n.cloud/webhook/webbot-test',
  title = 'MediFlow',
  bio = 'Your medical assistant',
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
  logoUrl = '/lovable-uploads/fd9d4dbf-9035-4de8-a3a1-81089fcac665.png',
  logoFile,
  avatarUrl = '/lovable-uploads/1f938225-daa7-46d3-a44e-d951e492fcd4.png',
  avatarFile,
  welcomeMessage = 'Hi! I\'m your medical assistant. How can I help you today?',
  welcomeTooltipMessage = 'Click to start chatting with our AI assistant!',
  admin = false,
  isVoiceEnabled = true,
  isElevenLabsEnabled = false,
  elevenLabsAgentId = 'agent_01k04zwwq3fv5acgzdwmbvfk8k',
  logoBackgroundColor = 'transparent',
  logoBorderColor = '#e5e7eb',
  headerButtonColor = '#ffffff',
  companyName = 'MediFlow',
  agentName = 'Medical Assistant',
  callToAction = 'Start a conversation',
  showWelcomeScreen = true,
  companyLogo,
  welcomeButtons = DEFAULT_WELCOME_BUTTONS
}) => {
  // Session management
  const [sessionId] = useState(() => getOrCreateSessionId());
  
  // UI State
  const [isOpen, setIsOpen] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [showingWelcomeScreen, setShowingWelcomeScreen] = useState(showWelcomeScreen);
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [suggestionsDisabled, setSuggestionsDisabled] = useState(false);
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([]);
  
  // Voice functionality
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [autoPlayResponses, setAutoPlayResponses] = useState(true);
  const [isCallMode, setIsCallMode] = useState(false);
  
  // Device detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [isSmallMobile, setIsSmallMobile] = useState(window.innerWidth <= 480);
  
  // Image sources
  const [logoSrc, setLogoSrc] = useState<string>(logoUrl);
  const [avatarSrc, setAvatarSrc] = useState<string>(avatarUrl);
  
  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  // Voice chat integration
  const voiceChat = useVoiceChat({
    onTranscription: (text: string) => {
      if (text.trim()) {
        sendMessage(text);
      }
    },
    isVoiceEnabled: isVoiceEnabled && isVoiceMode,
    autoPlayResponses: isVoiceEnabled ? autoPlayResponses : false
  });

  const {
    isRecording = false,
    isProcessing = false,
    recordingTimer = 0,
    isSpeaking = false,
    voicePermissionDenied = false,
    selectedVoice = 'bark',
    startRecording = () => {},
    stopRecording = () => {},
    speakText = () => {},
    stopSpeaking = () => {},
    setSelectedVoice = () => {}
  } = isVoiceEnabled ? voiceChat : {};

  // File handling
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoSrc(logoUrl);
    }
  }, [logoFile, logoUrl]);

  useEffect(() => {
    if (avatarFile) {
      const url = URL.createObjectURL(avatarFile);
      setAvatarSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setAvatarSrc(avatarUrl);
    }
  }, [avatarFile, avatarUrl]);

  // Device detection
  useEffect(() => {
    const handleResize = () => {
      const vw = window.innerWidth;
      setIsMobile(vw <= 768);
      setIsSmallMobile(vw <= 480);
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Welcome message initialization
  useEffect(() => {
    const welcomeMsg: Message = {
      id: 'welcome-1',
      text: welcomeMessage,
      sender: 'bot',
      timestamp: new Date(),
      showSuggestions: true
    };
    setMessages([welcomeMsg]);
  }, [welcomeMessage]);

  // CSS variables for theming
  useEffect(() => {
    const container = document.querySelector('.chatbot-widget-container') as HTMLElement;
    if (container) {
      const vars = {
        '--chatbot-primary': primaryColor,
        '--chatbot-secondary': secondaryColor,
        '--chatbot-background': chatBackground,
        '--chatbot-bot-text': botTextColor,
        '--chatbot-user-text': userTextColor,
        '--chatbot-header-gradient': headerGradientColor,
        '--chatbot-header-main': headerMainColor,
        '--chatbot-logo-background': logoBackgroundColor,
        '--chatbot-logo-border': logoBorderColor,
      };

      Object.entries(vars).forEach(([key, value]) => {
        container.style.setProperty(key, value);
        document.documentElement.style.setProperty(key, value);
      });
    }
  }, [primaryColor, secondaryColor, chatBackground, botTextColor, userTextColor, headerGradientColor, headerMainColor, logoBackgroundColor, logoBorderColor]);

  // Message sending
  const sendMessage = async (messageText?: string, retryCount = 0) => {
    const textToSend = messageText || inputMessage.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: textToSend,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);
    setIsTyping(true);
    setHasError(false);
    setSuggestionsDisabled(true);
    setShowingWelcomeScreen(false);

    try {
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      const webhookPayload = {
        message: textToSend,
        userId: sessionId,
        clinicName,
        clinicId,
        timestamp: new Date().toISOString()
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      let botResponse = 'Sorry, I could not process your request.';

      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botResponse = data[0].output;
      } else if (data.message || data.response || typeof data === 'string') {
        botResponse = data.message || data.response || data;
      }

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);

      // Auto-play response if voice is enabled
      if (isVoiceEnabled && isVoiceMode && autoPlayResponses && !isSpeaking) {
        setTimeout(() => speakText(botResponse), 500);
      }

      // Show notification if widget is closed
      if (!isOpen && 'Notification' in window && Notification.permission === 'granted') {
        setHasUnreadMessages(true);
        new Notification(title, {
          body: botResponse.length > 50 ? botResponse.substring(0, 50) + '...' : botResponse,
          icon: logoUrl || '/favicon.ico'
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);

      await logError({
        from: 'webhook',
        errorCode: 500,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack || '' : '',
        payloadToWebHook: { message: textToSend, userId: sessionId, clinicName, clinicId },
        initializationUrl: window.location.href
      });

      // Retry logic
      if (retryCount < 2 && error instanceof Error && error.name !== 'AbortError') {
        setTimeout(() => sendMessage(textToSend, retryCount + 1), 1000 * (retryCount + 1));
        return;
      }

      setHasError(true);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: retryCount >= 2 
          ? 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.'
          : 'Sorry, I encountered an error. Please try again.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (inputMessage.trim() && !isTyping) {
        sendMessage(inputMessage);
      }
    }
  };

  const handleWelcomeButtonClick = (message: string) => {
    setShowingWelcomeScreen(false);
    sendMessage(message);
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (suggestionsDisabled) return;
    sendMessage(suggestion);
    setSuggestionsDisabled(true);
  };

  const toggleVoiceMode = () => {
    if (!isVoiceEnabled) return;
    setIsVoiceMode(!isVoiceMode);
    if (isVoiceMode && stopSpeaking) {
      stopSpeaking();
    }
  };

  const toggleAutoPlay = () => {
    if (!isVoiceEnabled) return;
    setAutoPlayResponses(!autoPlayResponses);
    if (!autoPlayResponses && stopSpeaking) {
      stopSpeaking();
    }
  };

  return (
    <div 
      className={`chatbot-widget-container chatbot-widget-${position}`} 
      style={{
        position: 'fixed',
        bottom: '1.5rem',
        right: position === 'bottom-right' ? '1.5rem' : 'auto',
        left: position === 'bottom-left' ? '1.5rem' : 'auto',
        top: 'auto',
        zIndex: 2147483647
      }}
    >
      {/* Chat Window */}
      {isOpen && (
        <div 
          className="chatbot-widget-window chatbot-widget-animate-in" 
          style={{
            height: isMobile ? '100vh' : '600px',
            maxHeight: isMobile ? '100vh' : '600px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <ChatbotHeader
            title={title}
            bio={bio}
            logoSrc={logoSrc}
            primaryColor={primaryColor}
            headerButtonColor={headerButtonColor}
            isVoiceEnabled={isVoiceEnabled}
            isVoiceMode={isVoiceMode}
            isElevenLabsEnabled={isElevenLabsEnabled}
            elevenLabsAgentId={elevenLabsAgentId}
            onClose={() => setIsOpen(false)}
            onCallMode={() => setIsCallMode(true)}
          />
          
          {/* Content - Call Interface or Chat */}
          {isCallMode ? (
            <CallInterface
              primaryColor={primaryColor}
              secondaryColor={secondaryColor}
              textColor={botTextColor}
              chatBackground={chatBackground}
              logoUrl={avatarUrl}
              agentId={elevenLabsAgentId}
              onBackToChat={() => setIsCallMode(false)}
            />
          ) : hasError ? (
            <div className="chatbot-widget-messages" style={{ backgroundColor: chatBackground }}>
              <div className="chatbot-widget-messages-content">
                <p className="chatbot-widget-message-text">
                  We're experiencing some technical difficulties. Please refresh the page to try again.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Messages */}
              <div 
                ref={messagesContainerRef}
                className="chatbot-widget-messages chatbot-widget-scrollbar" 
                style={{
                  backgroundColor: chatBackground,
                  flex: '1 1 auto',
                  overflowY: 'auto',
                  padding: '1rem'
                }}
              >
                <div className="chatbot-widget-messages-content">
                  {showingWelcomeScreen ? (
                    <WelcomeScreen
                      avatarUrl={avatarSrc}
                      title={title}
                      bio={bio}
                      welcomeMessage={welcomeMessage}
                      buttons={welcomeButtons}
                      primaryColor={primaryColor}
                      secondaryColor={secondaryColor}
                      chatBackground={chatBackground}
                      textColor={botTextColor}
                      headerGradientColor={headerGradientColor}
                      onButtonClick={handleWelcomeButtonClick}
                      isMobile={isMobile}
                    />
                  ) : (
                    <>
                      {/* Disclaimer appears before first bot message */}
                      {messages.length > 1 && messages.some(msg => msg.sender === 'bot') && (
                        <div style={{
                          fontSize: '11px',
                          color: botTextColor,
                          opacity: 0.7,
                          textAlign: 'center',
                          padding: '8px 16px',
                          fontStyle: 'italic',
                          marginBottom: '12px'
                        }}>
                          I'm an AI Agent, I do my best, I can answer questions and make bookings, but always verify important concerns with a human
                        </div>
                      )}
                      
                      {messages.map(message => (
                        <ChatbotMessage
                          key={message.id}
                          message={message}
                          primaryColor={primaryColor}
                          secondaryColor={secondaryColor}
                          botTextColor={botTextColor}
                          userTextColor={userTextColor}
                          chatBackground={chatBackground}
                          isAdmin={admin}
                          suggestionsDisabled={suggestionsDisabled}
                          onEditMessage={() => {}} // Simplified - remove edit functionality for now
                          onSaveEdit={() => {}}
                          onSuggestionClick={handleSuggestionClick}
                        />
                      ))}
                      
                      {/* Typing Indicator */}
                      {isTyping && (
                        <div className="chatbot-widget-message chatbot-widget-message-bot">
                          <div 
                            className="chatbot-widget-message-bubble chatbot-widget-message-bubble-bot"
                            style={{
                              backgroundColor: secondaryColor,
                              color: botTextColor,
                              border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`
                            }}
                          >
                            <div className="chatbot-widget-typing">
                              <div className="chatbot-widget-typing-dot" />
                              <div className="chatbot-widget-typing-dot" />
                              <div className="chatbot-widget-typing-dot" />
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
          
              {/* Input */}
              <ChatbotInput
                inputMessage={inputMessage}
                placeholder={placeholder}
                isLoading={isLoading}
                isTyping={isTyping}
                primaryColor={primaryColor}
                botTextColor={botTextColor}
                chatBackground={chatBackground}
                isVoiceEnabled={isVoiceEnabled}
                isVoiceMode={isVoiceMode}
                isRecording={isRecording}
                isProcessing={isProcessing}
                recordingTimer={recordingTimer}
                isSpeaking={isSpeaking}
                voicePermissionDenied={voicePermissionDenied}
                autoPlayResponses={autoPlayResponses}
                selectedVoice={selectedVoice}
                isElevenLabsEnabled={isElevenLabsEnabled}
                elevenLabsAgentId={elevenLabsAgentId}
                hasUserMessages={messages.some(msg => msg.sender === 'user')}
                onInputChange={setInputMessage}
                onSendMessage={() => sendMessage()}
                onKeyPress={handleKeyPress}
                onCallMode={() => setIsCallMode(true)}
                onStartRecording={startRecording}
                onStopRecording={stopRecording}
                onStopSpeaking={stopSpeaking}
                onToggleVoice={toggleVoiceMode}
                onToggleAutoPlay={toggleAutoPlay}
                onVoiceChange={setSelectedVoice}
              />
            </>
          )}
        </div>
      )}

      {/* Chat Bubble - Only show when chat is closed */}
      {!isOpen && (
        <ChatbotBubble
          primaryColor={primaryColor}
          avatarSrc={avatarSrc}
          logoBackgroundColor={logoBackgroundColor}
          companyName={companyName}
          agentName={agentName}
          callToAction={callToAction}
          isMobile={isMobile}
          isSmallMobile={isSmallMobile}
          onClick={() => {
            setIsOpen(true);
            setHasUnreadMessages(false);
          }}
        />
      )}
    </div>
  );
};