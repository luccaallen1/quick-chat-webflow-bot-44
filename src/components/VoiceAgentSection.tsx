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
    <section className={`py-16 px-4 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-800/50 to-blue-900/50' 
        : 'bg-gradient-to-br from-blue-50/50 to-indigo-50/50'
    }`}>
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className={`text-3xl font-bold mb-4 ${
            isDarkMode ? 'text-white' : 'text-gray-900'
          }`}>
            Voice AI Assistant
          </h2>
          <p className={`text-lg ${
            isDarkMode ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Talk directly with our AI voice agent for instant assistance
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Main Voice Agent Button */}
          <div className="flex-1">
            <Card className={`${
              isDarkMode 
                ? 'bg-gray-800/60 border-gray-700 text-white' 
                : 'bg-white/80 border-gray-200'
            } backdrop-blur-sm`}>
              <CardContent className="p-8 text-center">
                <div className="mb-6">
                  <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-4 ${
                    conversation.status === 'connected' ? 'bg-green-500' : 'bg-gray-400'
                  }`}>
                    <Mic className="w-10 h-10 text-white" />
                  </div>
                  <div className={`text-sm font-medium ${
                    conversation.status === 'connected' ? 'text-green-600' : 'text-gray-500'
                  }`}>
                    {conversation.status === 'connected' ? 'Connected' : 'Ready to connect'}
                  </div>
                </div>

                {!isConversationOpen ? (
                  <Button
                    onClick={startVoiceConversation}
                    className="w-full py-4 text-lg font-semibold"
                    style={{ backgroundColor: buttonColor }}
                  >
                    <Phone className="w-5 h-5 mr-2" />
                    {buttonText}
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className={`text-lg font-medium ${
                      isDarkMode ? 'text-green-400' : 'text-green-600'
                    }`}>
                      Voice conversation active
                    </div>
                    <div className={`text-sm ${
                      isDarkMode ? 'text-gray-400' : 'text-gray-600'
                    }`}>
                      {conversation.isSpeaking ? 'Agent is speaking...' : 'Listening...'}
                    </div>
                    <Button
                      onClick={endVoiceConversation}
                      variant="destructive"
                      className="w-full py-4 text-lg font-semibold"
                    >
                      <PhoneOff className="w-5 h-5 mr-2" />
                      End Conversation
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Customization Panel */}
          <div className="lg:w-80">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Settings className="w-4 h-4 mr-2" />
                  Customize Voice Agent
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Voice Agent Settings</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="agentId">Agent ID</Label>
                    <Input
                      id="agentId"
                      value={agentId}
                      onChange={(e) => setAgentId(e.target.value)}
                      placeholder="Enter ElevenLabs Agent ID"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonText">Button Text</Label>
                    <Input
                      id="buttonText"
                      value={buttonText}
                      onChange={(e) => setButtonText(e.target.value)}
                      placeholder="Enter button text"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="buttonColor">Button Color</Label>
                    <div className="flex gap-2">
                      <Input
                        id="buttonColor"
                        type="color"
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        className="w-16 h-10 p-1 border rounded"
                      />
                      <Input
                        value={buttonColor}
                        onChange={(e) => setButtonColor(e.target.value)}
                        placeholder="#3b82f6"
                        className="flex-1"
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