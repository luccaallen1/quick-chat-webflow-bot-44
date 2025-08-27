import React, { useState, useRef, useEffect } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Phone, PhoneOff, Volume2 } from 'lucide-react';
import './VoiceWidget.css';

interface VoiceWidgetProps {
  agentId: string;
  title?: string;
  description?: string;
  buttonText?: string;
  buttonColor?: string;
  backgroundColor?: string;
  textColor?: string;
  secondaryTextColor?: string;
  borderColor?: string;
  shadowColor?: string;
  statusBgColor?: string;
  statusTextColor?: string;
  avatarUrl?: string;
  className?: string;
}

export const VoiceWidget: React.FC<VoiceWidgetProps> = ({
  agentId,
  title = 'AI Voice Assistant',
  description = 'Get instant answers to your questions. Our AI assistant is ready to help you 24/7.',
  buttonText = 'Talk to AI Agent',
  buttonColor = '#000000',
  backgroundColor = '#ffffff',
  textColor = '#000000',
  secondaryTextColor = '#666666',
  borderColor = '#e5e7eb',
  shadowColor = 'rgba(0,0,0,0.08)',
  statusBgColor = '#f0fdf4',
  statusTextColor = '#15803d',
  avatarUrl = '/lovable-uploads/46013ce6-0e78-4209-885a-6fc3259809c2.png',
  className = ''
}) => {
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeakerOn, setIsSpeakerOn] = useState(false);
  const callTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Call timer effect
  useEffect(() => {
    if (isConversationOpen) {
      setCallDuration(0);
      callTimerRef.current = setInterval(() => {
        setCallDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
        callTimerRef.current = null;
      }
      setCallDuration(0);
    }

    return () => {
      if (callTimerRef.current) {
        clearInterval(callTimerRef.current);
      }
    };
  }, [isConversationOpen]);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to voice agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from voice agent');
      setConversationId(null);
      setIsConversationOpen(false);
      setCallDuration(0);
      setIsMuted(false);
      setIsSpeakerOn(false);
    },
    onError: (error) => {
      console.error('Voice agent error:', error);
    },
    onMessage: (message) => {
      console.log('Voice message:', message);
    }
  });

  const startVoiceConversation = async () => {
    try {
      // Request microphone permission with better audio settings
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      
      // Monitor audio stream health
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.onended = () => {
          console.warn('Microphone disconnected during call');
          endVoiceConversation();
        };
        
        // Check if track is enabled
        if (!audioTrack.enabled) {
          console.warn('Microphone track is disabled');
        }
      }
      
      // Start the conversation
      const id = await conversation.startSession({ agentId });
      setConversationId(id);
      setIsConversationOpen(true);
      
      // Store stream reference for cleanup
      (window as any).voiceStream = stream;
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start voice conversation. Please check your microphone permissions and ensure the agent ID is correct.');
    }
  };

  const endVoiceConversation = async () => {
    try {
      await conversation.endSession();
      setConversationId(null);
      setIsConversationOpen(false);
      
      // Clean up audio stream
      if ((window as any).voiceStream) {
        const stream = (window as any).voiceStream;
        stream.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        (window as any).voiceStream = null;
      }
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  return (
    <div 
      className={`voice-widget max-w-[400px] sm:max-w-[1200px] w-full rounded-[20px] p-6 sm:p-8 lg:px-[60px] lg:py-10 flex flex-col lg:flex-row items-center gap-6 lg:gap-10 relative ${isConversationOpen ? 'in-call' : ''} ${className}`}
        style={{ 
          backgroundColor,
          boxShadow: `0 10px 30px ${shadowColor}`,
          color: textColor
        }}
      >
        {/* Avatar - Left Side on Desktop */}
        <div className="flex-shrink-0">
          <div className="w-[100px] h-[100px] relative">
            {/* Main Avatar Circle */}
            <div className="w-full h-full rounded-full overflow-hidden" style={{ boxShadow: `0 5px 20px rgba(0,0,0,0.15)` }}>
              <img 
                src={avatarUrl} 
                alt="Brand avatar" 
                className="w-full h-full object-contain"
                style={{
                  imageRendering: 'crisp-edges',
                  filter: 'contrast(1.05) saturate(1.1)'
                }}
              />
            </div>
            
            {/* Phone Icon Badge - Bottom Right Corner */}
            {isConversationOpen ? (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <div className="flex items-end gap-[1px] h-3">
                  {[1, 2, 3, 4, 5].map((bar) => (
                    <div
                      key={bar}
                      className={`w-[1.5px] bg-white rounded-sm ${
                        conversation.isSpeaking ? 'animate-voice-bar' : 'h-1.5'
                      }`}
                      style={{
                        height: conversation.isSpeaking ? undefined : '6px',
                        animationDelay: `${bar * 0.1}s`
                      }}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-gray-800 rounded-full flex items-center justify-center shadow-lg border-2 border-white">
                <Phone className="w-3.5 h-3.5 text-white" />
              </div>
            )}
          </div>
        </div>

        {/* Content - Center on Desktop */}
        <div className="flex-1 text-center lg:text-left">
          <h2 className="text-2xl lg:text-[32px] font-bold mb-2 lg:mb-2 leading-tight" style={{ color: textColor }}>
            {isConversationOpen ? 'Connected' : title}
          </h2>
          {isConversationOpen ? (
            <div className="space-y-2">
              <div className="text-green-500 text-2xl lg:text-3xl font-mono font-bold tabular-nums">
                {Math.floor(callDuration / 60).toString().padStart(2, '0')}:
                {(callDuration % 60).toString().padStart(2, '0')}
              </div>
              <p className="text-base lg:text-lg" style={{ color: secondaryTextColor }}>
                Speaking with AI Agent
              </p>
            </div>
          ) : (
            <p className="text-base lg:text-lg leading-relaxed max-w-[600px]" style={{ color: secondaryTextColor }}>
              {description}
            </p>
          )}
        </div>

        {/* Action Area - Right Side on Desktop */}
        <div className="flex flex-col items-center lg:items-end gap-4 flex-shrink-0">
          {/* Status Badge */}
          <div 
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all"
            style={{ 
              backgroundColor: isConversationOpen ? '#dcfce7' : statusBgColor,
              color: isConversationOpen ? '#15803d' : statusTextColor
            }}
          >
            <div 
              className={`w-1.5 h-1.5 rounded-full ${isConversationOpen ? 'animate-pulse' : ''}`}
              style={{ backgroundColor: isConversationOpen ? '#22c55e' : '#4ade80' }}
            ></div>
            {isConversationOpen ? 'In Call' : 'Available 24/7'}
          </div>
          
          {/* Call Button or Control Buttons */}
          {!isConversationOpen ? (
            <button
              onClick={startVoiceConversation}
              className="inline-flex items-center gap-2.5 px-9 py-4 text-base font-semibold cursor-pointer transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 text-white whitespace-nowrap"
              style={{ 
                backgroundColor: buttonColor, 
                borderRadius: '30px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.12)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.12)';
              }}
            >
              <Phone className="w-5 h-5" />
              <span>{buttonText}</span>
            </button>
          ) : (
            <div className="flex items-center gap-3">
              {/* Mute Button */}
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isMuted ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {isMuted ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
              </button>
              
              {/* End Call Button - Larger */}
              <button
                onClick={endVoiceConversation}
                className="w-14 h-14 rounded-full bg-red-500 text-white flex items-center justify-center transition-all duration-200 hover:bg-red-600 hover:scale-110 shadow-lg"
              >
                <PhoneOff className="w-6 h-6" />
              </button>
              
              {/* Speaker Button */}
              <button
                onClick={() => setIsSpeakerOn(!isSpeakerOn)}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 ${
                  isSpeakerOn ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <Volume2 className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
  );
};