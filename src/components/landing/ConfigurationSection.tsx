import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Copy, Palette, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ConfigurationSectionProps {
  webhookUrl: string;
  setWebhookUrl: (url: string) => void;
  title: string;
  setTitle: (title: string) => void;
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
  welcomeMessage: string;
  setWelcomeMessage: (message: string) => void;
  admin: boolean;
  setAdmin: (admin: boolean) => void;
  isVoiceEnabled: boolean;
  setIsVoiceEnabled: (enabled: boolean) => void;
}

export const ConfigurationSection: React.FC<ConfigurationSectionProps> = ({
  webhookUrl,
  setWebhookUrl,
  title,
  setTitle,
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
  welcomeMessage,
  setWelcomeMessage,
  admin,
  setAdmin,
  isVoiceEnabled,
  setIsVoiceEnabled
}) => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState('html');

  const generateCodeForLanguage = (language: string) => {
    const baseConfig = {
      webhookUrl: webhookUrl || 'YOUR_WEBHOOK_URL',
      title,
      placeholder,
      position,
      primaryColor,
      secondaryColor,
      textColor,
      userTextColor,
      chatBackground,
      welcomeMessage,
      admin,
      isVoiceEnabled,
      logoUrl
    };

    const configString = `{
    webhookUrl: '${baseConfig.webhookUrl}',
    title: '${baseConfig.title}',
    placeholder: '${baseConfig.placeholder}',
    position: '${baseConfig.position}',
    primaryColor: '${baseConfig.primaryColor}',
    secondaryColor: '${baseConfig.secondaryColor}',
    textColor: '${baseConfig.textColor}',
    userTextColor: '${baseConfig.userTextColor}',
    chatBackground: '${baseConfig.chatBackground}',
    welcomeMessage: '${baseConfig.welcomeMessage}',
    admin: ${baseConfig.admin},
    isVoiceEnabled: ${baseConfig.isVoiceEnabled}${baseConfig.logoUrl ? `,
    logoUrl: '${baseConfig.logoUrl}'` : ''}
  }`;

    switch (language) {
      case 'html':
        return `/* 
INTEGRATION INSTRUCTIONS FOR HTML:
1. Add the following code to your website's <head> section or before the closing </body> tag
2. Replace 'YOUR_WEBHOOK_URL' with your actual webhook endpoint
3. The chatbot widget will automatically appear on your website
4. You can customize the configuration object below to match your branding
*/

<!-- Add this to your website's <head> section -->
<link rel="stylesheet" href="https://chirodashboard-chat.onrender.com/chatbot-widget.css">
<script src="https://chirodashboard-chat.onrender.com/chatbot-widget.js"></script>

<!-- Initialize the widget using ChatbotManager -->
<script>
  const instance = new window.ChatbotWidget.ChatbotManager();
  instance.init(${configString});
</script>`;

      case 'react-ts':
        return `/*
INTEGRATION INSTRUCTIONS FOR REACT TYPESCRIPT:
1. Create a new component file: src/components/ChatbotIntegration.tsx
2. Copy the code below into this file
3. Import and use the component in your App.tsx or wherever needed: <ChatbotIntegration />
4. Replace 'YOUR_WEBHOOK_URL' with your actual webhook endpoint
5. The component will automatically load and initialize the chatbot widget
*/

// src/components/ChatbotIntegration.tsx
import { useEffect, useRef } from 'react';

const ChatbotIntegration: React.FC = () => {
  const instanceRef = useRef<any>(null);

  useEffect(() => {
    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://chirodashboard-chat.onrender.com/chatbot-widget.css';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://chirodashboard-chat.onrender.com/chatbot-widget.js';
    script.onload = () => {
      // Create instance using ChatbotManager
      instanceRef.current = new (window as any).ChatbotWidget.ChatbotManager();
      instanceRef.current.init(${configString});
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
      document.head.removeChild(cssLink);
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatbotIntegration;

/*
USAGE IN YOUR APP:
Import the component in your App.tsx or main layout component:

import ChatbotIntegration from './components/ChatbotIntegration';

function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      <ChatbotIntegration />
    </div>
  );
}
*/`;

      case 'react-js':
        return `/*
INTEGRATION INSTRUCTIONS FOR REACT JAVASCRIPT:
1. Create a new component file: src/components/ChatbotIntegration.js
2. Copy the code below into this file
3. Import and use the component in your App.js or wherever needed: <ChatbotIntegration />
4. Replace 'YOUR_WEBHOOK_URL' with your actual webhook endpoint
5. The component will automatically load and initialize the chatbot widget
*/

// src/components/ChatbotIntegration.js
import { useEffect, useRef } from 'react';

const ChatbotIntegration = () => {
  const instanceRef = useRef(null);

  useEffect(() => {
    // Load CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://chirodashboard-chat.onrender.com/chatbot-widget.css';
    document.head.appendChild(cssLink);

    // Load JS
    const script = document.createElement('script');
    script.src = 'https://chirodashboard-chat.onrender.com/chatbot-widget.js';
    script.onload = () => {
      // Create instance using ChatbotManager
      instanceRef.current = new window.ChatbotWidget.ChatbotManager();
      instanceRef.current.init(${configString});
    };
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
      document.head.removeChild(cssLink);
      document.body.removeChild(script);
    };
  }, []);

  return null;
};

export default ChatbotIntegration;

/*
USAGE IN YOUR APP:
Import the component in your App.js or main layout component:

import ChatbotIntegration from './components/ChatbotIntegration';

function App() {
  return (
    <div className="App">
      {/* Your existing app content */}
      <ChatbotIntegration />
    </div>
  );
}
*/`;

      case 'vue':
        return `<!--
INTEGRATION INSTRUCTIONS FOR VUE.JS:
1. Create a new component file: src/components/ChatbotIntegration.vue
2. Copy the code below into this file
3. Import and register the component in your main App.vue or wherever needed
4. Use the component in your template: <ChatbotIntegration />
5. Replace 'YOUR_WEBHOOK_URL' with your actual webhook endpoint
6. The component will automatically load and initialize the chatbot widget
-->

<!-- src/components/ChatbotIntegration.vue -->
<template>
  <div>
    <!-- Chatbot widget will be injected here -->
  </div>
</template>

<script>
export default {
  name: 'ChatbotIntegration',
  data() {
    return {
      chatbotInstance: null
    };
  },
  mounted() {
    this.loadChatbot();
  },
  beforeUnmount() {
    if (this.chatbotInstance) {
      this.chatbotInstance.destroy();
    }
  },
  methods: {
    loadChatbot() {
      // Load CSS
      const cssLink = document.createElement('link');
      cssLink.rel = 'stylesheet';
      cssLink.href = 'https://chirodashboard-chat.onrender.com/chatbot-widget.css';
      document.head.appendChild(cssLink);

      // Load JS
      const script = document.createElement('script');
      script.src = 'https://chirodashboard-chat.onrender.com/chatbot-widget.js';
      script.onload = () => {
        // Create instance using ChatbotManager
        this.chatbotInstance = new window.ChatbotWidget.ChatbotManager();
        this.chatbotInstance.init(${configString});
      };
      document.body.appendChild(script);
    }
  }
};
</script>

<!--
USAGE IN YOUR APP:
1. Import and register the component in your main App.vue:

<script>
import ChatbotIntegration from './components/ChatbotIntegration.vue';

export default {
  name: 'App',
  components: {
    ChatbotIntegration
  }
}
</script>

2. Use it in your template:
<template>
  <div id="app">
    <!-- Your existing app content -->
    <ChatbotIntegration />
  </div>
</template>
-->`;

      case 'dotnet':
        return `/*
INTEGRATION INSTRUCTIONS FOR .NET:
1. Add the following code to your main layout file (_Layout.cshtml) or specific page
2. If using in a specific page, create a partial view: Views/Shared/_ChatbotWidget.cshtml
3. Include the partial view where needed: @Html.Partial("_ChatbotWidget")
4. Replace 'YOUR_WEBHOOK_URL' with your actual webhook endpoint
5. You can pass configuration values from your controller using ViewBag
6. The chatbot widget will automatically appear on your pages
*/

@* Add to your _Layout.cshtml or create as Views/Shared/_ChatbotWidget.cshtml *@
<link rel="stylesheet" href="https://chirodashboard-chat.onrender.com/chatbot-widget.css" />
<script src="https://chirodashboard-chat.onrender.com/chatbot-widget.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    if (window.ChatbotWidget) {
        // Create instance using ChatbotManager
        const instance = new window.ChatbotWidget.ChatbotManager();
        instance.init(${configString.replace(/'/g, '"')});
    }
});
</script>

@* 
CONTROLLER SETUP (Optional - for dynamic configuration):
In your controller (e.g., HomeController.cs):

public class HomeController : Controller
{
    public IActionResult Index()
    {
        ViewBag.WebhookUrl = "${baseConfig.webhookUrl}";
        ViewBag.LogoUrl = "${baseConfig.logoUrl}";
        ViewBag.ChatTitle = "${baseConfig.title}";
        ViewBag.WelcomeMessage = "${baseConfig.welcomeMessage}";
        return View();
    }
}

Then in your view, you can use:
webhookUrl: '@ViewBag.WebhookUrl',
logoUrl: '@ViewBag.LogoUrl',
title: '@ViewBag.ChatTitle',
welcomeMessage: '@ViewBag.WelcomeMessage'
*@`;

      case 'angular':
        return `/*
INTEGRATION INSTRUCTIONS FOR ANGULAR:
1. Create a service: ng generate service services/chatbot
2. Create a component: ng generate component components/chatbot-integration
3. Copy the service code below into src/app/services/chatbot.service.ts
4. Copy the component code below into src/app/components/chatbot-integration/chatbot-integration.component.ts
5. Add <app-chatbot-integration></app-chatbot-integration> to your app.component.html
6. Replace 'YOUR_WEBHOOK_URL' with your actual webhook endpoint
7. The chatbot widget will automatically appear on your application
*/

// src/app/services/chatbot.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private scriptLoaded = false;
  private cssLoaded = false;
  private chatbotInstance: any = null;

  loadChatbot(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.cssLoaded) {
        this.loadCSS();
      }
      
      if (!this.scriptLoaded) {
        this.loadScript().then(() => {
          this.initializeChatbot();
          resolve();
        }).catch(reject);
      } else {
        this.initializeChatbot();
        resolve();
      }
    });
  }

  private loadCSS(): void {
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = 'https://chirodashboard-chat.onrender.com/chatbot-widget.css';
    document.head.appendChild(cssLink);
    this.cssLoaded = true;
  }

  private loadScript(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://chirodashboard-chat.onrender.com/chatbot-widget.js';
      script.onload = () => {
        this.scriptLoaded = true;
        resolve();
      };
      script.onerror = reject;
      document.body.appendChild(script);
    });
  }

  private initializeChatbot(): void {
    if ((window as any).ChatbotWidget) {
      // Create instance using ChatbotManager
      this.chatbotInstance = new (window as any).ChatbotWidget.ChatbotManager();
      this.chatbotInstance.init(${configString});
    }
  }

  destroy(): void {
    if (this.chatbotInstance) {
      this.chatbotInstance.destroy();
      this.chatbotInstance = null;
    }
  }
}

// src/app/components/chatbot-integration/chatbot-integration.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatbotService } from '../../services/chatbot.service';

@Component({
  selector: 'app-chatbot-integration',
  template: \`<!-- Chatbot widget will be injected automatically -->\`,
  standalone: true
})
export class ChatbotIntegrationComponent implements OnInit, OnDestroy {
  
  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.chatbotService.loadChatbot().catch(error => {
      console.error('Failed to load chatbot:', error);
    });
  }

  ngOnDestroy() {
    this.chatbotService.destroy();
  }
}

/*
USAGE IN YOUR APP:
1. Import the component in your app.component.ts:

import { ChatbotIntegrationComponent } from './components/chatbot-integration/chatbot-integration.component';

@Component({
  selector: 'app-root',
  imports: [ChatbotIntegrationComponent],
  template: \`
    <div>
      <!-- Your existing app content -->
      <app-chatbot-integration></app-chatbot-integration>
    </div>
  \`
})
export class AppComponent {
  title = 'your-app';
}

2. Or add it to your app.component.html:
<app-chatbot-integration></app-chatbot-integration>
*/`;

      default:
        return '';
    }
  };

  const copyCode = (language: string) => {
    const code = generateCodeForLanguage(language);
    navigator.clipboard.writeText(code);
    toast({
      title: "Code Copied!",
      description: `${getLanguageDisplayName(language)} integration code copied to clipboard`
    });
  };

  const getLanguageDisplayName = (language: string) => {
    switch (language) {
      case 'html': return 'HTML';
      case 'react-ts': return 'React TypeScript';
      case 'react-js': return 'React JavaScript';
      case 'vue': return 'Vue.js';
      case 'dotnet': return '.NET';
      case 'angular': return 'Angular';
      default: return language.charAt(0).toUpperCase() + language.slice(1);
    }
  };

  return (
    <div className="py-24 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950 dark:to-red-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16 animate-fade-in">
          <Badge className="mb-4 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white border-0">
            <Settings className="w-4 h-4 mr-2" />
            Live Configuration
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent py-4">
            Example of Testing Environment
          </h2>
          <p className="text-muted-foreground max-w-3xl mx-auto px-0 text-xl">
            Customize the chatbot widget settings and see the changes in real-time. 
            Ask us questions about our service by clicking the chat widget in the bottom right corner.
          </p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Basic Configuration */}
          <Card className="border-2 hover:border-orange-500/50 transition-all duration-300 hover:shadow-xl animate-slide-in-left">
            <CardHeader className="bg-gradient-to-r from-orange-500/5 to-red-500/5">
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5 text-orange-600" />
                Basic Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 p-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-sm font-medium">Widget Title</Label>
                  <Input id="title" value={title} onChange={e => setTitle(e.target.value)} className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20" />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">Position</Label>
                  <select id="position" value={position} onChange={e => setPosition(e.target.value as 'bottom-right' | 'bottom-left')} className="w-full p-2 border border-input rounded-md bg-background transition-all duration-200 focus:ring-2 focus:ring-orange-500/20">
                    <option value="bottom-right">Bottom Right</option>
                    <option value="bottom-left">Bottom Left</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="webhookUrl" className="text-sm font-medium">Webhook URL</Label>
                <Input id="webhookUrl" value={webhookUrl} onChange={e => setWebhookUrl(e.target.value)} placeholder="https://your-webhook-url.com" className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="placeholder" className="text-sm font-medium">Input Placeholder</Label>
                <Input id="placeholder" value={placeholder} onChange={e => setPlaceholder(e.target.value)} className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="welcomeMessage" className="text-sm font-medium">Welcome Message</Label>
                <Textarea id="welcomeMessage" value={welcomeMessage} onChange={e => setWelcomeMessage(e.target.value)} rows={2} className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20" placeholder="Hey, this is Jack, the Virtual Assistant from ToraTech AI. How can I help you today?" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="logoUrl" className="text-sm font-medium">Logo URL (optional)</Label>
                <Input 
                  id="logoUrl" 
                  value={logoUrl} 
                  onChange={e => setLogoUrl(e.target.value)} 
                  placeholder="https://media.licdn.com/dms/image/v2/D4E0BAQFRPXC4w25iOw/company-logo_200_200/B4EZVtx7beHgAI-/0/1741303560536?e=2147483647&v=beta&t=IMfviElZP1Vi86km2p9hrP-uuXQZxo1Ux_BvQ9-o0l4" 
                  className="transition-all duration-200 focus:ring-2 focus:ring-orange-500/20" 
                />
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
                  <Label htmlFor="isVoiceEnabled" className="text-sm font-medium">Voice Features</Label>
                  <div className="flex items-center space-x-2">
                    <input type="checkbox" id="isVoiceEnabled" checked={isVoiceEnabled} onChange={e => setIsVoiceEnabled(e.target.checked)} className="rounded border-input focus:ring-2 focus:ring-orange-500/20" />
                    <Label htmlFor="isVoiceEnabled" className="text-sm text-muted-foreground">
                      Enable voice recording and text-to-speech
                    </Label>
                  </div>
                </div>
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
                  <Button 
                    onClick={() => copyCode(selectedLanguage)} 
                    className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:scale-105"
                  >
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
    </div>
  );
};
