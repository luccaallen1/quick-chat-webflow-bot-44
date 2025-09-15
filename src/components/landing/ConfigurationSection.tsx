import React, { useState } from 'react';

interface WelcomeButton {
  id: string;
  text: string;
  message: string;
  icon?: string;
}
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Palette, Settings, Plus, Trash2, Move } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
interface ConfigurationSectionProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  title: string;
  setTitle: (title: string) => void;
  bio: string;
  setBio: (bio: string) => void;
  placeholder: string;
  setPlaceholder: (placeholder: string) => void;
  position: 'bottom-right' | 'bottom-left';
  setPosition: (position: 'bottom-right' | 'bottom-left') => void;
  primaryColor: string;
  setPrimaryColor: (color: string) => void;
  secondaryColor: string;
  setSecondaryColor: (color: string) => void;
  textColor: string;
  setTextColor: (color: string) => void;
  userTextColor: string;
  setUserTextColor: (color: string) => void;
  chatBackground: string;
  setChatBackground: (color: string) => void;
  logoUrl: string;
  setLogoUrl: (url: string) => void;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  admin: boolean;
  setAdmin: (admin: boolean) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
  isElevenLabsEnabled: boolean;
  setIsElevenLabsEnabled: (enabled: boolean) => void;
  elevenLabsAgentId: string;
  setElevenLabsAgentId: (agentId: string) => void;
  gradientColor: string;
  setGradientColor: (color: string) => void;
  headerGradientColor: string;
  setHeaderGradientColor: (color: string) => void;
  headerMainColor: string;
  setHeaderMainColor: (color: string) => void;
  logoBackgroundColor: string;
  setLogoBackgroundColor: (color: string) => void;
  logoBorderColor: string;
  setLogoBorderColor: (color: string) => void;
  headerButtonColor: string;
  setHeaderButtonColor: (color: string) => void;
  fontFamily: string;
  setFontFamily: (font: string) => void;
  copySuccessMessage: string;
  setCopySuccessMessage: (message: string) => void;
  welcomeButtons: WelcomeButton[];
  setWelcomeButtons: (buttons: WelcomeButton[]) => void;
  disclaimerText: string;
  setDisclaimerText: (text: string) => void;
  bubbleText: string;
  setBubbleText: (text: string) => void;
}
export const ConfigurationSection: React.FC<ConfigurationSectionProps> = ({
  webhookUrl,
  setWebhookUrl,
  title,
  setTitle,
  bio,
  setBio,
  placeholder,
  setPlaceholder,
  position,
  setPosition,
  primaryColor,
  setPrimaryColor,
  secondaryColor,
  setSecondaryColor,
  textColor,
  setTextColor,
  userTextColor,
  setUserTextColor,
  chatBackground,
  setChatBackground,
  logoUrl,
  setLogoUrl,
  avatarUrl,
  setAvatarUrl,
  welcomeMessage,
  setWelcomeMessage,
  admin,
  setAdmin,
  isVoiceEnabled,
  setIsVoiceEnabled,
  isElevenLabsEnabled,
  setIsElevenLabsEnabled,
  elevenLabsAgentId,
  setElevenLabsAgentId,
  gradientColor,
  setGradientColor,
  headerGradientColor,
  setHeaderGradientColor,
  headerMainColor,
  setHeaderMainColor,
  logoBackgroundColor,
  setLogoBackgroundColor,
  logoBorderColor,
  setLogoBorderColor,
  headerButtonColor,
  setHeaderButtonColor,
  fontFamily,
  setFontFamily,
  copySuccessMessage,
  setCopySuccessMessage,
  welcomeButtons,
  setWelcomeButtons,
  disclaimerText,
  setDisclaimerText,
  bubbleText,
  setBubbleText
}) => {
  const {
    toast
  } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('html');
  const copyCode = (language: string) => {
    const code = generateCode(language);
    navigator.clipboard.writeText(code);
    toast({
      title: 'Code copied to clipboard!',
      description: `${getLanguageDisplayName(language)} integration code has been copied.`
    });
  };
  const getLanguageDisplayName = (lang: string) => {
    const names: Record<string, string> = {
      html: 'HTML',
      'react-ts': 'React (TypeScript)',
      'react-js': 'React (JavaScript)',
      vue: 'Vue.js',
      dotnet: '.NET',
      angular: 'Angular'
    };
    return names[lang] || lang;
  };
  const generateCode = (language: string) => {
    const baseConfig = {
      webhookUrl,
      title,
      bio,
      placeholder,
      position,
      primaryColor,
      secondaryColor,
      textColor,
      userTextColor,
      chatBackground,
      welcomeMessage,
      bubbleMessage: bubbleText,
      admin,
      isVoiceEnabled,
      logoUrl,
      avatarUrl,
      isElevenLabsEnabled,
      elevenLabsAgentId,
      gradientColor,
      headerGradientColor,
      headerMainColor,
      logoBackgroundColor,
      logoBorderColor,
      headerButtonColor,
      fontFamily,
      copySuccessMessage
    };
    const reactConfig = `  webhookUrl: '${baseConfig.webhookUrl}',
    title: '${baseConfig.title}',
    bio: '${baseConfig.bio}',
    placeholder: '${baseConfig.placeholder}',
    position: '${baseConfig.position}',
    primaryColor: '${baseConfig.primaryColor}',
    secondaryColor: '${baseConfig.secondaryColor}',
    textColor: '${baseConfig.textColor}',
    userTextColor: '${baseConfig.userTextColor}',
    chatBackground: '${baseConfig.chatBackground}',
    welcomeMessage: '${baseConfig.welcomeMessage}',
    bubbleMessage: '${baseConfig.bubbleMessage}',
    admin: ${baseConfig.admin},
    isVoiceEnabled: ${baseConfig.isVoiceEnabled},
    isElevenLabsEnabled: ${baseConfig.isElevenLabsEnabled},
    elevenLabsAgentId: '${baseConfig.elevenLabsAgentId}',
    gradientColor: '${baseConfig.gradientColor}',
    headerGradientColor: '${baseConfig.headerGradientColor}',
    headerMainColor: '${baseConfig.headerMainColor}',
    logoBackgroundColor: '${baseConfig.logoBackgroundColor}',
    logoBorderColor: '${baseConfig.logoBorderColor}',
    headerButtonColor: '${baseConfig.headerButtonColor}',
    fontFamily: '${baseConfig.fontFamily}',
    copySuccessMessage: '${baseConfig.copySuccessMessage}',
    logoUrl: '${baseConfig.logoUrl}',
    avatarUrl: '${baseConfig.avatarUrl}'`;
    const elevenLabsEmbed = isElevenLabsEnabled ? `

<!-- ElevenLabs Voice Bot Integration -->
<script type="module">
  import { Conversation } from 'https://cdn.jsdelivr.net/npm/@11labs/react@0.1.4/+esm';
  
  // Configure your agent
  const conversation = new Conversation({
    agentId: '${elevenLabsAgentId}',
    apiKey: 'YOUR_ELEVENLABS_API_KEY'
  });
</script>` : '';
    switch (language) {
      case 'html':
        return `<!-- Add CSS to <head> section -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css">

<!-- Add before closing </body> tag or in your component -->
<script src="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.js"></script>
<script>
    // Wait for ChatbotWidget to be available and initialize
    let checkCount = 0;
    const checkInterval = setInterval(function() {
        checkCount++;

        if (typeof ChatbotWidget !== 'undefined') {
            clearInterval(checkInterval);

            try {
                // Use createChat method (n8n style)
                ChatbotWidget.createChat({
${reactConfig.split('\n').map(line => '                    ' + line.trim().replace(/^/, '')).join('\n')}
                });
                console.log('✅ ChatbotWidget initialized successfully!');
            } catch (error) {
                console.error('❌ Error initializing ChatbotWidget:', error);
            }
        }
    }, 100);
</script>`;
      case 'react-ts':
        return `// App.tsx
import { useEffect } from 'react';
import 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css';

export const App = () => {
  useEffect(() => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css';
    document.head.appendChild(link);

    // Load and initialize ChatbotWidget
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.js';
    script.onload = () => {
      if (typeof ChatbotWidget !== 'undefined') {
        ChatbotWidget.createChat({
${reactConfig.split('\n').map(line => '          ' + line.trim()).join('\n')}
        });
      }
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (typeof ChatbotWidget !== 'undefined') {
        // ChatbotWidget cleanup handled automatically
      }
    };
  }, []);

  return <div></div>;
};`;
      case 'react-js':
        return `// App.jsx
import { useEffect } from 'react';

export const App = () => {
  useEffect(() => {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css';
    document.head.appendChild(link);

    // Load and initialize ChatbotWidget
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.js';
    script.onload = () => {
      if (typeof ChatbotWidget !== 'undefined') {
        ChatbotWidget.createChat({
${reactConfig.split('\n').map(line => '          ' + line.trim()).join('\n')}
        });
      }
    };
    document.body.appendChild(script);

    // Cleanup
    return () => {
      if (typeof ChatbotWidget !== 'undefined') {
        // ChatbotWidget cleanup handled automatically
      }
    };
  }, []);

  return <div></div>;
};`;
      case 'vue':
        return `<script lang="ts" setup>
// App.vue
import { onMounted } from 'vue';

onMounted(() => {
  // Load CSS
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css';
  document.head.appendChild(link);

  // Load and initialize ChatbotWidget
  const script = document.createElement('script');
  script.src = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.js';
  script.onload = () => {
    if (typeof ChatbotWidget !== 'undefined') {
      ChatbotWidget.createChat({
${reactConfig.split('\n').map(line => '        ' + line.trim()).join('\n')}
      });
    }
  };
  document.body.appendChild(script);
});
</script>

<template>
  <div></div>
</template>`;
      case 'dotnet':
        return `@* Add this to your layout or page *@
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css">

@* Add these scripts before closing body tag *@
<script src="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.js"></script>
<script>
    document.addEventListener('DOMContentLoaded', function() {
        ChatbotWidget.init({
${reactConfig.split('\n').map(line => '            ' + line.trim()).join('\n')}
        });
    });
</script>

@* In your controller *@
@* 
public IActionResult Index()
{
    ViewBag.WebhookUrl = "${baseConfig.webhookUrl}";
    ViewBag.LogoFile = "${baseConfig.logoFile}";
    ViewBag.ChatTitle = "${baseConfig.title}";
    ViewBag.WelcomeMessage = "${baseConfig.welcomeMessage}";
    return View();
}
*@

Then in your view, you can use:
webhookUrl: '@ViewBag.WebhookUrl',
logoFile: '@ViewBag.LogoFile',
title: '@ViewBag.ChatTitle',
welcomeMessage: '@ViewBag.WelcomeMessage'`;
      case 'angular':
        return `// chatbot.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private config = {
${reactConfig.split('\n').map(line => '    ' + line.trim()).join('\n')}
  };

  initChatbot() {
    // Load CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.css';
    document.head.appendChild(link);

    // Load chatbot widget
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget@1.0.8/chatbot-widget.js';
    script.onload = () => {
      (window as any).ChatbotWidget.init(this.config);
    };
    document.head.appendChild(script);
  }
}

// app.component.ts
import { Component, OnInit } from '@angular/core';
import { ChatbotService } from './chatbot.service';

@Component({
  selector: 'app-root',
  template: \`
    <div class="app">
      <!-- Your app content -->
      <div id="chatbot-container"></div>
    </div>
  \`
})
export class AppComponent implements OnInit {
  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.chatbotService.initChatbot();
  }
}`;
      default:
        return 'Language not supported';
    }
  };
  return <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Chatbot &amp; Voice Agent Widget Configuration</h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Customize your chatbot's appearance, behavior, and integration settings. 
          Preview changes in real-time and generate code for seamless integration.
        </p>
      </div>

      <div className="w-full">
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Configuration */}
          <Card className="border-2 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl animate-slide-in-left">
            <CardHeader className="bg-gradient-to-r from-blue-500/5 to-purple-500/5">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-blue-600" />
                Basic Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-sm font-medium">Webhook URL</Label>
                <Input id="webhookUrl" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-api.com/chatbot/webhook" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" />
                <p className="text-xs text-gray-500">The endpoint where chat messages will be sent</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Chat Title</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Chat Support" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="bio" className="text-sm font-medium">Status/Bio</Label>
                  <Input id="bio" value={bio} onChange={e => setBio(e.target.value)} placeholder="Online now" className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeholder" className="text-sm font-medium">Input Placeholder</Label>
                <Input id="placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} placeholder="Type your message..." className="transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="position" className="text-sm font-medium">Widget Position</Label>
                <select id="position" value={position} onChange={e => setPosition(e.target.value as 'bottom-right' | 'bottom-left')} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200">
                  <option value="bottom-right">Bottom Right</option>
                  <option value="bottom-left">Bottom Left</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="text-sm font-medium">Welcome Message</Label>
                <Textarea id="welcomeMessage" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} placeholder="Hello! How can I help you today?" className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" />
                <p className="text-xs text-gray-500">First message users see when opening the chat</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bubbleText" className="text-sm font-medium">Chat Bubble Text</Label>
                <Textarea id="bubbleText" value={bubbleText} onChange={e => setBubbleText(e.target.value)} placeholder="Hey! How can I help you today?" className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20" />
                <p className="text-xs text-gray-500">Text shown on the chat bubble before opening the widget</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="disclaimerText" className="text-sm font-medium">Disclaimer Text</Label>
                <Textarea
                  id="disclaimerText"
                  value={disclaimerText}
                  onChange={e => setDisclaimerText(e.target.value)}
                  placeholder="AI chatbot - I do my best, I can answer any questions and make bookings, but always verify important details with a human."
                  className="min-h-[80px] transition-all duration-200 focus:ring-2 focus:ring-blue-500/20"
                />
                <p className="text-xs text-gray-500">Disclaimer text shown above messages after conversation starts</p>
              </div>

              {/* Welcome Buttons Configuration */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">Welcome Screen Buttons</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const newButton: WelcomeButton = {
                        id: Date.now().toString(),
                        text: 'New Button',
                        message: 'New button message',
                        icon: '💬'
                      };
                      setWelcomeButtons([...welcomeButtons, newButton]);
                    }}
                    className="flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3" />
                    Add Button
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {welcomeButtons.map((button, index) => (
                    <div key={button.id} className="flex gap-2 p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1 space-y-2">
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <Label className="text-xs text-gray-600">Icon</Label>
                            <Input
                              value={button.icon || ''}
                              onChange={(e) => {
                                const newButtons = [...welcomeButtons];
                                newButtons[index] = { ...button, icon: e.target.value };
                                setWelcomeButtons(newButtons);
                              }}
                              placeholder="💬"
                              className="h-8 text-sm"
                            />
                          </div>
                          <div className="col-span-2">
                            <Label className="text-xs text-gray-600">Button Text</Label>
                            <Input
                              value={button.text}
                              onChange={(e) => {
                                const newButtons = [...welcomeButtons];
                                newButtons[index] = { ...button, text: e.target.value };
                                setWelcomeButtons(newButtons);
                              }}
                              placeholder="Button text"
                              className="h-8 text-sm"
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">Message to send</Label>
                          <Input
                            value={button.message}
                            onChange={(e) => {
                              const newButtons = [...welcomeButtons];
                              newButtons[index] = { ...button, message: e.target.value };
                              setWelcomeButtons(newButtons);
                            }}
                            placeholder="Message to send when clicked"
                            className="h-8 text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (index > 0) {
                              const newButtons = [...welcomeButtons];
                              [newButtons[index], newButtons[index - 1]] = [newButtons[index - 1], newButtons[index]];
                              setWelcomeButtons(newButtons);
                            }
                          }}
                          className="h-6 w-6 p-0"
                          disabled={index === 0}
                        >
                          <Move className="w-3 h-3 rotate-180" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            if (index < welcomeButtons.length - 1) {
                              const newButtons = [...welcomeButtons];
                              [newButtons[index], newButtons[index + 1]] = [newButtons[index + 1], newButtons[index]];
                              setWelcomeButtons(newButtons);
                            }
                          }}
                          className="h-6 w-6 p-0"
                          disabled={index === welcomeButtons.length - 1}
                        >
                          <Move className="w-3 h-3" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            const newButtons = welcomeButtons.filter((_, i) => i !== index);
                            setWelcomeButtons(newButtons);
                          }}
                          className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Configure buttons shown on the welcome screen. Users can click these to send predefined messages.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-medium">Header Logo URL (optional)</Label>
                <Input
                  id="logoUrl"
                  type="url"
                  placeholder="https://example.com/your-logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  className="w-full"
                />
                {logoUrl && (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50">
                        <img src={logoUrl} alt="Header logo preview" className="w-full h-full object-contain" onError={(e) => {
                          e.currentTarget.src = '/lovable-uploads/fd9d4dbf-9035-4de8-a3a1-81089fcac665.png';
                        }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">{logoUrl}</p>
                      <p className="text-xs text-gray-400">Header logo preview</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setLogoUrl('')} className="flex-shrink-0">
                      Clear
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">Logo displayed in the chat widget header. Use a publicly accessible URL.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="avatarUrl" className="text-sm font-medium">Avatar Image URL (optional)</Label>
                <Input
                  id="avatarUrl"
                  type="url"
                  placeholder="https://example.com/your-avatar.png"
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  className="w-full"
                />
                {avatarUrl && (
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 rounded-full border-2 border-gray-200 overflow-hidden bg-gray-50">
                        <img src={avatarUrl} alt="Avatar preview" className="w-full h-full object-contain" onError={(e) => {
                          e.currentTarget.src = '/lovable-uploads/1f938225-daa7-46d3-a44e-d951e492fcd4.png';
                        }} />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-600 truncate">{avatarUrl}</p>
                      <p className="text-xs text-gray-400">Avatar preview</p>
                    </div>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAvatarUrl('')} className="flex-shrink-0">
                      Clear
                    </Button>
                  </div>
                )}
                <p className="text-xs text-gray-500">Avatar displayed in message bubbles and call interface. Use a publicly accessible URL.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoBackgroundColor" className="text-sm font-medium">Logo Background Color</Label>
                <div className="flex gap-2 items-center">
                  <Input id="logoBackgroundColor" type="color" value={logoBackgroundColor === 'transparent' ? '#ffffff' : logoBackgroundColor} onChange={e => setLogoBackgroundColor(e.target.value)} className="w-16 h-10 p-1 border rounded" />
                  <div className="flex-1">
                    <Input type="text" value={logoBackgroundColor} onChange={e => setLogoBackgroundColor(e.target.value)} placeholder="Background color or 'transparent'" className="text-sm" />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setLogoBackgroundColor('transparent')} className="text-xs">
                    Transparent
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Background color behind the logo (set to 'transparent' for no background)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logoBorderColor" className="text-sm font-medium">Logo Border Color</Label>
                <div className="flex gap-2 items-center">
                  <Input id="logoBorderColor" type="color" value={logoBorderColor === 'none' ? '#e5e7eb' : logoBorderColor} onChange={e => setLogoBorderColor(e.target.value)} className="w-16 h-10 p-1 border rounded" />
                  <div className="flex-1">
                    <Input type="text" value={logoBorderColor} onChange={e => setLogoBorderColor(e.target.value)} placeholder="Enter border color or 'none'" className="text-sm" />
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={() => setLogoBorderColor('none')} className="text-xs">
                    No Border
                  </Button>
                </div>
                <p className="text-xs text-gray-500">Border around the logo (set to 'none' for no border)</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="admin" className="text-sm font-medium">Admin Mode</Label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="admin" checked={admin} onChange={e => setAdmin(e.target.checked)} className="rounded border-input focus:ring-2 focus:ring-orange-500/20" />
                    <Label htmlFor="admin" className="text-sm text-muted-foreground">
                      Enable edit message functionality
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="isElevenLabsEnabled" className="text-sm font-medium">ElevenLabs Voice Bot</Label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isElevenLabsEnabled" checked={isElevenLabsEnabled} onChange={e => setIsElevenLabsEnabled(e.target.checked)} className="rounded border-input focus:ring-2 focus:ring-orange-500/20" />
                    <Label htmlFor="isElevenLabsEnabled" className="text-sm text-muted-foreground">
                      Enable ElevenLabs conversational AI
                    </Label>
                  </div>
                </div>

                {isElevenLabsEnabled && <div className="space-y-2">
                    <Label htmlFor="elevenLabsAgentId" className="text-sm font-medium">ElevenLabs Agent ID</Label>
                    <Input id="elevenLabsAgentId" value={elevenLabsAgentId} onChange={e => setElevenLabsAgentId(e.target.value)} placeholder="agent_01k04zwwq3fv5acgzdwmbvfk8k" className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20" />
                    <p className="text-xs text-muted-foreground">
                      Your ElevenLabs agent ID from the conversational AI dashboard
                    </p>
                  </div>}
              </div>

              {/* Integration Code Generator */}
              <div className="space-y-4 pt-4 border-t">
                <Label className="text-sm font-medium">Generate Integration Code</Label>
                <div className="space-y-2">
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="html">HTML</SelectItem>
                      <SelectItem value="react-ts">React (TypeScript)</SelectItem>
                      <SelectItem value="react-js">React (JavaScript)</SelectItem>
                      <SelectItem value="vue">Vue.js</SelectItem>
                      <SelectItem value="dotnet">.NET</SelectItem>
                      <SelectItem value="angular">Angular</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => copyCode(selectedLanguage)} className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy {getLanguageDisplayName(selectedLanguage)} Integration Code
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Color Customization */}
          <Card className="border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl animate-slide-in-right">
            <CardHeader className="bg-gradient-to-r from-purple-500/5 to-pink-500/5">
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5 text-purple-600" />
                Color Customization
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6">
              {[{
              id: 'primaryColor',
              label: 'Primary Color',
              value: primaryColor,
              setter: setPrimaryColor,
              desc: 'Header background and user message bubbles'
            }, {
              id: 'secondaryColor',
              label: 'Secondary Color',
              value: secondaryColor,
              setter: setSecondaryColor,
              desc: 'Bot message bubble background'
            }, {
              id: 'chatBackground',
              label: 'Chat Background',
              value: chatBackground,
              setter: setChatBackground,
              desc: 'Main chat window background'
            }, {
              id: 'textColor',
              label: 'Bot Text Color',
              value: textColor,
              setter: setTextColor,
              desc: 'Text color for bot messages'
            }, {
              id: 'userTextColor',
              label: 'User Text Color',
              value: userTextColor,
              setter: setUserTextColor,
              desc: 'Text color for user messages'
            }, {
              id: 'headerGradientColor',
              label: 'Header Gradient Color',
              value: headerGradientColor,
              setter: setHeaderGradientColor,
              desc: 'Start and end color for the header gradient'
            }, {
              id: 'headerMainColor',
              label: 'Header Main Color',
              value: headerMainColor,
              setter: setHeaderMainColor,
              desc: 'Middle color for the header gradient effect'
            }, {
              id: 'headerButtonColor',
              label: 'Header Button Color',
              value: headerButtonColor,
              setter: setHeaderButtonColor,
              desc: 'Color for buttons and icons in the header'
            }].map((color, index) => <div key={color.id} className="space-y-2 animate-fade-in" style={{
              animationDelay: `${index * 100}ms`
            }}>
                  <Label htmlFor={color.id} className="text-sm font-medium">{color.label}</Label>
                  <div className="flex gap-2">
                    <Input id={color.id} type="color" value={color.value} onChange={e => color.setter(e.target.value)} className="w-16 h-10 p-1 rounded-md border transition-all duration-200 hover:scale-105" />
                    <Input value={color.value} onChange={e => color.setter(e.target.value)} className="flex-1 transition-all duration-200 focus:ring-2 focus:ring-purple-500/20" />
                  </div>
                  <p className="text-xs text-muted-foreground">{color.desc}</p>
                </div>)}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>;
};