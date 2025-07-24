
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatbotWidget } from './ChatbotWidget';
import './ChatbotWidget.css';

// Global interface for window object
declare global {
  interface Window {
    ChatbotWidget: {
      ChatbotManager: typeof ChatbotManager;
      init: (config: any) => void;
      destroy: () => void;
    };
  }
}

class ChatbotManager {
  private container: HTMLDivElement | null = null;
  private root: any = null;

  init(config: {
    webhookUrl?: string;
    title?: string;
    placeholder?: string;
    position?: 'bottom-right' | 'bottom-left';
    primaryColor?: string;
    secondaryColor?: string;
    chatBackground?: string;
    botTextColor?: string;
    userTextColor?: string;
    headerGradientColor?: string;
    headerMainColor?: string;
    logoUrl?: string;
    welcomeMessage?: string;
    userId?: string;
    clinicName?: string;
    clinicId?: string;
    logoBackgroundColor?: string;
    logoBorderColor?: string;
    fontFamily?: string;
  }) {
    // Clean up existing instance
    this.destroy();

    // Create container
    this.container = document.createElement('div');
    this.container.id = 'chatbot-widget-container';
    this.container.className = 'chatbot-widget-container';
    document.body.appendChild(this.container);

    // Create root and render with all config options
    this.root = createRoot(this.container);
    this.root.render(React.createElement(ChatbotWidget, {
      webhookUrl: config.webhookUrl,
      title: config.title,
      placeholder: config.placeholder,
      position: config.position,
      primaryColor: config.primaryColor,
      secondaryColor: config.secondaryColor,
      chatBackground: config.chatBackground,
      botTextColor: config.botTextColor,
      userTextColor: config.userTextColor,
      headerGradientColor: config.headerGradientColor,
      headerMainColor: config.headerMainColor,
      logoUrl: config.logoUrl,
      welcomeMessage: config.welcomeMessage,
      userId: config.userId,
      clinicName: config.clinicName,
      clinicId: config.clinicId,
      logoBackgroundColor: config.logoBackgroundColor,
      logoBorderColor: config.logoBorderColor,
      fontFamily: config.fontFamily
    }));

    console.log('ChatbotWidget initialized with suggestion buttons and line break support');
  }

  destroy() {
    if (this.root) {
      this.root.unmount();
      this.root = null;
    }
    if (this.container) {
      document.body.removeChild(this.container);
      this.container = null;
    }
  }
}

// Create the manager instance for backward compatibility
const manager = new ChatbotManager();

// Initialize global object immediately
if (typeof globalThis !== 'undefined') {
  globalThis.ChatbotWidget = {
    ChatbotManager: ChatbotManager,
    init: (config) => manager.init(config),
    destroy: () => manager.destroy()
  };
}

// Also set on window for browser environments
if (typeof window !== 'undefined') {
  window.ChatbotWidget = {
    ChatbotManager: ChatbotManager,
    init: (config) => manager.init(config),
    destroy: () => manager.destroy()
  };
  
  console.log('ChatbotWidget methods available:', {
    ChatbotManager: typeof window.ChatbotWidget.ChatbotManager,
    init: typeof window.ChatbotWidget.init,
    destroy: typeof window.ChatbotWidget.destroy
  });
  
  console.log('New features included: suggestion buttons with icons, line break rendering, toggle button visibility fix');
}

export { ChatbotManager };
