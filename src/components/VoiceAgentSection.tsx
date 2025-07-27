import React, { useState, useRef } from 'react';
import { useConversation } from '@11labs/react';
import { Mic, MicOff, Phone, PhoneOff, Settings, Upload, X } from 'lucide-react';
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
  const [buttonText, setButtonText] = useState('Talk to AI Agent');
  const [buttonColor, setButtonColor] = useState('#000000');
  const [title, setTitle] = useState('AI Voice Assistant');
  const [description, setDescription] = useState('Get instant answers to your questions. Our AI assistant is ready to help you 24/7.');
  const [brandText, setBrandText] = useState('YOUR\nBRAND\nHERE');
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setAvatarImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="py-12 px-4">
      <div className="flex justify-center items-center min-h-[500px]">
        {/* Main Voice Widget */}
        <div className="voice-agent-widget bg-white rounded-[20px] p-10 shadow-[0_10px_30px_rgba(0,0,0,0.1)] text-center relative max-w-[320px] w-full border border-gray-200">
          {/* Status indicator */}
          <div className="absolute top-5 right-5 text-green-400 text-xs font-medium flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
            Available 24/7
          </div>
          
          {/* Avatar with company branding */}
          <div className="w-[140px] h-[140px] -mt-[90px] mx-auto mb-8 relative">
            <div className="w-full h-full bg-black rounded-full flex items-center justify-center relative shadow-[0_5px_20px_rgba(0,0,0,0.2)]">
              {avatarImage ? (
                <img 
                  src={avatarImage} 
                  alt="Brand avatar" 
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="text-white text-sm font-semibold text-center leading-tight whitespace-pre-line">
                  {brandText}
                </div>
              )}
            </div>
            {/* Small phone circle */}
            <div className="absolute -bottom-2.5 right-2.5 w-[50px] h-[50px] bg-black rounded-full flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.2)] border-3 border-white">
              <Phone className="w-6 h-6 text-white" />
            </div>
          </div>
          
          {/* Title and description */}
          <h2 className="text-[#1a1a1a] text-[26px] font-bold mb-3">
            {title}
          </h2>
          <p className="text-gray-600 text-[15px] mb-8 leading-relaxed">
            {description}
          </p>
          
          {/* Call button */}
          {!isConversationOpen ? (
            <button
              onClick={startVoiceConversation}
              className="inline-flex items-center gap-2.5 px-9 py-4 rounded-[50px] text-[17px] font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.25)] hover:-translate-y-0.5 active:translate-y-0 text-white"
              style={{ backgroundColor: buttonColor }}
            >
              <Phone className="w-5 h-5" />
              <span>{buttonText}</span>
            </button>
          ) : (
            <div className="space-y-4">
              <div className="text-xl font-semibold text-green-400">
                Voice conversation active
              </div>
              <div className="text-gray-600">
                {conversation.isSpeaking ? 'Agent is speaking...' : 'Listening...'}
              </div>
              <button
                onClick={endVoiceConversation}
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-[50px] text-[17px] font-semibold cursor-pointer transition-all duration-200 bg-red-500 text-white hover:bg-red-600 shadow-[0_4px_15px_rgba(239,68,68,0.2)]"
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Conversation</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Customize Button - Below the widget */}
      <div className="flex justify-center mt-8">
        <Dialog>
          <DialogTrigger asChild>
            <Button 
              variant="ghost" 
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 border border-gray-200 rounded-lg px-6"
            >
              <Settings className="w-4 h-4 mr-2" />
              Customize
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg bg-white border-gray-200">
            <DialogHeader>
              <DialogTitle className="text-gray-900">Voice Agent Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <Label htmlFor="agentId" className="text-gray-700">Agent ID</Label>
                <Input
                  id="agentId"
                  value={agentId}
                  onChange={(e) => setAgentId(e.target.value)}
                  placeholder="Enter ElevenLabs Agent ID"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-gray-700">Title</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Widget title"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="buttonText" className="text-gray-700">Button Text</Label>
                  <Input
                    id="buttonText"
                    value={buttonText}
                    onChange={(e) => setButtonText(e.target.value)}
                    placeholder="Button text"
                    className="bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-700">Description</Label>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Widget description"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="brandText" className="text-gray-700">Brand Text (use \n for line breaks)</Label>
                <Input
                  id="brandText"
                  value={brandText}
                  onChange={(e) => setBrandText(e.target.value)}
                  placeholder="YOUR\nBRAND\nHERE"
                  className="bg-white border-gray-300 text-gray-900"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-gray-700">Avatar Image</Label>
                <div className="flex gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Image
                  </Button>
                  {avatarImage && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeImage}
                      className="px-3"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
                {avatarImage && (
                  <div className="mt-2">
                    <img 
                      src={avatarImage} 
                      alt="Avatar preview" 
                      className="w-16 h-16 rounded-full object-cover mx-auto"
                    />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="buttonColor" className="text-gray-700">Button Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="buttonColor"
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-16 h-10 p-1 border border-gray-300 rounded bg-white"
                  />
                  <Input
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-white border-gray-300 text-gray-900"
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Voice Conversation Interface */}
      {isConversationOpen && (
        <div className="flex justify-center mt-8">
          <Card className="bg-white border-gray-200 max-w-md w-full">
            <CardHeader>
              <CardTitle className="text-center text-gray-900">Live Voice Conversation</CardTitle>
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
                
                <div className="text-lg font-medium text-gray-700">
                  {conversation.isSpeaking ? 'AI is speaking...' : 'Listening for your voice...'}
                </div>
                
                <div className="text-sm text-gray-500">
                  Conversation ID: {conversationId}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Global styles for responsive design */}
      <style dangerouslySetInnerHTML={{__html: `
        @media (max-width: 380px) {
          .voice-agent-widget {
            padding: 30px 20px !important;
          }
          
          .voice-agent-widget .avatar-container {
            width: 120px !important;
            height: 120px !important;
            margin-top: -80px !important;
          }
          
          .voice-agent-widget .phone-circle {
            width: 45px !important;
            height: 45px !important;
          }
          
          .voice-agent-widget h2 {
            font-size: 22px !important;
          }
          
          .voice-agent-widget button {
            padding: 14px 28px !important;
            font-size: 16px !important;
          }
        }
      `}} />
    </section>
  );
};