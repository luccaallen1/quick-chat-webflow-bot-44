import React, { useRef } from 'react';
import { Send, Phone } from 'lucide-react';
import { VoiceControls } from '../VoiceControls';
import { VoiceSettings } from '../VoiceSettings';

interface ChatbotInputProps {
  inputMessage: string;
  placeholder: string;
  isLoading: boolean;
  isTyping: boolean;
  primaryColor: string;
  botTextColor: string;
  chatBackground: string;
  
  // Voice features
  isVoiceEnabled: boolean;
  isVoiceMode: boolean;
  isRecording: boolean;
  isProcessing: boolean;
  recordingTimer: number;
  isSpeaking: boolean;
  voicePermissionDenied: boolean;
  autoPlayResponses: boolean;
  selectedVoice: string;
  
  // ElevenLabs
  isElevenLabsEnabled: boolean;
  elevenLabsAgentId?: string;
  hasUserMessages: boolean;
  
  // Event handlers
  onInputChange: (value: string) => void;
  onSendMessage: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  onCallMode: () => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStopSpeaking: () => void;
  onToggleVoice: () => void;
  onToggleAutoPlay: () => void;
  onVoiceChange: (voice: string) => void;
}

export const ChatbotInput: React.FC<ChatbotInputProps> = ({
  inputMessage,
  placeholder,
  isLoading,
  isTyping,
  primaryColor,
  botTextColor,
  chatBackground,
  isVoiceEnabled,
  isVoiceMode,
  isRecording,
  isProcessing,
  recordingTimer,
  isSpeaking,
  voicePermissionDenied,
  autoPlayResponses,
  selectedVoice,
  isElevenLabsEnabled,
  elevenLabsAgentId,
  hasUserMessages,
  onInputChange,
  onSendMessage,
  onKeyPress,
  onCallMode,
  onStartRecording,
  onStopRecording,
  onStopSpeaking,
  onToggleVoice,
  onToggleAutoPlay,
  onVoiceChange
}) => {
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onInputChange(e.target.value);
    
    // Auto-resize textarea
    if (inputRef.current) {
      inputRef.current.style.height = '44px';
      const newHeight = Math.min(inputRef.current.scrollHeight, 100);
      inputRef.current.style.height = newHeight + 'px';
    }
  };

  const handleSend = () => {
    if (inputMessage.trim() && !isTyping) {
      onSendMessage();
      // Reset textarea height
      if (inputRef.current) {
        inputRef.current.style.height = '44px';
      }
    }
  };

  return (
    <div className="chatbot-widget-input" style={{
      flex: '0 0 auto',
      padding: '0.75rem',
      backgroundColor: chatBackground,
      borderTop: '1px solid #e5e7eb',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    }}>
      {/* Call AI Voice Agent Button */}
      {!hasUserMessages && isElevenLabsEnabled && elevenLabsAgentId && (
        <button 
          onClick={onCallMode}
          className="w-full mb-3 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
          style={{
            backgroundColor: primaryColor,
            fontSize: '16px',
            fontWeight: '600'
          }}
        >
          <Phone style={{ width: '20px', height: '20px' }} />
          Call our AI Voice Agent
        </button>
      )}
      
      <div className="chatbot-widget-input-container" style={{
        display: 'flex',
        gap: '0.5rem',
        alignItems: 'flex-end'
      }}>
        {/* Text Input */}
        <textarea 
          ref={inputRef} 
          value={inputMessage} 
          onChange={handleInputChange}
          onKeyDown={onKeyPress}
          placeholder={
            isVoiceEnabled && isRecording ? 'Listening...' : 
            isVoiceEnabled && isProcessing ? 'Processing...' : 
            placeholder
          } 
          disabled={isLoading || (isVoiceEnabled && (isRecording || isProcessing))} 
          className="chatbot-widget-input-field" 
          style={{
            color: botTextColor,
            opacity: isVoiceEnabled && (isRecording || isProcessing) ? 0.7 : 1,
            minHeight: '44px',
            maxHeight: '100px',
            resize: 'none',
            overflow: 'auto',
            lineHeight: '1.5',
            padding: '0.75rem 1rem',
            fontSize: '16px' // Prevent zoom on iOS
          }} 
          autoComplete="off" 
          autoCorrect="off" 
          autoCapitalize="sentences" 
          spellCheck="true" 
          rows={1}
        />
        
        {/* Voice Controls */}
        {isVoiceEnabled && (
          <VoiceControls
            isRecording={isRecording}
            isProcessing={isProcessing}
            recordingTimer={recordingTimer}
            isSpeaking={isSpeaking}
            voicePermissionDenied={voicePermissionDenied}
            isVoiceEnabled={isVoiceMode}
            onStartRecording={onStartRecording}
            onStopRecording={onStopRecording}
            onStopSpeaking={onStopSpeaking}
            onToggleVoice={onToggleVoice}
            primaryColor={primaryColor}
          />
        )}
        
        {/* Send Button */}
        <button 
          onClick={handleSend}
          disabled={isLoading || !inputMessage.trim() || (isVoiceEnabled && (isRecording || isProcessing))} 
          className="chatbot-widget-send-button" 
          style={{
            backgroundColor: primaryColor,
            alignSelf: 'flex-end',
            marginBottom: '2px'
          }}
        >
          <Send style={{ width: '14px', height: '14px' }} />
        </button>
      </div>

      {/* Voice Settings */}
      {isVoiceEnabled && isVoiceMode && (
        <VoiceSettings
          selectedVoice={selectedVoice}
          onVoiceChange={onVoiceChange}
          autoPlayResponses={autoPlayResponses}
          onAutoPlayToggle={onToggleAutoPlay}
          primaryColor={primaryColor}
        />
      )}
    </div>
  );
};