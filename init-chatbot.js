// Script to safely initialize the chatbot widget
function initChatbot(config) {
  // Check if ChatbotWidget exists in the global scope
  if (typeof window.ChatbotWidget === 'undefined') {
    console.error('ChatbotWidget is not loaded. Make sure the chatbot-widget.js script is included before calling this function.');
    return false;
  }

  // Check if ChatbotManager class exists
  if (typeof window.ChatbotWidget.ChatbotManager !== 'function') {
    console.error('ChatbotWidget.ChatbotManager is not a constructor. The ChatbotWidget may not have initialized properly.');
    return false;
  }

  try {
    // Create a new instance of the ChatbotManager
    const chatbotInstance = new window.ChatbotWidget.ChatbotManager();
    
    // Initialize the chatbot with the provided configuration
    chatbotInstance.init(config);
    console.log('ChatbotWidget initialized successfully');
    return chatbotInstance;
  } catch (error) {
    console.error('Error initializing ChatbotWidget:', error);
    return false;
  }
}

// Example usage:
// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
  // Add a small delay to ensure the chatbot script is fully loaded
  setTimeout(function() {
    initChatbot({
      webhookUrl: 'YOUR_WEBHOOK_URL',
      title: 'Chat with us',
      placeholder: 'Type your message here...',
      position: 'right', // 'right' or 'left'
      primaryColor: '#4F46E5',
      secondaryColor: '#FFFFFF',
      // Add any other required configuration parameters
    });
  }, 500);
}); 