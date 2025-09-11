import React from 'react';
import { Edit } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
  showSuggestions?: boolean;
  sending?: boolean;
}

interface MessageBubbleProps {
  message: Message;
  isMobile: boolean;
  primaryColor: string;
  secondaryColor: string;
  userTextColor: string;
  botTextColor: string;
  editingMessageId: string | null;
  admin: boolean;
  isVoiceEnabled: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  suggestionsDisabled: boolean;
  renderTextWithLineBreaks: (text: string) => React.ReactNode;
  handleEditMessage: (message: Message) => void;
  sendMessage: (text: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = React.memo(({
  message,
  isMobile,
  primaryColor,
  secondaryColor,
  userTextColor,
  botTextColor,
  editingMessageId,
  admin,
  isVoiceEnabled,
  isRecording,
  isProcessing,
  suggestionsDisabled,
  renderTextWithLineBreaks,
  handleEditMessage,
  sendMessage
}) => {
  return (
    <div className={`chatbot-widget-message-bubble ${message.sender === 'user' ? 'chatbot-widget-message-bubble-user' : 'chatbot-widget-message-bubble-bot'} ${editingMessageId === message.id ? 'editing' : ''} ${isMobile ? 'message-bubble-mobile' : ''} ${message.sending ? 'sending' : ''}`} style={{
      backgroundColor: message.sender === 'user' ? primaryColor : secondaryColor,
      color: message.sender === 'user' ? userTextColor : botTextColor,
      border: message.sender === 'bot' ? `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}` : 'none'
    }}>
      {editingMessageId === message.id ? (
        <div style={{ width: '100%' }}>
          <textarea
            defaultValue={message.text}
            style={{
              width: '100%',
              minHeight: '60px',
              border: 'none',
              outline: 'none',
              resize: 'vertical',
              backgroundColor: 'transparent',
              color: 'inherit',
              fontFamily: 'inherit',
              fontSize: 'inherit'
            }}
          />
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '8px',
            justifyContent: 'flex-end'
          }}>
            <button 
              style={{
                backgroundColor: primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px'
              }}
            >
              Save
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="chatbot-widget-message-text">
            {renderTextWithLineBreaks(message.text)}
          </p>
          
          {/* Suggestion Buttons */}
          {message.showSuggestions && message.sender === 'bot' && !suggestionsDisabled && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '16px',
              alignItems: 'flex-start'
            }}>
              {/* Suggestion buttons would go here */}
            </div>
          )}
          
          <span className="chatbot-widget-message-timestamp">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </span>
          
          {message.sender === 'bot' && admin && (
            <div className="chatbot-widget-message-actions">
              <button 
                onClick={() => handleEditMessage(message)} 
                className="chatbot-widget-button" 
                style={{ color: botTextColor }}
              >
                <Edit style={{ width: '12px', height: '12px' }} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.message.text === nextProps.message.text &&
         prevProps.message.sending === nextProps.message.sending &&
         prevProps.editingMessageId === nextProps.editingMessageId &&
         prevProps.isMobile === nextProps.isMobile;
});

MessageBubble.displayName = 'MessageBubble';