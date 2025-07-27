import React, { useState } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Phone, PhoneOff, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface VoiceAgentSectionProps {
  isDarkMode?: boolean;
}

export const VoiceAgentSection: React.FC<VoiceAgentSectionProps> = ({ isDarkMode = false }) => {
  const [agentId, setAgentId] = useState('agent_01k04zwwq3fv5acgzdwmbvfk8k');
  const [buttonText, setButtonText] = useState('Ask any questions by talking with our voice agent');
  const [buttonColor, setButtonColor] = useState('#3b82f6');
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const conversation = useConversation({
    onConnect: () => {
      console.log('Connected to voice agent');
    },
    onDisconnect: () => {
      console.log('Disconnected from voice agent');
      setConversationId(null);
      setIsConversationOpen(false);
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
      // Request microphone permission
      await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Start the conversation
      const id = await conversation.startSession({ agentId });
      setConversationId(id);
      setIsConversationOpen(true);
    } catch (error) {
      console.error('Failed to start conversation:', error);
      alert('Failed to start voice conversation. Please check your microphone permissions and agent ID.');
    }
  };

  const endVoiceConversation = async () => {
    try {
      await conversation.endSession();
      setConversationId(null);
      setIsConversationOpen(false);
    } catch (error) {
      console.error('Failed to end conversation:', error);
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Main Voice Interface */}
        <div className="relative">
          <Card className="backdrop-blur-lg bg-white/10 border border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* Status Indicator */}
              <div className="mb-8">
                <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center mb-3 transition-all duration-300 ${
                  conversation.status === 'connected' 
                    ? 'bg-gradient-to-r from-green-400 to-green-600 shadow-lg shadow-green-500/25' 
                    : 'bg-gradient-to-r from-slate-400 to-slate-600'
                }`}>
                  <Mic className="w-8 h-8 text-white" />
                </div>
                <div className={`text-sm font-medium ${
                  conversation.status === 'connected' ? 'text-green-400' : 'text-slate-400'
                }`}>
                  {conversation.status === 'connected' ? 'Connected' : 'Ready'}
                </div>
              </div>

              {/* Main Action */}
              {!isConversationOpen ? (
                <Button
                  onClick={startVoiceConversation}
                  className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg"
                  style={{ 
                    backgroundColor: buttonColor,
                    boxShadow: `0 8px 32px ${buttonColor}25`
                  }}
                >
                  <Phone className="w-5 h-5 mr-3" />
                  {buttonText}
                </Button>
              ) : (
                <div className="space-y-6">
                  <div className="text-xl font-semibold text-green-400">
                    Voice conversation active
                  </div>
                  <div className="text-slate-300">
                    {conversation.isSpeaking ? 'Agent is speaking...' : 'Listening...'}
                  </div>
                  <Button
                    onClick={endVoiceConversation}
                    variant="destructive"
                    className="w-full py-4 text-lg font-semibold rounded-xl transition-all duration-300 hover:scale-105"
                  >
                    <PhoneOff className="w-5 h-5 mr-3" />
                    End Conversation
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Customize Button */}
          <div className="flex justify-center mt-6">
            <Dialog>
              <DialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="text-slate-400 hover:text-white hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-6"
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Customize
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md bg-slate-900 border-slate-700">
                <DialogHeader>
                  <DialogTitle className="text-white">Voice Agent Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentId" className="text-slate-300">Agent ID</Label>
                    <Input
                      id="agentId"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      placeholder="Enter ElevenLabs Agent ID"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonText" className="text-slate-300">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Enter button text"
                      className="bg-slate-800 border-slate-600 text-white"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonColor" className="text-slate-300">Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonColor"
                        type="color"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-16 h-10 p-1 border border-slate-600 rounded bg-slate-800"
                      />
                      <Input
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1 bg-slate-800 border-slate-600 text-white"
                      />
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Voice Conversation Interface */}
        {isConversationOpen && (
          <Card className={`mt-8 ${
            isDarkMode 
              ? 'bg-gray-800/60 border-gray-700 text-white' 
              : 'bg-white/80 border-gray-200'
          } backdrop-blur-sm`}>
            <CardHeader>
              <CardTitle className="text-center">Live Voice Conversation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center space-y-4">
                <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                  conversation.isSpeaking ? 'bg-blue-500 animate-pulse' : 'bg-green-500'
                }`}>
                  {conversation.isSpeaking ? (
                    <MicOff className="w-8 h-8 text-white" />
                  ) : (
                    <Mic className="w-8 h-8 text-white" />
                  )}
                </div>
                
                <div className={`text-lg font-medium ${
                  isDarkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  {conversation.isSpeaking ? 'AI is speaking...' : 'Listening for your voice...'}
                </div>
                
                <div className={`text-sm ${
                  isDarkMode ? 'text-gray-400' : 'text-gray-500'
                }`}>
                  Conversation ID: {conversationId}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </section>
  );
};