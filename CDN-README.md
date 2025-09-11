# 🤖 Chatbot Widget CDN

Deploy your chatbot widget to any website using jsDelivr and GitHub Pages.

## 🚀 Quick Setup

### 1. Fork & Deploy

1. **Fork this repository** to your GitHub account
2. **Enable GitHub Pages** in repository settings:
   - Go to Settings → Pages
   - Source: GitHub Actions
   - The workflow will automatically deploy your CDN

### 2. Use Your CDN URLs

Replace `[USERNAME]` with your GitHub username:

**CSS:** `https://cdn.jsdelivr.net/gh/[USERNAME]/quick-chat-webflow-bot-44@main/dist/cdn/chatbot-widget.css`

**JS:** `https://cdn.jsdelivr.net/gh/[USERNAME]/quick-chat-webflow-bot-44@main/dist/cdn/chatbot-widget.js`

### 3. Add to Any Website

```html
<!-- Include CSS -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/[USERNAME]/quick-chat-webflow-bot-44@main/dist/cdn/chatbot-widget.css">

<!-- Include JavaScript -->
<script src="https://cdn.jsdelivr.net/gh/[USERNAME]/quick-chat-webflow-bot-44@main/dist/cdn/chatbot-widget.js"></script>

<!-- Initialize Widget -->
<script>
ChatbotWidget.init({
    webhookUrl: 'https://your-webhook-url.com',
    title: 'Chat with us',
    welcomeMessage: 'Hello! How can I help you today?',
    primaryColor: '#6366f1',
    secondaryColor: '#f1f5f9',
    showWelcomeScreen: true,
    welcomeButtons: [
        { id: '1', text: 'Get Help', message: 'I need help' },
        { id: '2', text: 'Book Now', message: 'I want to book something' }
    ]
});
</script>
```

## ✨ Features

- 🎨 **Fully Customizable** - Colors, text, logos, positioning
- 📱 **Mobile Responsive** - Works on all devices
- 🚀 **Easy Integration** - Just add two lines of code
- 💬 **Welcome Screen** - Interactive buttons and branding
- 🔌 **Webhook Ready** - Connect to any backend/AI service
- 🎯 **Smart Suggestions** - Built-in action buttons

## 📋 Configuration Options

```javascript
ChatbotWidget.init({
    // Required
    webhookUrl: 'string',              // Your chat API endpoint
    
    // Basic Settings
    title: 'string',                   // Widget title
    welcomeMessage: 'string',          // Initial bot message
    
    // Welcome Screen
    showWelcomeScreen: true,           // Enable welcome screen
    avatarUrl: 'string',              // Logo/avatar image
    welcomeButtons: [                  // Custom welcome buttons
        { id: '1', text: 'Help', message: 'I need help' }
    ],
    
    // Styling
    position: 'bottom-right',          // Position on page
    primaryColor: '#6366f1',          // Primary brand color
    secondaryColor: '#f1f5f9',        // Secondary color
    headerGradientColor: '#5856eb',    // Header gradient
    chatBackground: '#ffffff',         // Chat background
    botTextColor: '#374151',          // Bot text color
    userTextColor: '#ffffff'          // User text color
});
```

## 🔄 Updating Your CDN

1. **Make changes** to the chatbot widget code
2. **Build the CDN** with `npm run build:cdn`
3. **Commit and push** to your repository
4. **GitHub Actions** will automatically deploy to Pages
5. **jsDelivr CDN** updates within 24 hours (or use purge cache)

## 🌐 Access Your Documentation

After deployment, your interactive documentation will be available at:
`https://[USERNAME].github.io/quick-chat-webflow-bot-44/`

## 💡 Tips

- **Cache Busting**: Add version tags to URLs for instant updates
- **Custom Domain**: Use GitHub Pages custom domain for branded URLs  
- **Analytics**: Add tracking to monitor widget usage
- **Testing**: Use the documentation page to test configurations

## 🛠️ Development

```bash
# Install dependencies
npm install

# Build CDN files
npm run build:cdn

# Run development server
npm run dev
```

## 📞 Support

Need help? Create an issue in this repository or contact support.