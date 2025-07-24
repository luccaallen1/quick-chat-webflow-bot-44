
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Copy, Check, Code2, Palette } from 'lucide-react';

export const IntegrationSection = () => {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const copyToClipboard = async (text: string, tabId: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedTab(tabId);
      setTimeout(() => setCopiedTab(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const integrationExamples = {
    html: `<!-- Include the CSS and JS files -->
<link rel="stylesheet" href="https://chirodashboard-chat.onrender.com/chatbot-widget.css">
<script src="https://chirodashboard-chat.onrender.com/chatbot-widget.js"></script>

<!-- Initialize the widget using ChatbotManager -->
<script>
  const instance = new window.ChatbotWidget.ChatbotManager();
  instance.init({
    webhookUrl: 'YOUR_WEBHOOK_URL',
    title: 'Chat Support',
    placeholder: 'Type your message...',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
    textColor: '#1f2937',
    userTextColor: '#ffffff',
    chatBackground: '#ffffff',
    welcomeMessage: 'Hello! How can I help you today?',
    logoUrl: 'YOUR_LOGO_URL'
  });
</script>`,
    react: `// First, load the CSS and JS files in your index.html or component
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
      instanceRef.current.init({
        webhookUrl: 'YOUR_WEBHOOK_URL',
        title: 'Chat Support',
        position: 'bottom-right',
        primaryColor: '#3b82f6',
        welcomeMessage: 'Hello! How can I help you today?'
      });
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

  return <div>Your React App Content</div>;
};`,
    vue: `<!-- Vue.js Integration -->
<template>
  <div>
    <!-- Your Vue app content -->
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
        this.chatbotInstance.init({
          webhookUrl: 'YOUR_WEBHOOK_URL',
          title: 'Chat Support',
          position: 'bottom-right',
          primaryColor: '#3b82f6',
          welcomeMessage: 'Hello! How can I help you today?'
        });
      };
      document.body.appendChild(script);
    }
  }
};
</script>`,
    dotnet: `@* Add to your Razor page or layout *@
<link rel="stylesheet" href="https://chirodashboard-chat.onrender.com/chatbot-widget.css" />
<script src="https://chirodashboard-chat.onrender.com/chatbot-widget.js"></script>

<script>
document.addEventListener('DOMContentLoaded', function() {
    if (window.ChatbotWidget) {
        // Create instance using ChatbotManager
        const instance = new window.ChatbotWidget.ChatbotManager();
        instance.init({
            webhookUrl: '@ViewBag.WebhookUrl', // From your controller
            title: 'Chat Support',
            placeholder: 'Type your message...',
            position: 'bottom-right',
            primaryColor: '#3b82f6',
            secondaryColor: '#f3f4f6',
            textColor: '#1f2937',
            userTextColor: '#ffffff',
            chatBackground: '#ffffff',
            welcomeMessage: 'Hello! How can I help you today?',
            logoUrl: '@ViewBag.LogoUrl'
        });
    }
});
</script>

@* In your controller *@
@* 
public IActionResult Index()
{
    ViewBag.WebhookUrl = "YOUR_WEBHOOK_URL";
    ViewBag.LogoUrl = "YOUR_LOGO_URL";
    return View();
}
*@`,
    angular: `// chatbot.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ChatbotService {
  private scriptLoaded = false;
  private cssLoaded = false;
  private chatbotInstance: any = null;

  loadChatbot(config: any): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.cssLoaded) {
        this.loadCSS();
      }
      
      if (!this.scriptLoaded) {
        this.loadScript().then(() => {
          this.initializeChatbot(config);
          resolve();
        }).catch(reject);
      } else {
        this.initializeChatbot(config);
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

  private initializeChatbot(config: any): void {
    if ((window as any).ChatbotWidget) {
      // Create instance using ChatbotManager
      this.chatbotInstance = new (window as any).ChatbotWidget.ChatbotManager();
      this.chatbotInstance.init(config);
    }
  }

  destroy(): void {
    if (this.chatbotInstance) {
      this.chatbotInstance.destroy();
      this.chatbotInstance = null;
    }
  }
}

// app.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ChatbotService } from './chatbot.service';

@Component({
  selector: 'app-root',
  template: \`<div>Your Angular App</div>\`
})
export class AppComponent implements OnInit, OnDestroy {
  constructor(private chatbotService: ChatbotService) {}

  ngOnInit() {
    this.chatbotService.loadChatbot({
      webhookUrl: 'YOUR_WEBHOOK_URL',
      title: 'Chat Support',
      position: 'bottom-right',
      primaryColor: '#3b82f6',
      welcomeMessage: 'Hello! How can I help you today?'
    });
  }

  ngOnDestroy() {
    this.chatbotService.destroy();
  }
}`
  };

  return (
    <section className="py-20 px-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/50 dark:to-pink-900/50 rounded-full mb-6">
            <Code2 className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            <span className="text-purple-700 dark:text-purple-300 font-medium">Easy Integration</span>
          </div>
          <h2 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 text-center">
            Integration Examples
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center">
            Choose your framework and get started in minutes. Our widget works seamlessly with any web technology.
          </p>
        </div>

        <Card className="backdrop-blur-sm bg-white/80 dark:bg-gray-800/80 border-0 shadow-2xl">
          <CardHeader className="pb-6">
            <div className="flex items-center gap-2">
              <Palette className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              <CardTitle className="text-2xl">Framework Integration</CardTitle>
            </div>
            <CardDescription>Easy integration into your website. Both CSS and JavaScript files are automatically minified and optimized.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="html" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-6">
                <TabsTrigger value="html" className="text-sm">HTML</TabsTrigger>
                <TabsTrigger value="react" className="text-sm">React</TabsTrigger>
                <TabsTrigger value="vue" className="text-sm">Vue.js</TabsTrigger>
                <TabsTrigger value="dotnet" className="text-sm">.NET</TabsTrigger>
                <TabsTrigger value="angular" className="text-sm">Angular</TabsTrigger>
              </TabsList>

              {Object.entries(integrationExamples).map(([framework, code]) => (
                <TabsContent key={framework} value={framework} className="mt-4">
                  <div className="relative">
                    <pre className="bg-gray-900 text-green-400 p-6 rounded-lg overflow-x-auto text-sm border">
                      <code>{code}</code>
                    </pre>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="absolute top-4 right-4 bg-gray-800/80 text-white border-gray-600 hover:bg-gray-700" 
                      onClick={() => copyToClipboard(code, framework)}
                    >
                      {copiedTab === framework ? (
                        <>
                          <Check className="w-4 h-4 mr-2 text-green-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy
                        </>
                      )}
                    </Button>
                  </div>
                </TabsContent>
              ))}
            </Tabs>

            <div className="mt-8 p-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">📦 CDN Files Available:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                    https://chirodashboard-chat.onrender.com/chatbot-widget.js
                  </span>
                  <span className="text-blue-700 dark:text-blue-300">- JavaScript bundle</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-mono bg-blue-100 dark:bg-blue-900/50 px-2 py-1 rounded text-blue-800 dark:text-blue-200">
                    https://chirodashboard-chat.onrender.com/chatbot-widget.css
                  </span>
                  <span className="text-blue-700 dark:text-blue-300">- Minified styles</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};
