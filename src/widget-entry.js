// Chatbot Widget Entry Point - Exactly like n8n's structure
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatbotWidget } from './components/ChatbotWidget';

// Main initialization function - exactly like n8n's createChat
export function createChat(config = {}) {
  console.log('🤖 ChatbotWidget initialized successfully!', config);
  console.log('🔧 ChatbotWidget object:', window.ChatbotWidget);
  console.log('✨ New features included: suggestion buttons with icons, line break rendering, toggle button visibility fix');

  const {
    target = 'body',
    webhookUrl = '',
    title = 'Chat Support',
    welcomeMessage = 'Hello! How can I help you today?',
    primaryColor = '#6366f1',
    secondaryColor = '#f1f5f9',
    headerGradientColor = '#5856eb',
    chatBackground = '#ffffff',
    botTextColor = '#374151',
    userTextColor = '#ffffff',
    position = 'bottom-right',
    showWelcomeScreen = true,
    avatarUrl = '',
    welcomeButtons = [],
    logoFile = '',
    logoUrl = '',
    ...restConfig
  } = config;

  // Create widget container
  let container = document.getElementById('n8n-chat');
  if (!container) {
    container = document.createElement('div');
    container.id = 'n8n-chat';
    document.body.appendChild(container);
  }

  // Create React root and render widget
  const root = createRoot(container);

  const widgetConfig = {
    webhookUrl,
    title,
    welcomeMessage,
    primaryColor,
    secondaryColor,
    headerGradientColor,
    chatBackground,
    botTextColor,
    userTextColor,
    position,
    showWelcomeScreen,
    avatarUrl: avatarUrl || logoUrl || logoFile,
    welcomeButtons,
    ...restConfig
  };

  root.render(React.createElement(ChatbotWidget, widgetConfig));

  return {
    mount: () => {
      console.log('Chat widget mounted');
    },
    unmount: () => {
      root.unmount();
      container.remove();
    }
  };
}

// Legacy init function for backward compatibility
export function init(config) {
  return createChat(config);
}

// Global object like n8n - both createChat export and legacy init
if (typeof window !== 'undefined') {
  window.ChatbotWidget = {
    createChat,
    init,
    // Add version info like n8n
    version: '1.0.0'
  };
}