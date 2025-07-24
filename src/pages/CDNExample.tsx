
import React from 'react';

const CDNExample = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">CDN Widget Integration Example</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Live CDN Widget Demo</h2>
          <p className="text-gray-600 mb-4">
            This page demonstrates the CDN widget running with the configuration shown below. 
            The widget should appear in the bottom-right corner.
          </p>
          
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Current Configuration:</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• CDN URL: https://chirodashboard-chat.onrender.com/chatbot-widget.js</li>
              <li>• Webhook URL: https://luccatora.app.n8n.cloud/webhook/webbot</li>
              <li>• Title: Chat Support</li>
              <li>• Position: Bottom Right</li>
              <li>• Primary Color: #3b82f6</li>
              <li>• Welcome Message: Hello! How can I help you today?</li>
              <li>• Custom Logo: Enabled</li>
            </ul>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Integration Code</h2>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`<!-- Add this to your website's <head> section -->
<link rel="stylesheet" href="https://chirodashboard-chat.onrender.com/chatbot-widget.css">
<script src="https://chirodashboard-chat.onrender.com/chatbot-widget.js"></script>

<!-- Initialize the widget using ChatbotManager -->
<script>
  const instance = new window.ChatbotWidget.ChatbotManager();
  instance.init({
    webhookUrl: 'https://luccatora.app.n8n.cloud/webhook/webbot',
    title: 'Chat Support',
    placeholder: 'Type your message...',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    secondaryColor: '#f3f4f6',
    textColor: '#1f2937',
    userTextColor: '#ffffff',
    chatBackground: '#ffffff',
    welcomeMessage: 'Hello! How can I help you today?',
    logoUrl: 'https://conversion-metrics-view.lovable.app/lovable-uploads/460f8654-9a04-4cac-a568-cd5421a2911e.png'
  });
</script>`}
          </pre>
        </div>

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Look for the chat widget in the bottom-right corner to test the integration!
          </p>
          <a 
            href="/cdn-example.html" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-block mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Standalone CDN Example
          </a>
        </div>
      </div>
    </div>
  );
};

export default CDNExample;
