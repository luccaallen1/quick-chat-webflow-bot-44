import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '../integrations/supabase/client';

interface UseVoiceChatProps {
  onTranscription: (text: string) => void;
  isVoiceEnabled: boolean;
  autoPlayResponses: boolean;
}

export const useVoiceChat = ({ onTranscription, isVoiceEnabled, autoPlayResponses }: UseVoiceChatProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voicePermissionDenied, setVoicePermissionDenied] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<'bark' | 'tortoise'>('bark');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  // Early return null values if voice is not enabled
  if (!isVoiceEnabled) {
    return {
      isRecording: false,
      isProcessing: false,
      recordingTimer: 0,
      isSpeaking: false,
      voicePermissionDenied: false,
      selectedVoice: 'bark' as const,
      startRecording: () => {},
      stopRecording: () => {},
      speakText: () => {},
      stopSpeaking: () => {},
      setSelectedVoice: () => {}
    };
  }

  // Initialize speech recognition if available
  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
          
        if (event.results[event.results.length - 1].isFinal) {
          onTranscription(transcript);
          stopRecording();
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        if (event.error === 'not-allowed') {
          setVoicePermissionDenied(true);
        }
        stopRecording();
      };
      
      recognitionRef.current.onend = () => {
        setIsProcessing(false);
      };
    }
  }, [onTranscription]);

  const startTimer = useCallback(() => {
    setRecordingTimer(0);
    timerRef.current = setInterval(() => {
      setRecordingTimer(prev => {
        if (prev >= 14) {
          stopRecording();
          return 0;
        }
        return prev + 1;
      });
    }, 1000);
  }, []);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTimer(0);
  }, []);

  const startRecording = useCallback(async () => {
    if (!isVoiceEnabled || voicePermissionDenied) return;
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      streamRef.current = stream;
      setVoicePermissionDenied(false);
      setIsRecording(true);
      audioChunksRef.current = [];
      
      startTimer();
      
      if (recognitionRef.current) {
        setIsProcessing(true);
        recognitionRef.current.start();
      } else {
        mediaRecorderRef.current = new MediaRecorder(stream, {
          mimeType: 'audio/webm;codecs=opus',
        });
        
        mediaRecorderRef.current.ondataavailable = (event) => {
          if (event.data.size > 0) {
            audioChunksRef.current.push(event.data);
          }
        };
        
        mediaRecorderRef.current.onstop = async () => {
          setIsProcessing(true);
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          await transcribeAudio(audioBlob);
        };
        
        mediaRecorderRef.current.start();
      }
      
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setVoicePermissionDenied(true);
      setIsRecording(false);
    }
  }, [isVoiceEnabled, voicePermissionDenied, startTimer]);

  const stopRecording = useCallback(() => {
    if (!isVoiceEnabled) return;
    
    setIsRecording(false);
    clearTimer();
    
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (error) {
        console.log('Speech recognition already stopped');
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  }, [clearTimer]);

  const transcribeAudio = async (audioBlob: Blob) => {
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const base64Audio = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      
      console.log('Would transcribe audio with Whisper API');
      setIsProcessing(false);
    } catch (error) {
      console.error('Error transcribing audio:', error);
      setIsProcessing(false);
    }
  };

  // Enhanced speakText function using Together AI TTS
  const speakText = useCallback(async (text: string) => {
    if (!isVoiceEnabled || !autoPlayResponses || !text.trim()) {
      return;
    }

    // Stop any currently playing audio
    stopSpeaking();
    
    setIsSpeaking(true);

    try {
      console.log('Generating TTS with Together AI...');
      
      // Call our Supabase Edge Function for Together AI TTS
      const { data, error } = await supabase.functions.invoke('together-tts', {
        body: { 
          text: text.trim(),
          voice: selectedVoice 
        }
      });

      if (error) {
        console.error('TTS error:', error);
        // Fallback to browser TTS
        fallbackTobrowerTTS(text);
        return;
      }

      if (data?.audioContent) {
        // Convert base64 to audio and play
        const audioBuffer = Uint8Array.from(atob(data.audioContent), c => c.charCodeAt(0));
        const audioBlob = new Blob([audioBuffer], { type: 'audio/wav' });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        const audio = new Audio(audioUrl);
        currentAudioRef.current = audio;
        
        audio.onloadeddata = () => {
          console.log('Audio loaded, playing...');
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
            setIsSpeaking(false);
          });
        };
        
        audio.onended = () => {
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
        };
        
        audio.onerror = () => {
          console.error('Audio playback error');
          setIsSpeaking(false);
          URL.revokeObjectURL(audioUrl);
          currentAudioRef.current = null;
          // Fallback to browser TTS
          fallbackTobrowerTTS(text);
        };
      } else {
        throw new Error('No audio content received');
      }

    } catch (error) {
      console.error('Error with Together AI TTS:', error);
      // Fallback to browser TTS
      fallbackTobrowerTTS(text);
    }
  }, [isVoiceEnabled, autoPlayResponses, selectedVoice]);

  // Fallback to browser TTS if Together AI fails
  const fallbackTobrowerTTS = useCallback((text: string) => {
    if (!isVoiceEnabled || typeof window === 'undefined' || !window.speechSynthesis) {
      setIsSpeaking(false);
      return;
    }

    console.log('Using browser TTS fallback');
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 0.8;
    
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.name.includes('Natural') || 
      voice.name.includes('Enhanced') || 
      voice.name.includes('Premium')
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    
    window.speechSynthesis.speak(utterance);
  }, [isVoiceEnabled]);

  const stopSpeaking = useCallback(() => {
    // Stop Together AI audio
    if (currentAudioRef.current) {
      currentAudioRef.current.pause();
      currentAudioRef.current = null;
    }
    
    // Stop browser TTS
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    setIsSpeaking(false);
  }, [isVoiceEnabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimer();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      stopSpeaking();
    };
  }, [clearTimer, stopSpeaking]);

  return {
    isRecording,
    isProcessing,
    recordingTimer,
    isSpeaking,
    voicePermissionDenied,
    selectedVoice,
    startRecording,
    stopRecording,
    speakText,
    stopSpeaking,
    setSelectedVoice
  };
};
