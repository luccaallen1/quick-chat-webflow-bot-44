import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Bot, Edit, Check, Calendar, HelpCircle, Bell, Phone } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { useVoiceChat } from '../hooks/useVoiceChat';
import { VoiceControls } from './VoiceControls';
import { VoiceSettings } from './VoiceSettings';
import { CallInterface } from './CallInterface';
import './ChatbotWidget.css';
interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  showSuggestions?: boolean;
}
interface ChatbotWidgetProps {
  webhookUrl?: string;
  title?: string;
  placeholder?: string;
  position?: 'bottom-right' | 'bottom-left';
  primaryColor?: string;
  secondaryColor?: string;
  textColor?: string;
  userTextColor?: string;
  chatBackground?: string;
  userId?: string;
  clinicName?: string;
  clinicId?: string;
  logoUrl?: string;
  logoFile?: File;
  welcomeMessage?: string;
  admin?: boolean;
  isVoiceEnabled?: boolean;
  elevenLabsAgentId?: string;
}

// Helper function to render text with line breaks
const renderTextWithLineBreaks = (text: string) => {
  return text.split('\n').map((line, index) => <span key={index}>
      {line}
      {index < text.split('\n').length - 1 && <br />}
    </span>);
};

// Update the logError function to include timestamp and initializationUrl
const logError = async (errorData: {
  from: 'webhook' | 'UI' | 'initialization';
  errorCode: number;
  errorMessage: string;
  errorStack: string;
  payloadToWebHook: any;
  initializationUrl: string;
}) => {
  try {
    await fetch('https://luccatora.app.n8n.cloud/webhook/webbot-error', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ...errorData,
        timestamp: new Date().toISOString()
      })
    });
  } catch (logError) {
    console.error('Failed to log error:', logError);
  }
};

// Add a global error boundary for the entire chatbot
const handleGlobalError = (error: Error) => {
  logError({
    from: 'UI',
    errorCode: 500,
    errorMessage: error.message,
    errorStack: error.stack || '',
    payloadToWebHook: null,
    initializationUrl: window.location.href
  });
};
export const ChatbotWidget: React.FC<ChatbotWidgetProps> = ({
  webhookUrl = '',
  title = 'Chat Support',
  placeholder = 'Type your message...',
  position = 'bottom-right',
  primaryColor = '#3b82f6',
  secondaryColor = '#f1f5f9',
  textColor = '#1f2937',
  userTextColor = '#ffffff',
  chatBackground = '#ffffff',
  userId = 'anonymous',
  // Keep as fallback but won't be used for webhook
  clinicName = 'Gadsden',
  clinicId = '104',
  logoUrl = 'https://media.licdn.com/dms/image/v2/D4E0BAQFRPXC4w25iOw/company-logo_200_200/B4EZVtx7beHgAI-/0/1741303560536?e=2147483647&v=beta&t=IMfviElZP1Vi86km2p9hrP-uuXQZxo1Ux_BvQ9-o0l4',
  logoFile,
  welcomeMessage = 'Hello! How can I help you today?',
  admin = false,
  isVoiceEnabled = false,
  elevenLabsAgentId = 'agent_01k04zwwq3fv5acgzdwmbvfk8k'
}) => {
  // Create logo URL from file if provided
  const [logoSrc, setLogoSrc] = useState<string>(logoUrl);
  
  useEffect(() => {
    if (logoFile) {
      const url = URL.createObjectURL(logoFile);
      setLogoSrc(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setLogoSrc(logoUrl);
    }
  }, [logoFile, logoUrl]);
  // Voice functionality - only initialize if voice is enabled
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [autoPlayResponses, setAutoPlayResponses] = useState(true);

  // NEW: Call interface state for ElevenLabs voice agent
  const [isCallMode, setIsCallMode] = useState(false);

  // Voice chat hook - only use if voice is enabled
  const voiceChat = useVoiceChat({
    onTranscription: (text: string) => {
      if (text.trim()) {
        sendMessage(text);
      }
    },
    isVoiceEnabled: isVoiceEnabled && isVoiceMode,
    autoPlayResponses: isVoiceEnabled ? autoPlayResponses : false
  });

  // Conditionally destructure voice chat properties
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

  // Add error state
  const [hasError, setHasError] = useState(false);

  // Generate or retrieve session ID - this will be our primary user identifier
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
  const getOrCreateSessionId = () => {
    if (typeof window === 'undefined') return generateSessionId();
    let sessionId = sessionStorage.getItem('chatbot-session-id');
    if (!sessionId) {
      sessionId = generateSessionId();
      sessionStorage.setItem('chatbot-session-id', sessionId);
    }
    return sessionId;
  };
  const [sessionId] = useState(() => getOrCreateSessionId());
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingError, setEditingError] = useState('');
  const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const [isNotificationEnabled, setIsNotificationEnabled] = useState(true);
  const [suggestionsDisabled, setSuggestionsDisabled] = useState(false);
  const [dynamicHeight, setDynamicHeight] = useState<number>(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const chatWindowRef = useRef<HTMLDivElement>(null);

  // Enhanced mobile viewport height management
  useEffect(() => {
    const updateViewportHeight = () => {
      if (typeof window !== 'undefined') {
        // Use window.innerHeight for accurate mobile viewport
        const vh = window.innerHeight;
        const vw = window.innerWidth;

        // Set both standard and mobile-specific viewport heights
        setDynamicHeight(vh);
        document.documentElement.style.setProperty('--chatbot-vh', `${vh}px`);
        document.documentElement.style.setProperty('--chatbot-mobile-vh', `${vh}px`);

        // Detect if we're likely on mobile
        const isMobile = vw <= 768;
        if (isMobile) {
          // Use fill-available for better mobile support
          document.documentElement.style.setProperty('--chatbot-mobile-vh', '-webkit-fill-available');
        }
        console.log('Viewport updated:', {
          vh,
          vw,
          isMobile
        });
      }
    };

    // Initial height setup
    updateViewportHeight();

    // Keyboard detection for mobile
    const handleResize = () => {
      updateViewportHeight();

      // Detect keyboard on mobile (viewport height change)
      if (typeof window !== 'undefined' && window.innerWidth <= 768) {
        const currentHeight = window.innerHeight;
        const isKeyboardOpen = currentHeight < window.screen.height * 0.75;
        const container = document.querySelector('.chatbot-widget-container');
        if (container) {
          if (isKeyboardOpen) {
            container.classList.add('keyboard-open');
          } else {
            container.classList.remove('keyboard-open');
          }
        }
      }
    };

    // Enhanced event listeners for mobile
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', () => {
      // Delay to allow orientation change to complete
      setTimeout(updateViewportHeight, 100);
      setTimeout(updateViewportHeight, 300); // Double check after animation
    });

    // Visual viewport API support for modern browsers
    if (window.visualViewport) {
      const handleVisualViewportChange = () => {
        const vh = window.visualViewport.height;
        document.documentElement.style.setProperty('--chatbot-mobile-vh', `${vh}px`);

        // Detect keyboard based on visual viewport
        const isKeyboardOpen = vh < window.innerHeight * 0.8;
        const container = document.querySelector('.chatbot-widget-container');
        if (container) {
          if (isKeyboardOpen) {
            container.classList.add('keyboard-open');
          } else {
            container.classList.remove('keyboard-open');
          }
        }
      };
      window.visualViewport.addEventListener('resize', handleVisualViewportChange);
      window.visualViewport.addEventListener('scroll', handleVisualViewportChange);
      return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('orientationchange', updateViewportHeight);
        window.visualViewport.removeEventListener('resize', handleVisualViewportChange);
        window.visualViewport.removeEventListener('scroll', handleVisualViewportChange);
      };
    }
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', updateViewportHeight);
    };
  }, []);

  // Enhanced input focus handling for mobile keyboard with iOS Safari fixes
  useEffect(() => {
    const handleInputFocus = () => {
      // iOS Safari keyboard handling with double-timeout technique
      setTimeout(() => {
        // Force layout recalculation
        if (window.innerWidth <= 768) {
          const container = document.querySelector('.chatbot-widget-container');
          if (container) {
            container.classList.add('keyboard-open');
          }
        }
        
        setTimeout(() => {
          scrollToBottom();
          
          // Scroll input into view on mobile with momentum considerations
          if (inputRef.current && window.innerWidth <= 768) {
            inputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'center',
              inline: 'nearest'
            });
            
            // Additional iOS Safari viewport adjustment
            setTimeout(() => {
              const container = chatWindowRef.current;
              if (container) {
                container.scrollTop = container.scrollHeight;
              }
            }, 100);
          }
        }, 50);
      }, 0);
      
      // Additional check for slower devices with enhanced viewport detection
      setTimeout(() => {
        if (inputRef.current && window.innerWidth <= 768) {
          const rect = inputRef.current.getBoundingClientRect();
          const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
          const isVisible = rect.bottom <= viewportHeight;
          if (!isVisible) {
            inputRef.current.scrollIntoView({
              behavior: 'smooth',
              block: 'end'
            });
          }
        }
      }, 300);
    };

    const handleInputBlur = () => {
      // Clean up keyboard detection with momentum preservation
      setTimeout(() => {
        const container = document.querySelector('.chatbot-widget-container');
        if (container) {
          container.classList.remove('keyboard-open');
        }
        // Preserve scroll momentum while cleaning up
        setTimeout(() => {
          scrollToBottom();
        }, 100);
      }, 150);
    };

    const inputElement = inputRef.current;
    if (inputElement) {
      inputElement.addEventListener('focus', handleInputFocus);
      inputElement.addEventListener('blur', handleInputBlur);

      // Enhanced iOS zoom prevention
      inputElement.addEventListener('touchstart', e => {
        // Prevent zoom by ensuring font-size is 16px+ and using manipulation
        e.preventDefault();
        inputElement.focus();
      });

      return () => {
        inputElement.removeEventListener('focus', handleInputFocus);
        inputElement.removeEventListener('blur', handleInputBlur);
        inputElement.removeEventListener('touchstart', () => {});
      };
    }
  }, [isOpen]);

  // Update welcome message when prop changes
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

  // Set CSS custom properties for theming
  useEffect(() => {
    // Find the chatbot container
    const container = document.querySelector('.chatbot-widget-container') as HTMLElement;
    if (container) {
      // Apply variables to the container
      container.style.setProperty('--chatbot-primary', primaryColor);
      container.style.setProperty('--chatbot-secondary', secondaryColor);
      container.style.setProperty('--chatbot-text', textColor);
      container.style.setProperty('--chatbot-user-text', userTextColor);
      container.style.setProperty('--chatbot-background', chatBackground);

      // Also apply to the root element to ensure they cascade properly
      document.documentElement.style.setProperty('--chatbot-primary', primaryColor);
      document.documentElement.style.setProperty('--chatbot-secondary', secondaryColor);
      document.documentElement.style.setProperty('--chatbot-text', textColor);
      document.documentElement.style.setProperty('--chatbot-user-text', userTextColor);
      document.documentElement.style.setProperty('--chatbot-background', chatBackground);

      // Force a reflow to ensure styles are applied
      container.offsetHeight;
      console.log('Chatbot styles updated:', {
        primaryColor,
        secondaryColor,
        textColor,
        userTextColor,
        chatBackground
      });
    } else {
      console.warn('Chatbot container not found. Styles not applied.');
    }
  }, [primaryColor, secondaryColor, textColor, userTextColor, chatBackground]);
  const scrollToBottom = () => {
    // Double-timeout technique for optimal mobile scrolling
    setTimeout(() => {
      const messagesContainer = document.querySelector('.chatbot-widget-messages');
      if (messagesContainer) {
        // Force layout recalculation first
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Then apply smooth scrolling
        setTimeout(() => {
          messagesContainer.scroll({
            top: messagesContainer.scrollHeight,
            behavior: 'smooth'
          });
        }, 50);
      }
    }, 0);
  };

  // Add MutationObserver for auto-scroll on content changes
  useEffect(() => {
    const messagesContainer = document.querySelector('.chatbot-widget-messages');
    if (!messagesContainer) return;

    const observer = new MutationObserver(() => {
      // Check if user is near bottom before auto-scrolling
      const isNearBottom = messagesContainer.scrollTop + messagesContainer.clientHeight >= messagesContainer.scrollHeight - 100;
      if (isNearBottom) {
        scrollToBottom();
      }
    });

    observer.observe(messagesContainer, {
      childList: true,
      subtree: true
    });

    return () => observer.disconnect();
  }, [isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  useEffect(() => {
    if (isOpen) {
      setHasUnreadMessages(false);
      // Ensure proper viewport height when opening
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          const vh = window.innerHeight;
          setDynamicHeight(vh);
          document.documentElement.style.setProperty('--chatbot-vh', `${vh}px`);
        }
      }, 100);
    }
  }, [isOpen]);

  // Add state for tooltip visibility with timer
  const [showWelcomeTooltip, setShowWelcomeTooltip] = useState(true);
  const tooltipTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced tooltip management with auto-hide after 15 seconds
  useEffect(() => {
    if (showWelcomeTooltip && !isOpen) {
      // Start 15-second timer to auto-hide tooltip
      // tooltipTimeoutRef.current = setTimeout(() => {
      //   setShowWelcomeTooltip(false);
      // }, 15000);
    }

    // Clear timeout when component unmounts or tooltip is manually hidden
    return () => {
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    };
  }, [showWelcomeTooltip, isOpen]);

  // Hide tooltip when chat opens
  useEffect(() => {
    if (isOpen) {
      setShowWelcomeTooltip(false);
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
    }
  }, [isOpen]);

  // Add scroll event listener to hide tooltip after scrolling
  useEffect(() => {
    let scrollTimeout: NodeJS.Timeout | null = null;
    let scrollTimer = 0;
    const handleScroll = () => {
      if (showWelcomeTooltip) {
        // Clear existing timeout
        if (scrollTimeout) {
          clearTimeout(scrollTimeout);
        }

        // Start/restart the 15-second timer on scroll
        scrollTimeout = setTimeout(() => {
          setShowWelcomeTooltip(false);
        }, 15000);
        scrollTimer = Date.now();
      }
    };

    // Add scroll listener to window
    window.addEventListener('scroll', handleScroll, {
      passive: true
    });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
    };
  }, [showWelcomeTooltip]);

  // Add state for chat button click
  const [chatButtonClickCount, setChatButtonClickCount] = useState(0);

  // Handle chat button click - hide tooltip immediately
  const handleChatButtonClick = () => {
    setShowWelcomeTooltip(false);
    if (tooltipTimeoutRef.current) {
      clearTimeout(tooltipTimeoutRef.current);
    }
    setIsOpen(true);
  };

  // Add missing function: sendCorrectionToWebhook
  const sendCorrectionToWebhook = async (originalText: string, correctedText: string) => {
    try {
      if (!webhookUrl) {
        console.warn('Webhook URL not configured for correction');
        return;
      }
      const correctionPayload = {
        type: 'correction',
        originalMessage: originalText,
        correctedMessage: correctedText,
        userId: sessionId,
        clinicName,
        clinicId,
        timestamp: new Date().toISOString()
      };
      console.log('Sending correction to webhook:', correctionPayload);
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(correctionPayload)
      });
    } catch (error) {
      console.error('Error sending correction to webhook:', error);
      // Log error for debugging
      await logError({
        from: 'webhook',
        errorCode: 500,
        errorMessage: error instanceof Error ? error.message : 'Unknown correction error',
        errorStack: error instanceof Error ? error.stack || '' : '',
        payloadToWebHook: {
          type: 'correction',
          originalMessage: originalText,
          correctedMessage: correctedText,
          userId: sessionId,
          clinicName,
          clinicId
        },
        initializationUrl: window.location.href
      });
    }
  };

  // Add missing function: handleSuggestionClick
  const handleSuggestionClick = (suggestion: string) => {
    if (suggestionsDisabled) return;

    // Send the suggestion as a message
    sendMessage(suggestion);

    // Disable suggestions after clicking
    setSuggestionsDisabled(true);
  };

  // Enhanced sendMessage function with conditional voice response
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
    try {
      if (!webhookUrl) {
        throw new Error('Webhook URL not configured');
      }

      // Always use sessionId as userId for webhook requests - never send anonymous
      const webhookPayload = {
        message: textToSend,
        userId: sessionId,
        // Use sessionId instead of userId prop
        clinicName,
        clinicId,
        timestamp: new Date().toISOString()
      };
      console.log('Sending webhook payload:', webhookPayload);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookPayload),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      const data = await response.json();
      console.log('Webhook response:', data);
      let botResponse = 'Sorry, I could not process your request.';
      if (Array.isArray(data) && data.length > 0 && data[0].output) {
        botResponse = data[0].output;
      } else if (data.message) {
        botResponse = data.message;
      } else if (data.response) {
        botResponse = data.response;
      } else if (typeof data === 'string') {
        botResponse = data;
      }
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, botMessage]);

      // Auto-play response if voice is enabled and voice mode is on
      if (isVoiceEnabled && isVoiceMode && autoPlayResponses && !isSpeaking) {
        setTimeout(() => {
          speakText(botResponse);
        }, 500);
      }

      // Show notification if widget is closed
      if (!isOpen && isNotificationEnabled) {
        setHasUnreadMessages(true);
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(title, {
            body: botResponse.length > 50 ? botResponse.substring(0, 50) + '...' : botResponse,
            icon: logoUrl || '/favicon.ico'
          });
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);

      // Log error for debugging
      await logError({
        from: 'webhook',
        errorCode: 500,
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
        errorStack: error instanceof Error ? error.stack || '' : '',
        payloadToWebHook: {
          message: textToSend,
          userId: sessionId,
          // Log sessionId, not anonymous
          clinicName,
          clinicId,
          timestamp: new Date().toISOString()
        },
        initializationUrl: window.location.href
      });

      // Retry logic
      if (retryCount < 2 && error instanceof Error && error.name !== 'AbortError') {
        console.log(`Retrying... Attempt ${retryCount + 1}`);
        setTimeout(() => {
          sendMessage(textToSend, retryCount + 1);
        }, 1000 * (retryCount + 1));
        return;
      }
      setHasError(true);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: retryCount >= 2 ? 'I apologize, but I\'m having trouble connecting right now. Please try again in a moment.' : 'Sorry, I encountered an error. Please try again.',
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
  const handleEditMessage = (message: Message) => {
    setEditingMessageId(message.id);
    setEditingText(message.text);
    setEditingError('');
  };
  const handleSaveEdit = async (messageId: string) => {
    const trimmedText = editingText.trim();
    if (!trimmedText) {
      setEditingError('Message cannot be empty');
      return;
    }
    const message = messages.find(m => m.id === messageId);
    if (!message) return;
    const originalText = message.text;
    if (trimmedText !== originalText) {
      setMessages(prev => prev.map(m => m.id === messageId ? {
        ...m,
        text: trimmedText
      } : m));
      await sendCorrectionToWebhook(originalText, trimmedText);
    }
    setEditingMessageId(null);
    setEditingText('');
    setEditingError('');
  };
  const handleCancelEdit = () => {
    setEditingMessageId(null);
    setEditingText('');
    setEditingError('');
  };
  const handleEditKeyPress = (e: React.KeyboardEvent, messageId: string) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit(messageId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };
  const isEditingTextValid = editingText.trim().length > 0;
  const toggleVoiceMode = () => {
    if (!isVoiceEnabled) return; // Don't allow toggle if voice is disabled
    setIsVoiceMode(!isVoiceMode);
    if (isVoiceMode && stopSpeaking) {
      stopSpeaking();
    }
  };
  const toggleAutoPlay = () => {
    if (!isVoiceEnabled) return; // Don't allow toggle if voice is disabled
    setAutoPlayResponses(!autoPlayResponses);
    if (!autoPlayResponses && stopSpeaking) {
      stopSpeaking();
    }
  };

  // Truncate session ID for display (show first 8 characters)
  const displaySessionId = sessionId.length > 8 ? `${sessionId.substring(0, 8)}...` : sessionId;

  // Helper function to get hover color (slightly darker than the base color)
  const getHoverColor = (color: string) => {
    // Simple way to darken a hex color
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const num = parseInt(hex, 16);
      const r = Math.max(0, (num >> 16) - 20);
      const g = Math.max(0, (num >> 8 & 0x00FF) - 20);
      const b = Math.max(0, (num & 0x0000FF) - 20);
      return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
    }
    return color;
  };
  return <div 
    className={`chatbot-widget-container chatbot-widget-${position}`} 
    style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: position === 'bottom-right' ? '1.5rem' : 'auto',
      left: position === 'bottom-left' ? '1.5rem' : 'auto',
      top: 'auto',
      zIndex: 2147483647
    }}
    ref={(el) => {
      if (el) {
        console.log('Widget position:', {
          position: position,
          computedStyle: window.getComputedStyle(el),
          bottom: window.getComputedStyle(el).bottom,
          top: window.getComputedStyle(el).top,
          right: window.getComputedStyle(el).right,
          left: window.getComputedStyle(el).left
        });
      }
    }}
  >
      {/* Chat Window */}
      {isOpen && <div ref={chatWindowRef} className="chatbot-widget-window chatbot-widget-animate-in" style={{
      height: window.innerWidth <= 768 ? '100vh' : dynamicHeight > 0 ? `min(${dynamicHeight * 0.9}px, 600px)` : '600px',
      maxHeight: window.innerWidth <= 768 ? '100vh' : dynamicHeight > 0 ? `${dynamicHeight * 0.9}px` : '600px'
    }}>
          {/* Header */}
          <div className="chatbot-widget-header" style={{
        backgroundColor: primaryColor
      }}>
            <div className="chatbot-widget-header-content">
              <div className="chatbot-widget-header-avatar">
                {logoSrc && <img src={logoSrc} alt="Logo" className="chatbot-widget-logo" onError={e => {
              console.error('Logo failed to load:', logoSrc);
              e.currentTarget.style.display = 'none';
            }} onLoad={() => {
              console.log('Logo loaded successfully:', logoSrc);
            }} />}
              </div>
              <div>
                <h3 className="chatbot-widget-header-title">{title}</h3>
                <p className="chatbot-widget-header-subtitle">
                  ID: {displaySessionId}
                  {isVoiceEnabled && isVoiceMode && <span style={{
                marginLeft: '8px',
                fontSize: '10px'
              }}>🎤 Voice Mode</span>}
                </p>
              </div>
            </div>
            <div className="chatbot-widget-header-actions">
              {/* NEW: Voice Agent Call Button */}
              <button className="chatbot-widget-button" onClick={() => setIsCallMode(true)} title="Start a call" style={{
            marginRight: '8px',
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
          }}>
                <Phone style={{
              width: '26px',
              height: '26px',
              color: '#1f2937 !important'
            }} className="bg-transparent" />
              </button>
              
              <button className="chatbot-widget-button" onClick={() => setIsOpen(false)}>
                <X style={{
              width: '16px',
              height: '16px'
            }} />
              </button>
            </div>
          </div>
          
          {/* NEW: Conditional rendering for Call Interface or Regular Chat */}
        {isCallMode ? <CallInterface primaryColor={primaryColor} secondaryColor={secondaryColor} textColor={textColor} chatBackground={chatBackground} logoUrl={logoUrl} agentId={elevenLabsAgentId} onBackToChat={() => setIsCallMode(false)} /> : <>
              {/* Messages */}
              {hasError ? <div className="chatbot-widget-messages chatbot-widget-scrollbar" style={{
          backgroundColor: chatBackground,
          flex: 1,
          overflowY: 'auto',
          paddingBottom: window.innerWidth <= 768 ? undefined : '1rem'
        }}>
                      <div className="chatbot-widget-messages-content">
                        <p className="chatbot-widget-message-text">
                          We're experiencing some technical difficulties. Please refresh the page to try again.
                        </p>
                      </div>
                    </div> : <>
                    <div className="chatbot-widget-messages chatbot-widget-scrollbar" style={{
            backgroundColor: chatBackground,
            flex: 1,
            overflowY: 'auto',
            paddingBottom: window.innerWidth <= 768 ? undefined : '1rem'
          }}>
                      <div className="chatbot-widget-messages-content">
                        {messages.map(message => <div key={message.id} className={`chatbot-widget-message ${message.sender === 'user' ? 'chatbot-widget-message-user' : 'chatbot-widget-message-bot'} ${editingMessageId === message.id ? 'editing' : ''}`}>
                            <div className={`chatbot-widget-message-bubble ${message.sender === 'user' ? 'chatbot-widget-message-bubble-user' : 'chatbot-widget-message-bubble-bot'} ${editingMessageId === message.id ? 'editing' : ''}`} style={{
                  backgroundColor: message.sender === 'user' ? primaryColor : secondaryColor,
                  color: message.sender === 'user' ? userTextColor : textColor,
                  border: message.sender === 'bot' ? `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}` : 'none'
                }}>
                              {editingMessageId === message.id ? <div style={{
                    width: '100%'
                  }}>
                                  <div style={{
                      position: 'relative'
                    }}>
                                    <textarea ref={editingTextareaRef} value={editingText} onChange={e => {
                        setEditingText(e.target.value);
                        setEditingError('');
                      }} onKeyDown={e => handleEditKeyPress(e, message.id)} className={`chatbot-widget-textarea full-width ${editingError ? 'error' : ''}`} style={{
                        color: textColor,
                        backgroundColor: chatBackground
                      }} placeholder="Edit your message..." />
                                    {editingError && <div className="chatbot-widget-error">{editingError}</div>}
                                  </div>
                                  <div className="chatbot-widget-edit-controls">
                                    <button onClick={() => handleSaveEdit(message.id)} disabled={!isEditingTextValid} className="chatbot-widget-button" style={{
                        color: textColor,
                        opacity: !isEditingTextValid ? 0.5 : 1,
                        cursor: !isEditingTextValid ? 'not-allowed' : 'pointer'
                      }}>
                                      <Check style={{
                          width: '14px',
                          height: '14px'
                        }} />
                                    </button>
                                    <button onClick={handleCancelEdit} className="chatbot-widget-button" style={{
                        color: textColor
                      }}>
                                      <X style={{
                          width: '14px',
                          height: '14px'
                        }} />
                                    </button>
                                  </div>
                                </div> : <>
                                  <p className="chatbot-widget-message-text">
                                    {renderTextWithLineBreaks(message.text)}
                                  </p>
                                  
                                  {/* Suggestion Buttons - inside the welcome message bubble */}
                                  {message.showSuggestions && message.sender === 'bot' && !suggestionsDisabled && <div style={{
                      display: 'flex',
                      flexDirection: 'row',
                      gap: '6px',
                      marginTop: '12px',
                      flexWrap: 'nowrap',
                      justifyContent: 'flex-start'
                    }}>
                                      <button onClick={() => handleSuggestionClick('Book now')} disabled={suggestionsDisabled} style={{
                        backgroundColor: primaryColor,
                        border: 'none',
                        color: userTextColor,
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: suggestionsDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: suggestionsDisabled ? 0.6 : 1,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        whiteSpace: 'nowrap',
                        minWidth: 'auto'
                      }} onMouseEnter={e => {
                        if (!suggestionsDisabled) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        }
                      }} onMouseLeave={e => {
                        if (!suggestionsDisabled) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                        }
                      }}>
                                        <Calendar size={14} />
                                        Book Now
                                      </button>
                                      <button onClick={() => handleSuggestionClick('Ask Question?')} disabled={suggestionsDisabled} style={{
                        backgroundColor: primaryColor,
                        border: 'none',
                        color: userTextColor,
                        padding: '8px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        cursor: suggestionsDisabled ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        opacity: suggestionsDisabled ? 0.6 : 1,
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        whiteSpace: 'nowrap',
                        minWidth: 'auto'
                      }} onMouseEnter={e => {
                        if (!suggestionsDisabled) {
                          e.currentTarget.style.transform = 'translateY(-1px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
                        }
                      }} onMouseLeave={e => {
                        if (!suggestionsDisabled) {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
                        }
                      }}>
                                        <HelpCircle size={14} />
                                        Ask Question
                                      </button>
                                    </div>}
                                  
                                  <span className="chatbot-widget-message-timestamp">
                                    {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                                  </span>
                                  {message.sender === 'bot' && admin && <div className="chatbot-widget-message-actions">
                                      <button onClick={() => handleEditMessage(message)} className="chatbot-widget-button" style={{
                        color: textColor
                      }}>
                                        <Edit style={{
                          width: '12px',
                          height: '12px'
                        }} />
                                      </button>
                                    </div>}
                                </>}
                            </div>
                          </div>)}
                        
                        {/* Typing Indicator */}
                        {isTyping && <div className="chatbot-widget-message chatbot-widget-message-bot">
                            <div className="chatbot-widget-message-bubble chatbot-widget-message-bubble-bot" style={{
                  backgroundColor: secondaryColor,
                  color: textColor,
                  border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`
                }}>
                              <div className="chatbot-widget-typing">
                                <div className="chatbot-widget-typing-dot" />
                                <div className="chatbot-widget-typing-dot" />
                                <div className="chatbot-widget-typing-dot" />
                              </div>
                            </div>
                          </div>}
                        <div ref={messagesEndRef} />
                      </div>
                    </div>
          
                    {/* Enhanced Input with conditional Voice Controls */}
                    <div className="chatbot-widget-input" style={{
            position: 'relative'
          }}>
                      {/* Call AI Voice Agent Button - only show if no user messages sent yet */}
                      {!messages.some(msg => msg.sender === 'user') && (
                        <button 
                          onClick={() => setIsCallMode(true)}
                          className="w-full mb-3 py-3 px-4 text-white font-semibold rounded-lg flex items-center justify-center gap-2"
                          style={{
                            background: `linear-gradient(135deg, ${primaryColor} 0%, #1a73e8 100%)`,
                            fontSize: '16px',
                            fontWeight: '600',
                            transition: 'all 0.2s ease',
                            border: 'none',
                            cursor: 'pointer'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, #5a95f5 0%, ${primaryColor} 100%)`;
                            e.currentTarget.style.transform = 'translateY(-1px)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.background = `linear-gradient(135deg, ${primaryColor} 0%, #1a73e8 100%)`;
                            e.currentTarget.style.transform = 'translateY(0)';
                          }}
                        >
                          <Phone style={{ width: '20px', height: '20px' }} />
                          Call our AI Voice Agent
                        </button>
                      )}
                      
                      <div className="chatbot-widget-input-container">
                        <input ref={inputRef} value={inputMessage} onChange={e => setInputMessage(e.target.value)} onKeyPress={handleKeyPress} placeholder={isVoiceEnabled && isRecording ? 'Listening...' : isVoiceEnabled && isProcessing ? 'Processing...' : placeholder} disabled={isLoading || isVoiceEnabled && (isRecording || isProcessing)} className="chatbot-widget-input-field" style={{
                color: textColor,
                opacity: isVoiceEnabled && (isRecording || isProcessing) ? 0.7 : 1
              }} autoComplete="off" autoCorrect="off" autoCapitalize="off" spellCheck="false" />
                        
                        {/* Voice Controls - only show if voice is enabled */}
                        {isVoiceEnabled && <VoiceControls isRecording={isRecording} isProcessing={isProcessing} recordingTimer={recordingTimer} isSpeaking={isSpeaking} voicePermissionDenied={voicePermissionDenied} isVoiceEnabled={isVoiceMode} onStartRecording={startRecording} onStopRecording={stopRecording} onStopSpeaking={stopSpeaking} onToggleVoice={toggleVoiceMode} primaryColor={primaryColor} />}
                        
                        {/* Send Button */}
                        <button onClick={() => {
                if (inputMessage.trim() && !isTyping) {
                  sendMessage(inputMessage);
                }
              }} disabled={isLoading || !inputMessage.trim() || isVoiceEnabled && (isRecording || isProcessing)} className="chatbot-widget-send-button" style={{
                backgroundColor: primaryColor
              }}>
                          <Send style={{
                  width: '14px',
                  height: '14px'
                }} />
                        </button>
                      </div>
          
                      {/* Voice Settings - only show when voice mode is enabled */}
                      {isVoiceEnabled && isVoiceMode && <VoiceSettings selectedVoice={selectedVoice} onVoiceChange={setSelectedVoice} autoPlayResponses={autoPlayResponses} onAutoPlayToggle={toggleAutoPlay} primaryColor={primaryColor} />}
                    </div>
                  </>}
            </>}
        </div>}

      {/* Toggle Button - Only show when chat is closed */}
      {!isOpen && <div style={{
      position: 'relative'
    }}>
          <TooltipProvider>
            <Tooltip open={showWelcomeTooltip} onOpenChange={setShowWelcomeTooltip}>
              <TooltipTrigger asChild>
                <button onClick={handleChatButtonClick} className="chatbot-widget-toggle" style={{
              backgroundColor: primaryColor
            }}>
                  <MessageCircle style={{
                width: '24px',
                height: '24px'
              }} />
                </button>
              </TooltipTrigger>
              <TooltipContent side="left" align="end" className="chatbot-welcome-tooltip" style={{
            backgroundColor: '#ffffff',
            color: textColor,
            border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '18px',
            padding: '12px 16px',
            maxWidth: '280px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px',
            lineHeight: '1.4',
            fontWeight: '400',
            position: 'relative'
          }}>
                <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px'
            }}>
                  <div className="chatbot-widget-header-avatar-tooltip">
                    {logoSrc && <img src={logoSrc} alt="Logo" className="chatbot-widget-logo" onError={e => {
                  console.error('Tooltip logo failed to load:', logoSrc);
                  e.currentTarget.style.display = 'none';
                }} />}
                  </div>
                  <div>
                    {welcomeMessage}
                  </div>
                </div>
                <div style={{
              position: 'absolute',
              right: '-6px',
              bottom: '20px',
              width: '12px',
              height: '12px',
              backgroundColor: '#ffffff',
              border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`,
              borderLeft: 'none',
              borderTop: 'none',
              transform: 'rotate(45deg)'
            }} />
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          {/* Message Indicator */}
          {hasUnreadMessages && <div className="chatbot-widget-notification chatbot-widget-animate-pulse">
              <Bell style={{
          width: '12px',
          height: '12px',
          color: 'white'
        }} />
            </div>}
        </div>}
    </div>;
};