import React, { useState, useEffect, useRef } from 'react';
import { Phone, PhoneOff, MicOff, Mic } from 'lucide-react';
import { useConversation } from '@11labs/react';

interface CallInterfaceProps {
  primaryColor: string;
  secondaryColor: string;
  textColor: string;
  chatBackground: string;
  logoUrl?: string;
  agentId: string;
  onBackToChat: () => void;
}

export const CallInterface: React.FC<CallInterfaceProps> = ({
  primaryColor,
  secondaryColor,
  textColor,
  chatBackground,
  logoUrl,
  agentId,
  onBackToChat
}) => {
  const [isCallActive, setIsCallActive] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const streamRef = useRef<MediaStream | null>(null);
  
  const conversation = useConversation({
    onConnect: () => {
      console.log('[VOICE] ✅ ElevenLabs connected successfully at', new Date().toISOString());
      setIsCallActive(true);
      setConnectionStatus('connected');
      setErrorMessage('');
    },
    onDisconnect: (event?: any) => {
      console.log('[VOICE] 🔌 ElevenLabs disconnected at', new Date().toISOString());
      console.log('[VOICE] Disconnect event:', event);
      console.log('[VOICE] Was call active?', isCallActive);
      setIsCallActive(false);
      setConnectionStatus('idle');
      // Clean up media stream
      if (streamRef.current) {
        console.log('[VOICE] Cleaning up media stream...');
        streamRef.current.getTracks().forEach(track => {
          console.log('[VOICE] Stopping track:', track.kind, track.readyState);
          track.stop();
        });
        streamRef.current = null;
      }
    },
    onMessage: (message) => {
      console.log('[VOICE] 💬 Message received:', {
        type: message?.type,
        timestamp: new Date().toISOString(),
        content: message?.message || message
      });
      // Reset error state on successful message
      if (connectionStatus === 'error') {
        setConnectionStatus('connected');
        setErrorMessage('');
      }
    },
    onError: (error) => {
      console.error('[VOICE] ❌ Error occurred at', new Date().toISOString());
      console.error('[VOICE] Error details:', {
        message: error?.message,
        code: error?.code,
        type: error?.type,
        stack: error?.stack,
        fullError: error
      });
      setConnectionStatus('error');
      setErrorMessage(error?.message || 'Connection error occurred');
      
      // Log current state
      console.log('[VOICE] Current state:', {
        isCallActive,
        connectionStatus,
        hasStream: !!streamRef.current,
        streamTracks: streamRef.current?.getTracks().map(t => ({
          kind: t.kind,
          enabled: t.enabled,
          readyState: t.readyState
        }))
      });
      
      // Attempt reconnection after 3 seconds
      if (isCallActive) {
        console.log('[VOICE] Will attempt reconnection in 3 seconds...');
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[VOICE] 🔄 Attempting to reconnect...');
          startCall();
        }, 3000);
      }
    }
  });

  const startCall = async () => {
    try {
      console.log('[VOICE] 📞 Starting call...');
      setConnectionStatus('connecting');
      setErrorMessage('');
      
      // Request microphone permission and get stream
      console.log('[VOICE] Requesting microphone permission...');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        }
      });
      streamRef.current = stream;
      console.log('[VOICE] ✅ Microphone access granted');
      
      // Monitor audio stream health
      const audioTrack = stream.getAudioTracks()[0];
      if (audioTrack) {
        console.log('[VOICE] Audio track settings:', audioTrack.getSettings());
        console.log('[VOICE] Audio track constraints:', audioTrack.getConstraints());
        console.log('[VOICE] Audio track state:', audioTrack.readyState);
        
        audioTrack.onended = () => {
          console.warn('[VOICE] ⚠️ Microphone track ended!');
          setErrorMessage('Microphone disconnected. Please reconnect.');
          endCall();
        };
        
        audioTrack.onmute = () => {
          console.warn('[VOICE] 🔇 Microphone muted by system');
        };
        
        audioTrack.onunmute = () => {
          console.log('[VOICE] 🔊 Microphone unmuted by system');
        };
        
        // Monitor audio levels
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        const microphone = audioContext.createMediaStreamSource(stream);
        microphone.connect(analyser);
        
        analyser.fftSize = 256;
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        
        let silenceCount = 0;
        const checkAudio = setInterval(() => {
          analyser.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / bufferLength;
          
          if (average < 1) {
            silenceCount++;
            if (silenceCount > 100) { // ~10 seconds of silence
              console.warn('[VOICE] ⚠️ No audio detected for 10 seconds');
              silenceCount = 0;
            }
          } else {
            silenceCount = 0;
          }
        }, 100);
        
        // Store interval for cleanup
        (window as any).audioCheckInterval = checkAudio;
      }
      
      console.log('[VOICE] Starting ElevenLabs session with agent:', agentId);
      await conversation.startSession({ 
        agentId: agentId 
      });
      console.log('[VOICE] ✅ Session started successfully');
    } catch (error: any) {
      console.error('[VOICE] ❌ Failed to start call:', error);
      console.error('[VOICE] Error name:', error?.name);
      console.error('[VOICE] Error message:', error?.message);
      setConnectionStatus('error');
      setErrorMessage(error?.message || 'Failed to start call. Please check your microphone.');
    }
  };

  const endCall = async () => {
    try {
      console.log('[VOICE] 📴 Ending call...');
      
      // Clear any reconnection attempts
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      
      // Clear audio monitoring
      if ((window as any).audioCheckInterval) {
        clearInterval((window as any).audioCheckInterval);
        (window as any).audioCheckInterval = null;
      }
      
      await conversation.endSession();
      setIsCallActive(false);
      setConnectionStatus('idle');
      
      // Clean up media stream
      if (streamRef.current) {
        console.log('[VOICE] Cleaning up media stream...');
        streamRef.current.getTracks().forEach(track => {
          console.log('[VOICE] Stopping track:', track.kind, track.readyState);
          track.stop();
        });
        streamRef.current = null;
      }
      
      console.log('[VOICE] ✅ Call ended successfully');
    } catch (error) {
      console.error('[VOICE] ❌ Error ending call:', error);
    }
  };
  
  const toggleMute = () => {
    if (streamRef.current) {
      const audioTrack = streamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = isMicMuted;
        setIsMicMuted(!isMicMuted);
      }
    }
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Debug logging
  console.log('CallInterface logoUrl:', logoUrl);
  console.log('CallInterface agentId:', agentId);

  return (
    <div 
      style={{ 
        backgroundColor: chatBackground,
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        textAlign: 'center'
      }}
    >
      <div style={{ marginBottom: '2rem' }}>
        <div 
          style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            backgroundColor: logoUrl ? 'transparent' : primaryColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            position: 'relative',
            boxShadow: logoUrl ? 'none' : (isCallActive ? '0 0 30px rgba(59, 130, 246, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.15)'),
            animation: isCallActive ? 'voicePulse 1.5s ease-in-out infinite' : 'none',
            transition: 'all 0.3s ease',
            border: logoUrl ? '2px solid rgba(255,255,255,0.1)' : 'none'
          }}
        >
          {logoUrl ? (
            <img 
              src={logoUrl} 
              alt="Avatar" 
              key={logoUrl} // Force re-render when URL changes
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                objectFit: 'cover', // Changed from 'contain' to 'cover' for better avatar display
                imageRendering: 'auto',
                filter: 'contrast(1.05) saturate(1.1)'
              }}
              onLoad={() => console.log('Avatar image loaded successfully')}
              onError={(e) => {
                console.error('Avatar image failed to load:', logoUrl);
                // Fallback to phone icon if avatar fails to load
                e.currentTarget.style.display = 'none';
                const phoneIcon = e.currentTarget.nextElementSibling as HTMLElement;
                if (phoneIcon) phoneIcon.style.display = 'block';
              }}
            />
          ) : null}
          
          <Phone 
            style={{ 
              width: '40px', 
              height: '40px', 
              color: 'white',
              display: logoUrl ? 'none' : 'block'
            }} 
          />
        </div>
        
        <h3 style={{ 
          color: textColor, 
          margin: '0 0 0.5rem 0',
          fontSize: '24px',
          fontWeight: '600'
        }}>
          {connectionStatus === 'connecting' ? 'Connecting...' : 
           connectionStatus === 'connected' ? 'Voice Agent Active' : 
           connectionStatus === 'error' ? 'Connection Issue' : 'Voice Assistant'}
        </h3>
        
        <p style={{ 
          color: errorMessage ? '#ef4444' : textColor, 
          opacity: errorMessage ? 1 : 0.7,
          margin: '0 0 2rem 0',
          fontSize: '16px'
        }}>
          {errorMessage || (
            connectionStatus === 'connecting' ? 'Setting up audio connection...' :
            connectionStatus === 'connected' ? 'Speak naturally to interact with the AI assistant' :
            'Connect to our AI voice assistant for hands-free support'
          )}
        </p>
      </div>
      
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        {!isCallActive ? (
          <button
            onClick={startCall}
            disabled={connectionStatus === 'connecting'}
            style={{
              backgroundColor: connectionStatus === 'connecting' ? '#9ca3af' : primaryColor,
              color: 'white',
              border: 'none',
              borderRadius: '50%',
              width: '56px',
              height: '56px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: connectionStatus === 'connecting' ? 'wait' : 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <Phone style={{ width: '20px', height: '20px' }} />
          </button>
        ) : (
          <>
            <button
              onClick={endCall}
              style={{
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <PhoneOff style={{ width: '20px', height: '20px' }} />
            </button>
            
            <button
              onClick={toggleMute}
              style={{
                backgroundColor: isMicMuted ? '#ef4444' : '#6b7280',
                color: 'white',
                border: 'none',
                borderRadius: '50%',
                width: '56px',
                height: '56px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              title={isMicMuted ? 'Unmute' : 'Mute'}
            >
              {isMicMuted ? <MicOff style={{ width: '20px', height: '20px' }} /> : <Mic style={{ width: '20px', height: '20px' }} />}
            </button>
          </>
        )}
        
        <button
          onClick={onBackToChat}
          style={{
            backgroundColor: secondaryColor,
            color: textColor,
            border: `1px solid ${secondaryColor === '#f1f5f9' ? '#e2e8f0' : 'rgba(0,0,0,0.1)'}`,
            borderRadius: '28px',
            padding: '0 1rem',
            height: '56px',
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500'
          }}
        >
          Back to Chat
        </button>
      </div>
    </div>
  );
};