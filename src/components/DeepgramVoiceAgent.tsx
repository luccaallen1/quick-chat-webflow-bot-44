import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mic, MicOff, Play, Square, Settings, Volume2, Phone, PhoneOff } from 'lucide-react';
import { createClient, LiveTranscriptionEvents } from '@deepgram/sdk';

interface VoiceMessage {
  type: 'user' | 'agent' | 'system';
  content: string;
  timestamp: Date;
  confidence?: number;
  audioUrl?: string;
}

interface DeepgramVoiceAgentProps {
  apiKey?: string;
  onSessionStart?: (sessionId: string) => void;
  onSessionEnd?: () => void;
}

const DeepgramVoiceAgent: React.FC<DeepgramVoiceAgentProps> = ({
  apiKey: propApiKey,
  onSessionStart,
  onSessionEnd
}) => {
  const [apiKey] = useState(propApiKey || 'ed3fc0b2215c858ded6af1a2bba90f10cfb4f5cb');
  const [isInCall, setIsInCall] = useState(false);
  const [messages, setMessages] = useState<VoiceMessage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'ready' | 'connecting' | 'in-call' | 'error'>('ready');
  const [agentConfig, setAgentConfig] = useState({
    model: 'nova-2',
    voice: 'aura-asteria-en',
    language: 'en',
    smart_format: true,
    filler_words: true,
    interim_results: true
  });
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const deepgramRef = useRef<any>(null);
  const connectionRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sessionIdRef = useRef<string | null>(null);

  const addMessage = (type: VoiceMessage['type'], content: string, confidence?: number) => {
    setMessages(prev => [...prev, {
      type,
      content,
      timestamp: new Date(),
      confidence
    }]);
  };

  const generateAIResponse = async (userText: string) => {
    // Simple AI response generation (you can replace this with OpenAI API call)
    const responses = [
      `That's interesting! Tell me more about ${userText.toLowerCase()}.`,
      `I understand you mentioned "${userText}". How can I help you with that?`,
      `Thanks for sharing that with me. What would you like to know about ${userText}?`,
      `That sounds fascinating! Can you elaborate on ${userText}?`,
      `I hear you talking about ${userText}. What specific aspect interests you most?`
    ];
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];
    addMessage('agent', randomResponse);
    
    // Convert text to speech using browser's speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(randomResponse);
      utterance.rate = 0.9;
      utterance.pitch = 1;
      utterance.volume = 0.8;
      
      // Try to use a female voice
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        voice.name.includes('Female') || 
        voice.name.includes('Samantha') || 
        voice.name.includes('Victoria') ||
        voice.gender === 'female'
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
      
      speechSynthesis.speak(utterance);
    }
  };

  const startConversation = async () => {
    try {
      setError(null);
      setConnectionStatus('connecting');
      setIsInCall(true);

      addMessage('system', '🎤 Starting voice conversation...');

      // Check microphone permissions first
      console.log('Requesting microphone access...');
      
      // Get user media first
      streamRef.current = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      console.log('Microphone access granted:', streamRef.current);
      addMessage('system', '🎙️ Microphone connected, setting up Deepgram...');

      // Create WebSocket connection for live transcription (fallback approach)
      deepgramRef.current = createClient(apiKey);
      connectionRef.current = deepgramRef.current.listen.live({
        model: agentConfig.model,
        language: 'en-US',
        smart_format: true,
        interim_results: true,
        punctuate: true,
        diarize: false,
        utterance_end_ms: 1000
      });

      connectionRef.current.on(LiveTranscriptionEvents.Open, () => {
        console.log('Deepgram connection opened');
        setConnectionStatus('in-call');
        addMessage('system', '🎙️ Voice conversation started! Speak naturally.');
        onSessionStart?.('live-session');
        
        // Start streaming audio
        if (streamRef.current) {
          console.log('Creating MediaRecorder...');
          
          // Check supported MIME types
          const supportedTypes = ['audio/webm;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/wav'];
          let selectedType = supportedTypes.find(type => MediaRecorder.isTypeSupported(type));
          console.log('Using MIME type:', selectedType || 'default');
          
          const mediaRecorder = new MediaRecorder(streamRef.current, 
            selectedType ? { mimeType: selectedType } : {}
          );
          
          mediaRecorder.onstart = () => {
            console.log('MediaRecorder started');
            addMessage('system', '🔴 Recording audio - you can speak now!');
          };
          
          mediaRecorder.ondataavailable = (event) => {
            console.log('Audio data available, size:', event.data.size);
            if (event.data.size > 0 && connectionRef.current) {
              console.log('Sending audio data to Deepgram');
              connectionRef.current.send(event.data);
            }
          };
          
          mediaRecorder.onerror = (event) => {
            console.error('MediaRecorder error:', event);
            setError('Recording error occurred');
          };
          
          console.log('Starting MediaRecorder with 100ms intervals...');
          mediaRecorder.start(100);
          mediaRecorderRef.current = mediaRecorder;
        } else {
          console.error('No audio stream available for MediaRecorder');
        }
      });

      connectionRef.current.on(LiveTranscriptionEvents.Transcript, (data: any) => {
        console.log('Deepgram transcript received:', data);
        const transcript = data.channel?.alternatives?.[0];
        if (transcript?.transcript && data.is_final) {
          const userText = transcript.transcript.trim();
          if (userText) {
            console.log('Final transcript:', userText);
            addMessage('user', userText, transcript.confidence);
            
            // Generate AI response
            setTimeout(() => {
              generateAIResponse(userText);
            }, 500);
          }
        }
      });

      connectionRef.current.on(LiveTranscriptionEvents.Error, (error: any) => {
        console.error('Deepgram error:', error);
        setError(`Connection error: ${error.message || 'Unknown error'}`);
        setConnectionStatus('error');
      });

      connectionRef.current.on(LiveTranscriptionEvents.Close, () => {
        console.log('Deepgram connection closed');
        endConversation();
      });

    } catch (err: any) {
      console.error('Failed to start conversation:', err);
      setError(`Failed to start conversation: ${err.message}`);
      setConnectionStatus('ready');
      setIsInCall(false);
    }
  };

  const endConversation = () => {
    // Stop media recorder
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current = null;
    }
    
    // Stop audio stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    // Close Deepgram connection
    if (connectionRef.current) {
      connectionRef.current.finish();
      connectionRef.current = null;
    }

    // Stop any ongoing speech synthesis
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
    }

    setIsInCall(false);
    setConnectionStatus('ready');
    addMessage('system', '📞 Conversation ended');
    onSessionEnd?.();
  };

  const disconnect = () => {
    endConversation();
    setConnectionStatus('ready');
    addMessage('system', '👋 Voice agent ready for new conversation');
  };

  // Initialize audio element
  useEffect(() => {
    audioRef.current = new Audio();
    audioRef.current.autoplay = true;
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'ready': return 'bg-green-500';
      case 'in-call': return 'bg-blue-500';
      case 'connecting': return 'bg-yellow-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (connectionStatus) {
      case 'ready': return 'Ready';
      case 'in-call': return 'In Conversation';
      case 'connecting': return 'Connecting...';
      case 'error': return 'Error';
      default: return 'Ready';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Connection Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎤 AI Voice Conversation
            <Badge variant="default" className="ml-auto">
              <div className={`w-2 h-2 rounded-full ${getStatusColor()} mr-2`}></div>
              {getStatusText()}
            </Badge>
          </CardTitle>
          <CardDescription>
            Have natural voice conversations with AI - powered by Deepgram and speech synthesis
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Configuration */}
          {!isInCall && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="voice">AI Voice Style</Label>
                <select
                  id="voice"
                  value={agentConfig.voice}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, voice: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  disabled={isInCall}
                >
                  <option value="aura-asteria-en">Natural Female Voice</option>
                  <option value="aura-luna-en">Friendly Female Voice</option>
                  <option value="aura-orion-en">Professional Male Voice</option>
                  <option value="aura-arcas-en">Casual Male Voice</option>
                </select>
              </div>
              <div>
                <Label htmlFor="model">Transcription Model</Label>
                <select
                  id="model"
                  value={agentConfig.model}
                  onChange={(e) => setAgentConfig(prev => ({ ...prev, model: e.target.value }))}
                  className="w-full p-2 border rounded-md"
                  disabled={isInCall}
                >
                  <option value="nova-2">Nova-2 (Most Accurate)</option>
                  <option value="nova">Nova (Balanced)</option>
                  <option value="enhanced">Enhanced (Fast)</option>
                </select>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Control Buttons */}
          <div className="flex items-center justify-center gap-3">
            {!isInCall ? (
              <Button 
                onClick={startConversation}
                disabled={connectionStatus === 'connecting'}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-lg px-8 py-3"
                size="lg"
              >
                <Phone className="w-5 h-5" />
                {connectionStatus === 'connecting' ? 'Starting...' : 'Start Conversation'}
              </Button>
            ) : (
              <Button 
                onClick={endConversation}
                variant="destructive"
                className="flex items-center gap-2 text-lg px-8 py-3"
                size="lg"
              >
                <PhoneOff className="w-5 h-5" />
                End Conversation
              </Button>
            )}
          </div>

          {/* Status Info */}
          {isInCall && (
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-700 font-medium">🎙️ Conversation Active</p>
              <p className="text-blue-600 text-sm">Speak naturally - the AI will respond with voice and text</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Conversation Log */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            💬 Conversation Log
            <Badge variant="outline" className="ml-auto">
              {messages.length} messages
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 overflow-y-auto space-y-3 bg-gray-50 rounded-lg p-4">
            {messages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                <div className="text-center">
                  <Volume2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p>No messages yet. Connect and start speaking!</p>
                </div>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.type === 'user'
                        ? 'bg-blue-600 text-white'
                        : message.type === 'agent'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-600 text-white'
                    }`}
                  >
                    <div className="text-sm">
                      {message.type === 'user' && '🗣️ '}
                      {message.type === 'agent' && '🤖 '}
                      {message.type === 'system' && 'ℹ️ '}
                      {message.content}
                    </div>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                      {message.confidence && (
                        <span className="ml-2">
                          ({Math.round(message.confidence * 100)}% confidence)
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>📋 How to Use</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600">
            <li>Choose your preferred voice style and transcription model</li>
            <li>Click "Start Conversation" to begin</li>
            <li>Allow microphone access when prompted</li>
            <li>Speak naturally - the AI will hear you and respond with voice</li>
            <li>Have a natural conversation about any topic</li>
            <li>Click "End Conversation" when you're finished</li>
          </ol>
          
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-700">
              <strong>✨ Features:</strong> Real-time speech recognition, AI conversations, 
              voice responses, and conversation history - all working together seamlessly!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeepgramVoiceAgent;