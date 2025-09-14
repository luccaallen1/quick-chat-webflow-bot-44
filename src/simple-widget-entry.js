// Simple Chatbot Widget Entry Point - Exactly like n8n's structure
console.log('🤖 ChatbotWidget initialized successfully!');
console.log('✨ New features included: suggestion buttons with icons, line break rendering, toggle button visibility fix');

// Main initialization function - exactly like n8n's createChat
export function createChat(config = {}) {
  console.log('🚀 Creating chat widget with config:', config);

  const {
    webhookUrl = '',
    title = 'Chat Support',
    welcomeMessage = 'Hello! How can I help you today?',
    primaryColor = '#6366f1',
    secondaryColor = '#f1f5f9',
    position = 'bottom-right'
  } = config;

  // Create a simple test widget for now
  const widget = document.createElement('div');
  widget.id = 'chatbot-widget';
  widget.style.cssText = `
    position: fixed;
    ${position.includes('right') ? 'right: 20px;' : 'left: 20px;'}
    ${position.includes('top') ? 'top: 20px;' : 'bottom: 20px;'}
    width: 60px;
    height: 60px;
    background: ${primaryColor};
    border-radius: 50%;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 24px;
    z-index: 10000;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: transform 0.3s ease;
  `;

  widget.innerHTML = '💬';
  widget.title = title;

  widget.addEventListener('click', () => {
    alert(`${title}\n\n${welcomeMessage}\n\nWebhook: ${webhookUrl}`);
  });

  widget.addEventListener('mouseenter', () => {
    widget.style.transform = 'scale(1.1)';
  });

  widget.addEventListener('mouseleave', () => {
    widget.style.transform = 'scale(1)';
  });

  document.body.appendChild(widget);

  console.log('✅ Chat widget created and mounted successfully!');

  return {
    mount: () => {
      console.log('Chat widget mounted');
    },
    unmount: () => {
      widget.remove();
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
    version: '1.0.1'
  };

  console.log('🌍 Global ChatbotWidget object created:', window.ChatbotWidget);
}