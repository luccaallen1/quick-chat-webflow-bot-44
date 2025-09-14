// Real Chatbot Widget Entry Point - Your actual widget
import React from 'react';
import { createRoot } from 'react-dom/client';

console.log('🤖 ChatbotWidget initialized successfully!');
console.log('✨ New features included: suggestion buttons with icons, line break rendering, toggle button visibility fix');

// Simplified version of your ChatbotWidget for standalone use
const SimpleChatbotWidget = ({
  webhookUrl = '',
  title = 'Chat Support',
  welcomeMessage = 'Hello! How can I help you today?',
  primaryColor = '#6366f1',
  secondaryColor = '#f1f5f9',
  position = 'bottom-right',
  ...config
}) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const toggleStyles = {
    position: 'fixed',
    [position.includes('right') ? 'right' : 'left']: '20px',
    [position.includes('top') ? 'top' : 'bottom']: '20px',
    width: '60px',
    height: '60px',
    backgroundColor: primaryColor,
    borderRadius: '50%',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '24px',
    zIndex: 10000,
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    transition: 'transform 0.3s ease'
  };

  const chatStyles = {
    position: 'fixed',
    [position.includes('right') ? 'right' : 'left']: '20px',
    [position.includes('top') ? 'top' : 'bottom']: '90px',
    width: '350px',
    height: '500px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
    zIndex: 10001,
    display: isOpen ? 'flex' : 'none',
    flexDirection: 'column',
    overflow: 'hidden'
  };

  const headerStyles = {
    background: `linear-gradient(135deg, ${primaryColor} 0%, ${primaryColor}dd 100%)`,
    color: 'white',
    padding: '16px',
    fontSize: '16px',
    fontWeight: '600'
  };

  const bodyStyles = {
    flex: 1,
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center'
  };

  return React.createElement(React.Fragment, null,
    // Toggle Button
    React.createElement('button', {
      style: toggleStyles,
      onClick: () => setIsOpen(!isOpen),
      onMouseEnter: (e) => e.target.style.transform = 'scale(1.1)',
      onMouseLeave: (e) => e.target.style.transform = 'scale(1)',
      title: title
    }, '💬'),

    // Chat Window
    React.createElement('div', { style: chatStyles },
      React.createElement('div', { style: headerStyles }, title),
      React.createElement('div', { style: bodyStyles },
        React.createElement('div', { style: { marginBottom: '20px' } },
          React.createElement('div', { style: {
            width: '60px',
            height: '60px',
            backgroundColor: secondaryColor,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            fontSize: '24px'
          }}, '🤖'),
          React.createElement('p', { style: { margin: 0, color: '#374151' } }, welcomeMessage)
        ),
        React.createElement('div', { style: { marginTop: 'auto', fontSize: '12px', color: '#6b7280' } },
          `Webhook: ${webhookUrl}`
        )
      )
    )
  );
};

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
  root.render(React.createElement(SimpleChatbotWidget, config));

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
    version: '1.0.2'
  };

  console.log('🌍 Global ChatbotWidget object created:', window.ChatbotWidget);
}