import React, { useState, useRef } from 'react';
import { Edit, Check, X, Calendar, HelpCircle } from 'lucide-react';
import { Message, renderTextWithLineBreaks } from './utils';

interface ChatbotMessageProps {
  message: Message;
  primaryColor: string;
  secondaryColor: string;
  botTextColor: string;
  userTextColor: string;
  chatBackground: string;
  isAdmin: boolean;
  suggestionsDisabled: boolean;
  onEditMessage: (message: Message) => void;
  onSaveEdit: (messageId: string, text: string) => void;
  onSuggestionClick: (suggestion: string) => void;
}

export const ChatbotMessage: React.FC<ChatbotMessageProps> = ({
  message,
  primaryColor,
  secondaryColor,
  botTextColor,
  userTextColor,
  chatBackground,
  isAdmin,
  suggestionsDisabled,
  onEditMessage,
  onSaveEdit,
  onSuggestionClick
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingText, setEditingText] = useState(message.text);
  const [editingError, setEditingError] = useState('');
  const editingTextareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditingText(message.text);
    setEditingError('');
    onEditMessage(message);
  };

  const handleSaveEdit = () => {
    const trimmedText = editingText.trim();
    if (!trimmedText) {
      setEditingError('Message cannot be empty');
      return;
    }
    onSaveEdit(message.id, trimmedText);
    setIsEditing(false);
    setEditingError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditingText(message.text);
    setEditingError('');
  };

  const handleEditKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const isUser = message.sender === 'user';
  const isEditingTextValid = editingText.trim().length > 0;

  return (
    <div className={`chatbot-widget-message ${isUser ? 'chatbot-widget-message-user' : 'chatbot-widget-message-bot'} ${isEditing ? 'editing' : ''} chatbot-message-animate`}>
      <div 
        className={`chatbot-widget-message-bubble ${isUser ? 'chatbot-widget-message-bubble-user' : 'chatbot-widget-message-bubble-bot'} ${isEditing ? 'editing' : ''}`}
        style={{
          backgroundColor: isUser ? primaryColor : secondaryColor,
          color: isUser ? userTextColor : botTextColor,
          border: !isUser ? `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}` : 'none'
        }}
      >
        {isEditing ? (
          <div style={{ width: '100%' }}>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={editingTextareaRef}
                value={editingText}
                onChange={(e) => {
                  setEditingText(e.target.value);
                  setEditingError('');
                }}
                onKeyDown={handleEditKeyPress}
                className={`chatbot-widget-textarea full-width ${editingError ? 'error' : ''}`}
                style={{
                  color: botTextColor,
                  backgroundColor: chatBackground
                }}
                placeholder="Edit your message..."
              />
              {editingError && <div className="chatbot-widget-error">{editingError}</div>}
            </div>
            <div className="chatbot-widget-edit-controls">
              <button
                onClick={handleSaveEdit}
                disabled={!isEditingTextValid}
                className="chatbot-widget-button"
                style={{
                  color: botTextColor,
                  opacity: !isEditingTextValid ? 0.5 : 1,
                  cursor: !isEditingTextValid ? 'not-allowed' : 'pointer'
                }}
              >
                <Check style={{ width: '14px', height: '14px' }} />
              </button>
              <button
                onClick={handleCancelEdit}
                className="chatbot-widget-button"
                style={{ color: botTextColor }}
              >
                <X style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="chatbot-widget-message-text">
              {renderTextWithLineBreaks(message.text)}
            </p>
            
            {/* Suggestion Buttons */}
            {message.showSuggestions && !isUser && !suggestionsDisabled && (
              <div style={{
                display: 'flex',
                flexDirection: 'row',
                gap: '6px',
                marginTop: '12px',
                flexWrap: 'nowrap',
                justifyContent: 'flex-start'
              }}>
                <SuggestionButton
                  icon={<Calendar size={14} />}
                  text="Book Now"
                  onClick={() => onSuggestionClick('Book now')}
                  disabled={suggestionsDisabled}
                  primaryColor={primaryColor}
                  userTextColor={userTextColor}
                />
                <SuggestionButton
                  icon={<HelpCircle size={14} />}
                  text="Ask Question"
                  onClick={() => onSuggestionClick('Ask Question?')}
                  disabled={suggestionsDisabled}
                  primaryColor={primaryColor}
                  userTextColor={userTextColor}
                />
              </div>
            )}
            
            <span className="chatbot-widget-message-timestamp">
              {message.timestamp.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
            
            {!isUser && isAdmin && (
              <div className="chatbot-widget-message-actions">
                <button
                  onClick={handleStartEdit}
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
    </div>
  );
};

// Suggestion Button Component
const SuggestionButton: React.FC<{
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  disabled: boolean;
  primaryColor: string;
  userTextColor: string;
}> = ({ icon, text, onClick, disabled, primaryColor, userTextColor }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        backgroundColor: primaryColor,
        border: 'none',
        color: userTextColor,
        padding: '8px 12px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: '600',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        opacity: disabled ? 0.6 : 1,
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
        whiteSpace: 'nowrap',
        minWidth: 'auto'
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(-1px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.2)';
        }
      }}
      onMouseLeave={(e) => {
        if (!disabled) {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.15)';
        }
      }}
    >
      {icon}
      {text}
    </button>
  );
};