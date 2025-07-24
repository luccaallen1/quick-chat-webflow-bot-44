
import React from 'react';
import { Mic, MicOff, Volume2, VolumeX, Square } from 'lucide-react';

interface VoiceControlsProps {
  isRecording: boolean;
  isProcessing: boolean;
  recordingTimer: number;
  isSpeaking: boolean;
  voicePermissionDenied: boolean;
  isVoiceEnabled: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onStopSpeaking: () => void;
  onToggleVoice: () => void;
  primaryColor: string;
}

export const VoiceControls: React.FC<VoiceControlsProps> = ({
  isRecording,
  isProcessing,
  recordingTimer,
  isSpeaking,
  voicePermissionDenied,
  isVoiceEnabled,
  onStartRecording,
  onStopRecording,
  onToggleVoice,
  onStopSpeaking,
  primaryColor
}) => {
  return (
    <div className="voice-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      {/* Voice toggle button */}
      <button
        onClick={onToggleVoice}
        className="chatbot-widget-button"
        style={{ 
          color: isVoiceEnabled ? primaryColor : '#9ca3af',
          padding: '6px'
        }}
        title={isVoiceEnabled ? 'Voice enabled' : 'Voice disabled'}
      >
        {isVoiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
      </button>

      {/* Recording controls */}
      {isVoiceEnabled && !voicePermissionDenied && (
        <>
          {!isRecording && !isProcessing && !isSpeaking && (
            <button
              onClick={onStartRecording}
              className="chatbot-widget-voice-button"
              style={{
                backgroundColor: primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'scale(1.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
              title="Click to start voice recording"
            >
              <Mic size={18} />
            </button>
          )}

          {(isRecording || isProcessing) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onStopRecording}
                className="chatbot-widget-voice-button"
                style={{
                  backgroundColor: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  animation: isRecording ? 'chatbot-pulse 1.5s infinite' : 'none'
                }}
                title="Click to stop recording"
              >
                {isProcessing ? <Square size={14} /> : <MicOff size={18} />}
              </button>
              
              {isRecording && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#ef4444', 
                  fontWeight: '600',
                  minWidth: '30px'
                }}>
                  {Math.max(0, 15 - recordingTimer)}s
                </div>
              )}
              
              {isProcessing && (
                <div style={{ 
                  fontSize: '12px', 
                  color: primaryColor, 
                  fontWeight: '500'
                }}>
                  Processing...
                </div>
              )}
            </div>
          )}

          {isSpeaking && (
            <button
              onClick={onStopSpeaking}
              className="chatbot-widget-voice-button"
              style={{
                backgroundColor: primaryColor,
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                animation: 'chatbot-pulse 2s infinite'
              }}
              title="Click to stop speaking"
            >
              <VolumeX size={18} />
            </button>
          )}
        </>
      )}

      {voicePermissionDenied && (
        <div style={{ 
          fontSize: '11px', 
          color: '#ef4444', 
          fontWeight: '500',
          maxWidth: '120px',
          lineHeight: '1.2'
        }}>
          Mic access denied
        </div>
      )}
    </div>
  );
};
