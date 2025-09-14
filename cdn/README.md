# @luccaallen/chatbot-widget

A customizable chatbot widget for websites. Easy to integrate, works with any backend.

## Installation

```bash
npm install @luccaallen/chatbot-widget
```

## Usage

### Via CDN (Recommended)

```html
<!-- Include CSS -->
<link href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/style.css" rel="stylesheet" />

<!-- Include JavaScript -->
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/chatbot-widget.bundle.es.js';

  createChat({
    webhookUrl: 'YOUR_WEBHOOK_URL',
    title: 'Chat Support',
    welcomeMessage: 'Hello! How can I help you today?'
  });
</script>
```

### Or via script tag

```html
<link href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/style.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/chatbot-widget.bundle.js"></script>
<script>
  ChatbotWidget.init({
    webhookUrl: 'YOUR_WEBHOOK_URL',
    title: 'Chat Support'
  });
</script>
```

### Via npm

```javascript
import '@luccaallen/chatbot-widget/style.css';
import { createChat } from '@luccaallen/chatbot-widget';

createChat({
  webhookUrl: 'YOUR_WEBHOOK_URL',
  title: 'Chat Support'
});
```

## Configuration

See [GitHub Repository](https://github.com/luccaallen1/quick-chat-webflow-bot-44) for full documentation.

## License

MIT
