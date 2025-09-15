// Clean Chatbot Widget Entry Point - Uses existing clean widget
import React from 'react';
import { createRoot } from 'react-dom/client';
import { ChatbotWidget } from './components/ChatbotWidget';
import './components/ChatbotWidget.css';

console.log('🤖 ChatbotWidget initialized successfully!');
console.log('✨ Features: Same beautiful styling, simplified code, webhook integration');

// Main initialization function - exactly like n8n's createChat
export function createChat(config = {}) {
  console.log('🚀 Creating chat widget with config:', config);

  // Create widget container
  let container = document.getElementById('chatbot-widget-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'chatbot-widget-container';
    document.body.appendChild(container);
  }

  // Create React root and render widget
  const root = createRoot(container);
  root.render(React.createElement(ChatbotWidget, config));

  console.log('✅ Chat widget created and mounted successfully!');

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
    version: '1.0.8'
  };

  console.log('🌍 Global ChatbotWidget object created:', window.ChatbotWidget);
}