import React, { useEffect, useState } from 'react';
import { ChatbotWidget } from '../components/ChatbotWidget';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { HeroSection } from '../components/landing/HeroSection';
import { UseCasesSection } from '../components/landing/UseCasesSection';
import { WhatWeDoSection } from '../components/landing/WhatWeDoSection';
import { SecuritySection } from '../components/landing/SecuritySection';
import { FAQSection } from '../components/landing/FAQSection';

const Demo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    document.title = 'Chat Widget Demo - ToraTech AI';
  }, []);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const handleViewExample = () => {
    window.open('https://chirodashboard-chat.onrender.com/cdn-example.html', '_blank');
  };

  return (
    <div className={`min-h-screen transition-all duration-500 ${isDarkMode 
      ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900' 
      : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
    }`}>
      {/* Dark Mode Toggle */}
      <div className="fixed top-6 right-6 z-50">
        <Button
          variant="outline"
          size="icon"
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="relative overflow-hidden transition-all duration-300 hover:scale-110 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
        >
          <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? 'translate-y-0' : 'translate-y-full'}`}>
            <Moon className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
          <div className={`absolute inset-0 transition-transform duration-500 ${isDarkMode ? '-translate-y-full' : 'translate-y-0'}`}>
            <Sun className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </div>
        </Button>
      </div>

      {/* Hero Section */}
      <HeroSection onViewExample={handleViewExample} />

      {/* Use Cases Section */}
      <UseCasesSection />

      {/* What We Do Section */}
      <WhatWeDoSection />

      {/* Security Section */}
      <SecuritySection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Chatbot Widget */}
      <ChatbotWidget
        webhookUrl="https://luccatora.app.n8n.cloud/webhook/webbot"
        title="Chat Support"
        bio="Online now"
        placeholder="Type your message..."
        position="bottom-right"
        primaryColor="#000000"
        secondaryColor="#f3f4f6"
        botTextColor="#1f2937"
        userTextColor="#ffffff"
        chatBackground="#ffffff"
        welcomeMessage="Hey, this is Jack, the Virtual Assistant from ToraTech AI. How can I help you today?"
        admin={false}
        isVoiceEnabled={false}
        isElevenLabsEnabled={true}
        elevenLabsAgentId="agent_01k04zwwq3fv5acgzdwmbvfk8k"
        headerGradientColor="#000000"
        headerMainColor="#262626"
        logoBackgroundColor="transparent"
        logoBorderColor="none"
        headerButtonColor="#ffffff"
        fontFamily="Inter"
        welcomeTooltipMessage="Click to start chatting with our AI assistant!"
        logoUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
        avatarUrl="/lovable-uploads/0bece050-e33f-47c2-aeba-0088a17e5b93.png"
      />
    </div>
  );
};

export default Demo;