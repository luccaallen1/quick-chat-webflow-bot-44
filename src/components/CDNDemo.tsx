
import React, { useState, useEffect } from 'react';
import { ChatbotWidget } from './ChatbotWidget';
import { Button } from '@/components/ui/button';
import { Moon, Sun } from 'lucide-react';
import { HeroSection } from './landing/HeroSection';
import { UseCasesSection } from './landing/UseCasesSection';
import { WhatWeDoSection } from './landing/WhatWeDoSection';
import { SecuritySection } from './landing/SecuritySection';
import { IntegrationSection } from './landing/IntegrationSection';
import { ConfigurationSection } from './landing/ConfigurationSection';
import { FAQSection } from './landing/FAQSection';

export const CDNDemo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://luccatora.app.n8n.cloud/webhook/webbot');
  const [title, setTitle] = useState('Chat Support');
  const [placeholder, setPlaceholder] = useState('Type your message...');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [primaryColor, setPrimaryColor] = useState('#3b82f6');
  const [secondaryColor, setSecondaryColor] = useState('#f3f4f6');
  const [botTextColor, setBotTextColor] = useState('#1f2937');
  const [userTextColor, setUserTextColor] = useState('#ffffff');
  const [chatBackground, setChatBackground] = useState('#ffffff');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [welcomeMessage, setWelcomeMessage] = useState('Hey, this is Jack, the Virtual Assistant from ToraTech AI. How can I help you today?');
  const [admin, setAdmin] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isElevenLabsEnabled, setIsElevenLabsEnabled] = useState(false);
  const [elevenLabsAgentId, setElevenLabsAgentId] = useState('agent_01k04zwwq3fv5acgzdwmbvfk8k');
  const [gradientColor, setGradientColor] = useState('rgba(59, 130, 246, 0.9)');
  const [headerGradientColor, setHeaderGradientColor] = useState('#667eea');
  const [headerMainColor, setHeaderMainColor] = useState('#3b82f6');
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('transparent');

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply custom CSS variables for the chatbot widget colors
  useEffect(() => {
    const style = document.createElement('style');
    style.id = 'chatbot-custom-colors';
    style.textContent = `
      .chatbot-widget-container {
        --chatbot-primary: ${primaryColor} !important;
        --chatbot-secondary: ${secondaryColor} !important;
        --chatbot-bot-text: ${botTextColor} !important;
        --chatbot-user-text: ${userTextColor} !important;
        --chatbot-background: ${chatBackground} !important;
        --chatbot-gradient: ${gradientColor} !important;
      }
    `;
    
    // Remove existing style if it exists
    const existingStyle = document.getElementById('chatbot-custom-colors');
    if (existingStyle) {
      existingStyle.remove();
    }
    
    // Add new style
    document.head.appendChild(style);
    
    // Cleanup function
    return () => {
      const styleToRemove = document.getElementById('chatbot-custom-colors');
      if (styleToRemove) {
        styleToRemove.remove();
      }
    };
  }, [primaryColor, secondaryColor, botTextColor, userTextColor, chatBackground, gradientColor]);

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

      {/* Integration Section */}
      <IntegrationSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Configuration Section */}
      <ConfigurationSection
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        title={title}
        setTitle={setTitle}
        placeholder={placeholder}
        setPlaceholder={setPlaceholder}
        position={position}
        setPosition={setPosition}
        primaryColor={primaryColor}
        setPrimaryColor={setPrimaryColor}
        secondaryColor={secondaryColor}
        setSecondaryColor={setSecondaryColor}
        textColor={botTextColor}
        setTextColor={setBotTextColor}
        userTextColor={userTextColor}
        setUserTextColor={setUserTextColor}
        chatBackground={chatBackground}
        setChatBackground={setChatBackground}
        logoFile={logoFile}
        setLogoFile={setLogoFile}
        welcomeMessage={welcomeMessage}
        setWelcomeMessage={setWelcomeMessage}
        admin={admin}
        setAdmin={setAdmin}
        isVoiceEnabled={isVoiceEnabled}
        setIsVoiceEnabled={setIsVoiceEnabled}
        isElevenLabsEnabled={isElevenLabsEnabled}
        setIsElevenLabsEnabled={setIsElevenLabsEnabled}
        elevenLabsAgentId={elevenLabsAgentId}
        setElevenLabsAgentId={setElevenLabsAgentId}
        gradientColor={gradientColor}
        setGradientColor={setGradientColor}
        headerGradientColor={headerGradientColor}
        setHeaderGradientColor={setHeaderGradientColor}
        headerMainColor={headerMainColor}
        setHeaderMainColor={setHeaderMainColor}
        logoBackgroundColor={logoBackgroundColor}
        setLogoBackgroundColor={setLogoBackgroundColor}
      />

      {/* The actual chatbot widget */}
      <ChatbotWidget
        webhookUrl={webhookUrl}
        title={title}
        placeholder={placeholder}
        position={position}
        primaryColor={primaryColor}
        secondaryColor={secondaryColor}
        botTextColor={botTextColor}
        userTextColor={userTextColor}
        chatBackground={chatBackground}
        headerGradientColor={headerGradientColor}
        headerMainColor={headerMainColor}
        logoBackgroundColor={logoBackgroundColor}
        logoFile={logoFile}
        welcomeMessage={welcomeMessage}
        admin={admin}
        isVoiceEnabled={isVoiceEnabled}
        elevenLabsAgentId={elevenLabsAgentId}
      />
    </div>
  );
};
