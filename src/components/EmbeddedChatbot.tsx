import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, VolumeX } from 'lucide-react';
import { unipileService } from '@/services/unipileService';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

interface BotConfiguration {
  clinicId: string;
  clinicName: string;
  phoneNumber: string;
  operationHours: string;
  micrositeUrl: string;
  address: string;
  addressDescription: string;
  state: string;
  timeZone: string;
  timeZoneOffset: string;
  bookingLink: string;
  availableTimeSlots: string;
  timeIntervals: string;
  wellnessPlanPrices: string;
  calendarId: string;
  bookingCalendarId: string;
  clinicEmail: string;
  baseId: string;
  tableId: string;
  bookingWorkflow: string;
  planPrice: string;
}

interface EmbeddedChatbotProps {
  webhookUrl?: string;
  title?: string;
  bio?: string;
  placeholder?: string;
  primaryColor?: string;
  secondaryColor?: string;
  chatBackground?: string;
  botTextColor?: string;
  userTextColor?: string;
  headerGradientColor?: string;
  headerMainColor?: string;
  userId?: string;
  clinicName?: string;
  clinicId?: string;
  logoUrl?: string;
  logoFile?: File;
  avatarUrl?: string;
  avatarFile?: File;
  welcomeMessage?: string;
  welcomeTooltipMessage?: string;
  admin?: boolean;
  isVoiceEnabled?: boolean;
  isElevenLabsEnabled?: boolean;
  elevenLabsAgentId?: string;
  logoBackgroundColor?: string;
  logoBorderColor?: string;
  headerButtonColor?: string;
  fontFamily?: string;
  companyName?: string;
  agentName?: string;
  callToAction?: string;
  config?: any;
  customization?: any;
  height?: string;
  className?: string;
  botConfiguration?: BotConfiguration;
}

export const EmbeddedChatbot: React.FC<EmbeddedChatbotProps> = ({
  webhookUrl = "https://luccatora.app.n8n.cloud/webhook/webbot-test",
  title = "AI Assistant",
  primaryColor = "#2563eb",
  agentName = "Alex",
  welcomeMessage,
  placeholder = "Type your message here...",
  isVoiceEnabled = true,
  config,
  customization,
  height = "600px",
  className = "",
  userId,
  clinicName,
  clinicId,
  botConfiguration,
  ...otherProps
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const sessionId = useRef(`session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);

  // Get config values with fallbacks
  const actualPrimaryColor = config?.primaryColor || primaryColor;
  const actualAssistantName = config?.assistantName || agentName;
  const actualWelcomeMessage = config?.welcomeMessage || welcomeMessage;
  const actualPlaceholder = config?.placeholder || placeholder;
  const actualTitle = title;
  const showVoiceButton = config?.showVoiceButton || isVoiceEnabled;
  const fontFamily = customization?.fontFamily || "Inter, system-ui, sans-serif";

  // Initialize with welcome message
  useEffect(() => {
    const welcome = actualWelcomeMessage || `Hi! I'm ${actualAssistantName}, your AI assistant. How can I help you today?`;
    setMessages([{
      id: '1',
      text: welcome,
      sender: 'bot',
      timestamp: new Date()
    }]);
  }, [actualWelcomeMessage, actualAssistantName]);

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      // Get Unipile calendar connection if available
      let calendarData = null;
      try {
        const connectionStatus = await unipileService.getConnectionStatus();
        if (connectionStatus.connected && connectionStatus.selectedCalendar) {
          calendarData = {
            connected: true,
            email: connectionStatus.email,
            selected_calendar_id: connectionStatus.selectedCalendar.calendar_id,
            selected_calendar_name: connectionStatus.selectedCalendar.summary,
            user_id: userId || sessionId.current // Pass user_id for n8n token resolution
          };
        }
      } catch (error) {
        console.log('No calendar connection available:', error);
      }
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: currentMessage,
          userId: userId || sessionId.current,
          sessionId: sessionId.current,
          timestamp: new Date().toISOString(),
          source: 'embedded_chat',
          clinicName: botConfiguration?.clinicName || clinicName,
          clinicId: botConfiguration?.clinicId || clinicId,
          agentName: actualAssistantName,
          url: window.location.href,
          userAgent: navigator.userAgent,
          // Bot Configuration Data
          ...(botConfiguration && {
            phoneNumber: botConfiguration.phoneNumber,
            operationHours: botConfiguration.operationHours,
            micrositeUrl: botConfiguration.micrositeUrl,
            address: botConfiguration.address,
            addressDescription: botConfiguration.addressDescription,
            state: botConfiguration.state,
            timeZone: botConfiguration.timeZone,
            timeZoneOffset: botConfiguration.timeZoneOffset,
            bookingLink: botConfiguration.bookingLink,
            availableTimeSlots: botConfiguration.availableTimeSlots,
            timeIntervals: botConfiguration.timeIntervals,
            wellnessPlanPrices: botConfiguration.wellnessPlanPrices,
            calendarId: botConfiguration.calendarId,
            bookingCalendarId: botConfiguration.bookingCalendarId,
            clinicEmail: botConfiguration.clinicEmail,
            baseId: botConfiguration.baseId,
            tableId: botConfiguration.tableId,
            bookingWorkflow: botConfiguration.bookingWorkflow,
            planPrice: botConfiguration.planPrice
          }),
          // Calendar connection data (if connected via Unipile)
          ...(calendarData && {
            calendar_integration: calendarData
          })
        })
      });

      const data = await response.json();
      
      // Handle the response format: [{"output": "response", "intermediateSteps": []}]
      let responseText = 'Sorry, I encountered an issue. Please try again.';
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        responseText = data[0].output;
      } else if (data.response) {
        responseText = data.response;
      } else if (data.message) {
        responseText = data.message;
      } else if (data.output) {
        responseText = data.output;
      }
      
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I am unable to connect right now. Please try again in a moment.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Mock voice functions for now
  const toggleListening = () => {
    setIsListening(!isListening);
    // Voice recognition would be implemented here
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    // Text-to-speech would be implemented here
  };

  const quickActions = [
    'Tell me about your features',
    'What are your pricing plans?',
    'How do I get started?',
    'Can I see a demo?'
  ];

  const handleQuickAction = (action: string) => {
    setInputMessage(action);
    setTimeout(() => sendMessage(), 100);
  };

  return (
    <div 
      className={`bg-white rounded-2xl shadow-xl border overflow-hidden flex flex-col ${className}`}
      style={{ 
        height,
        borderRadius: customization?.borderRadius || '1rem',
        fontFamily: fontFamily
      }}
    >
      {/* Header */}
      <div 
        className="px-6 py-4 text-white relative overflow-hidden"
        style={{ 
          background: `linear-gradient(135deg, ${actualPrimaryColor} 0%, ${adjustColor(actualPrimaryColor, -20)} 100%)` 
        }}
      >
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
              <span className="text-xl">🤖</span>
            </div>
            <div>
              <h3 className="font-semibold text-lg">{actualTitle}</h3>
              <p className="text-sm opacity-90">
                {isLoading ? 'Typing...' : `Chat with ${actualAssistantName}`}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleSpeaking}
              className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all"
              title={isSpeaking ? 'Mute responses' : 'Enable voice responses'}
            >
              {isSpeaking ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Container */}
      <div 
        ref={messagesContainerRef}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50"
      >
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex flex-col ${message.sender === 'user' ? 'items-end' : 'items-start'}`}>
              {message.sender === 'bot' && (
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                    <span className="text-xs">🤖</span>
                  </div>
                  <span className="text-xs text-gray-500 font-medium">{actualAssistantName}</span>
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                  message.sender === 'user'
                    ? 'text-white rounded-br-md'
                    : 'bg-white text-gray-800 rounded-bl-md border'
                }`}
                style={message.sender === 'user' ? { backgroundColor: actualPrimaryColor } : {}}
              >
                <p className="text-sm leading-relaxed">{message.text}</p>
              </div>
              <span className="text-xs text-gray-400 mt-1">{formatTime(message.timestamp)}</span>
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex flex-col items-start">
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                  <span className="text-xs">🤖</span>
                </div>
                <span className="text-xs text-gray-500 font-medium">{actualAssistantName}</span>
              </div>
              <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md border shadow-sm">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions - Show when conversation is new */}
      {messages.length <= 1 && (
        <div className="px-6 py-3 bg-white border-t">
          <div className="flex flex-wrap gap-2">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleQuickAction(action)}
                className="text-xs px-3 py-2 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
                style={{ borderColor: `${actualPrimaryColor}20`, color: actualPrimaryColor }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${actualPrimaryColor}10`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                }}
              >
                {action}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="p-6 bg-white border-t">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={actualPlaceholder}
              disabled={isLoading}
              className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:border-transparent resize-none"
              style={{ focusRingColor: `${actualPrimaryColor}20` }}
            />
            <button
              onClick={toggleListening}
              className={`absolute right-3 top-3 p-1 rounded-full transition-all ${
                isListening ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
              }`}
              title={isListening ? 'Stop listening' : 'Start voice input'}
            >
              {isListening ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className="px-6 py-3 rounded-xl text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg"
            style={{ backgroundColor: actualPrimaryColor }}
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper function to adjust color brightness
function adjustColor(color: string, amount: number): string {
  const num = parseInt(color.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + amount));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}