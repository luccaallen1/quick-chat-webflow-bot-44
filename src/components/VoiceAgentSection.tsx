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
      <div className="flex justify-center">
        {/* Main Voice Widget - Horizontal Layout */}
        <div className="voice-agent-section max-w-[1200px] w-full bg-white rounded-[20px] p-10 lg:px-[60px] lg:py-10 shadow-[0_10px_30px_rgba(0,0,0,0.08)] flex flex-col lg:flex-row items-center gap-8 lg:gap-10 relative">
          
          {/* Avatar - Left Side on Desktop */}
          <div className="flex-shrink-0">
            <div className="w-[100px] h-[100px] lg:w-[100px] lg:h-[100px] relative">
              <div className="w-full h-full bg-primary rounded-full flex items-center justify-center relative shadow-[0_5px_20px_rgba(0,0,0,0.15)]">
                {avatarImage ? (
                  <img 
                    src={avatarImage} 
                    alt="Brand avatar" 
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <div className="text-primary-foreground text-xs font-bold text-center leading-tight whitespace-pre-line">
                    {brandText}
                  </div>
                )}
              </div>
              {/* Small phone circle overlay */}
              <div className="absolute -bottom-0 -right-0 w-8 h-8 bg-primary rounded-full flex items-center justify-center shadow-[0_3px_10px_rgba(0,0,0,0.2)] border-[3px] border-white">
                <Phone className="w-4 h-4 text-primary-foreground" />
              </div>
            </div>
          </div>

          {/* Content - Center on Desktop */}
          <div className="flex-1 text-center lg:text-left">
            <h2 className="text-foreground text-2xl lg:text-[32px] font-bold mb-2 lg:mb-2 leading-tight">
              {title}
            </h2>
            <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-[600px]">
              {description}
            </p>
          </div>

          {/* Action Area - Right Side on Desktop */}
          <div className="flex flex-col items-center lg:items-end gap-4 flex-shrink-0">
            {/* Status Badge */}
            <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              isConversationOpen 
                ? 'bg-green-100 text-green-700' 
                : 'bg-green-50 text-green-600'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${
                isConversationOpen 
                  ? 'bg-green-500 animate-pulse' 
                  : 'bg-green-400'
              }`}></div>
              {isConversationOpen ? 'In Call' : 'Available 24/7'}
            </div>
            
            {/* Call Button */}
            {!isConversationOpen ? (
              <button
                onClick={startVoiceConversation}
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-[30px] text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(0,0,0,0.12)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.12)] hover:-translate-y-0.5 active:translate-y-0 text-white whitespace-nowrap"
                style={{ backgroundColor: buttonColor }}
              >
                <Phone className="w-5 h-5" />
                <span>{buttonText}</span>
              </button>
            ) : (
              <button
                onClick={endVoiceConversation}
                className="inline-flex items-center gap-2.5 px-9 py-4 rounded-[30px] text-base font-semibold cursor-pointer transition-all duration-200 shadow-[0_4px_15px_rgba(34,197,94,0.2)] hover:shadow-[0_8px_20px_rgba(34,197,94,0.2)] hover:-translate-y-0.5 active:translate-y-0 text-white whitespace-nowrap animate-pulse"
                style={{ backgroundColor: '#22c55e' }}
              >
                <PhoneOff className="w-5 h-5" />
                <span>End Call</span>
              </button>
            )}
          </div>
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
        @media (max-width: 1024px) {
          .voice-agent-section {
            padding: 30px 40px !important;
            gap: 30px !important;
          }
        }
        
        @media (max-width: 640px) {
          .voice-agent-section {
            flex-direction: column !important;
            text-align: center !important;
            padding: 30px 20px !important;
            gap: 20px !important;
          }
          
          .voice-agent-section button {
            width: 100% !important;
            justify-content: center !important;
            padding: 14px 24px !important;
          }
        }
        
        @media (max-width: 380px) {
          .voice-agent-section {
            padding: 25px 15px !important;
          }
          
          .voice-agent-section h2 {
            font-size: 22px !important;
          }
          
          .voice-agent-section p {
            font-size: 14px !important;
          }
        }
      `}} />
    </section>
  );
};