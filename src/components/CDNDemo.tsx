
import React, { useState, useEffect } from 'react';

interface WelcomeButton {
  id: string;
  text: string;
  message: string;
  icon?: string;
}
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
import { RevenueCalculatorSection } from './landing/RevenueCalculatorSection';
// VoiceAgentSection removed - now using Deepgram Voice Agent

export const CDNDemo = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('https://luccatora.app.n8n.cloud/webhook/lapop');
  const [title, setTitle] = useState('Chat Support');
  const [bio, setBio] = useState('Online now');
  const [placeholder, setPlaceholder] = useState('Type your message...');
  const [position, setPosition] = useState<'bottom-right' | 'bottom-left'>('bottom-right');
  const [primaryColor, setPrimaryColor] = useState('#141E29');
  const [secondaryColor, setSecondaryColor] = useState('#f3f4f6');
  const [botTextColor, setBotTextColor] = useState('#1f2937');
  const [userTextColor, setUserTextColor] = useState('#ffffff');
  const [chatBackground, setChatBackground] = useState('#ffffff');
  const [logoUrl, setLogoUrl] = useState('https://i.postimg.cc/59ZVMY4J/lapop-image.webp');
  const [avatarUrl, setAvatarUrl] = useState('https://i.postimg.cc/vHWpF027/Heading.webp');
  const [welcomeMessage, setWelcomeMessage] = useState('Hey, this is Vicky, the Virtual Assistant for La Pop. How can I help you today?');
  const [admin, setAdmin] = useState(false);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);
  const [isElevenLabsEnabled, setIsElevenLabsEnabled] = useState(false);
  const [elevenLabsAgentId, setElevenLabsAgentId] = useState('agent_01k04zwwq3fv5acgzdwmbvfk8k');
  const [gradientColor, setGradientColor] = useState('rgba(59, 130, 246, 0.9)');
  const [headerGradientColor, setHeaderGradientColor] = useState('#141E29');
  const [headerMainColor, setHeaderMainColor] = useState('#303f50');
  const [logoBackgroundColor, setLogoBackgroundColor] = useState('transparent');
  const [logoBorderColor, setLogoBorderColor] = useState('none');
  const [headerButtonColor, setHeaderButtonColor] = useState('#ffffff');
  const [fontFamily, setFontFamily] = useState('Inter');
  const [copySuccessMessage, setCopySuccessMessage] = useState('Code Copied!');
  const [disclaimerText, setDisclaimerText] = useState('AI chatbot - I do my best, I can answer any questions and make bookings, but always verify important details with a human.');
  const [companyName, setCompanyName] = useState('La Pop');
  const [agentName, setAgentName] = useState('Vicky');
  const [bubbleText, setBubbleText] = useState('Hey, this is Vicky, the Virtual Assistant for La Pop. How can I help you today?');
  
  // Welcome buttons configuration
  const [welcomeButtons, setWelcomeButtons] = useState([
    { id: '1', text: 'Book Appointment', message: 'I would like to book an appointment', icon: '📅' },
    { id: '2', text: 'Get Pricing Info', message: 'Can you tell me about your pricing?', icon: '💰' },
    { id: '3', text: 'Ask Questions', message: 'I have questions about your services', icon: '❓' },
    { id: '4', text: 'Location & Hours', message: 'What are your hours and location?', icon: '📍' }
  ]);

  // Apply dark mode to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Apply custom CSS variables for the chatbot widget colors and font
  useEffect(() => {
    console.log('Updating font family to:', fontFamily);
    const borderStyle = logoBorderColor === 'none' ? 'none' : `1px solid ${logoBorderColor}`;
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
        --chatbot-font-family: '${fontFamily}', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif !important;
        --chatbot-logo-background: ${logoBackgroundColor} !important;
        --chatbot-logo-border: ${borderStyle} !important;
        --chatbot-header-button-color: ${headerButtonColor} !important;
      }
      
      .chatbot-widget-container *,
      .chatbot-widget-container input,
      .chatbot-widget-container textarea,
      .chatbot-widget-container button {
        font-family: var(--chatbot-font-family) !important;
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
  }, [primaryColor, secondaryColor, botTextColor, userTextColor, chatBackground, gradientColor, fontFamily, logoBackgroundColor, logoBorderColor, headerButtonColor]);

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

      {/* Voice Agent Section */}
      {/* Voice agent section moved to dedicated page */}

      {/* Configuration Section */}
      <ConfigurationSection
        webhookUrl={webhookUrl}
        setWebhookUrl={setWebhookUrl}
        title={title}
        setTitle={setTitle}
        bio={bio}
        setBio={setBio}
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
        logoUrl={logoUrl}
        setLogoUrl={setLogoUrl}
        avatarUrl={avatarUrl}
        setAvatarUrl={setAvatarUrl}
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
        logoBorderColor={logoBorderColor}
        setLogoBorderColor={setLogoBorderColor}
        headerButtonColor={headerButtonColor}
        setHeaderButtonColor={setHeaderButtonColor}
        fontFamily={fontFamily}
        setFontFamily={setFontFamily}
        copySuccessMessage={copySuccessMessage}
        setCopySuccessMessage={setCopySuccessMessage}
        welcomeButtons={welcomeButtons}
        setWelcomeButtons={setWelcomeButtons}
        disclaimerText={disclaimerText}
        setDisclaimerText={setDisclaimerText}
        bubbleText={bubbleText}
        setBubbleText={setBubbleText}
      />

      {/* The actual chatbot widget */}
      <ChatbotWidget
        webhookUrl={webhookUrl}
        title={title}
        bio={bio}
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
        logoBorderColor={logoBorderColor}
        headerButtonColor={headerButtonColor}
        fontFamily={fontFamily}
        logoUrl={logoUrl}
        avatarUrl={avatarUrl}
        welcomeMessage={welcomeMessage}
        welcomeButtons={welcomeButtons}
        admin={admin}
        isVoiceEnabled={isVoiceEnabled}
        isElevenLabsEnabled={isElevenLabsEnabled}
        elevenLabsAgentId={elevenLabsAgentId}
        disclaimerText={disclaimerText}
        companyName={companyName}
        agentName={agentName}
        bubbleMessage={bubbleText}
      />
    </div>
  );
};
