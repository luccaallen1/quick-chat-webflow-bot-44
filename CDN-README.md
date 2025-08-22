
# Chatbot Widget CDN

This project can be built and deployed as a CDN widget that can be embedded into any website.

## Building the CDN Widget

### Prerequisites
- Node.js and npm/yarn/bun installed
- All project dependencies installed (`npm install`)

### Build Commands

```bash
# Build the CDN widget
node build-cdn.js

# Or manually with environment variable
BUILD_TARGET=cdn npm run build
```

This will generate:
- `cdn/chatbot-widget.js` - The standalone widget file ready for CDN deployment
- `cdn/chatbot-widget.css` - The minified CSS styles for the widget

### File Structure After Build
```
cdn/
├── chatbot-widget.js     # Standalone widget (minified)
└── chatbot-widget.css    # Widget styles (minified)
cdn-example.html          # Usage example
```

## CDN Deployment

### 1. Upload to CDN
Upload both files to your CDN provider:
- `cdn/chatbot-widget.js`
- `cdn/chatbot-widget.css`

### 2. Set CORS Headers
Ensure your CDN serves the files with proper CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET
```

### 3. Enable Compression
Enable gzip/brotli compression for JavaScript and CSS files to reduce file size.

## Webhook Integration

Your webhook endpoint should:

1. **Accept POST requests** with this payload:
```json
{
  "message": "User's message",
  "userId": "unique-user-id",
  "source": "WEB",
  "source2": "TEXT",
  "link_id": "None",
  "clinicName": "Your Site",
  "clinicId": "104"
}
```

2. **Return JSON response** in this format:
```json
[{
  "output": "Bot's response message"
}]
```

## Integration Guide

### Basic Integration
Add the CSS and JS files to your website, then create an instance:

```html
<!-- Load the CSS -->
<link rel="stylesheet" href="https://your-cdn.com/chatbot-widget.css">

<!-- Load the JavaScript -->
<script src="https://your-cdn.com/chatbot-widget.js"></script>

<!-- Initialize the widget using ChatbotManager -->
<script>
  const instance = new window.ChatbotWidget.ChatbotManager();
  instance.init({
    webhookUrl: 'https://your-api.com/webhook',
    title: 'Customer Support',
    placeholder: 'How can we help you?',
    position: 'bottom-right',
    primaryColor: '#3b82f6',
    welcomeMessage: 'Welcome! How can I assist you today?'
  });
</script>
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `webhookUrl` | string | '' | Your webhook endpoint URL |
| `title` | string | 'Chat Support' | Widget title |
| `placeholder` | string | 'Type your message...' | Input placeholder |
| `position` | string | 'bottom-right' | 'bottom-right' or 'bottom-left' |
| `primaryColor` | string | '#3b82f6' | Widget theme color |
| `logoUrl` | string | '' | Custom logo URL (optional) |
| `welcomeMessage` | string | 'Hello! How can I help you today?' | Initial bot message |

### Advanced Usage

#### Multiple Widgets
```javascript
// Initialize multiple widgets with different configs
const supportInstance = new window.ChatbotWidget.ChatbotManager();
supportInstance.init({
  webhookUrl: 'https://support-api.com/webhook',
  title: 'Technical Support',
  position: 'bottom-left',
  welcomeMessage: 'Hello! I\'m here to help with technical questions.'
});

const salesInstance = new window.ChatbotWidget.ChatbotManager();
salesInstance.init({
  webhookUrl: 'https://sales-api.com/webhook',
  title: 'Sales Chat',
  position: 'bottom-right',
  welcomeMessage: 'Hi! Interested in our products?'
});
```

#### Destroy Widget
```javascript
// Remove the widget
instance.destroy();
```

#### Conditional Loading
```javascript
// Load widget only on specific pages
if (window.location.pathname === '/contact') {
  const instance = new window.ChatbotWidget.ChatbotManager();
  instance.init({
    // config
  });
}
```

## Testing

1. Build the widget: `node build-cdn.js`
2. Open `cdn-example.html` in a browser
3. The widget should appear and be functional (without webhook responses)

## Production Checklist

- [ ] Built widget with `node build-cdn.js`
- [ ] Uploaded both `chatbot-widget.js` and `chatbot-widget.css` to CDN
- [ ] Set up proper CORS headers
- [ ] Enabled compression (gzip/brotli)
- [ ] Configured webhook endpoint
- [ ] Tested on target website
- [ ] Set up monitoring/analytics if needed

## File Sizes

The built widget includes:
- React runtime
- All UI components
- Styling (Tailwind CSS)
- Icons (Lucide React)

Typical sizes:
- JavaScript: ~150-300KB (minified + gzipped)
- CSS: ~10-20KB (minified + gzipped)

## Browser Support

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Troubleshooting

### Widget not appearing
- Check browser console for errors
- Verify both CSS and JS files load correctly
- Ensure CORS headers are set

### Webhook not working
- Test webhook endpoint directly
- Check network tab for failed requests
- Verify JSON response format

### Styling issues
- Ensure CSS file is loaded before JS
- Widget uses isolated styles
- Check for CSS conflicts
- Verify primaryColor format (#hex)
