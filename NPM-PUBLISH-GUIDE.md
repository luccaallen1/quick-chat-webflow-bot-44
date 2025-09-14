# Publishing to npm (Exactly like n8n)

This guide shows how to publish your chatbot widget to npm and use it via jsDelivr CDN, exactly like n8n does with their chat widget.

## 🎯 Goal
Transform from:
```
https://cdn.jsdelivr.net/gh/luccaallen1/quick-chat-webflow-bot-44@main/dist/cdn/chatbot-widget.js
```

To (like n8n):
```
https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/chatbot-widget.bundle.es.js
```

## 📋 Prerequisites

1. **npm account**: Create one at [npmjs.com](https://www.npmjs.com/signup)
2. **Verify package name availability**:
   ```bash
   npm view @luccaallen/chatbot-widget
   ```
   If it shows "404 Not Found", the name is available!

## 🚀 Publishing Steps

### 1. First-time Setup
```bash
# Login to npm
npm login

# Enter your npm username, password, and email
```

### 2. Build and Publish
```bash
# Build the npm package
npm run build:npm

# Publish to npm (this runs build:npm automatically)
npm run publish:npm
```

Or manually:
```bash
# Build
npm run build:npm

# Navigate to cdn directory
cd cdn

# Publish
npm publish
```

### 3. Verify Publication
After publishing, your widget will be immediately available at:
- npm: https://www.npmjs.com/package/@luccaallen/chatbot-widget
- jsDelivr: https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/

## 📦 What Gets Published

```
@luccaallen/chatbot-widget/
├── dist/
│   ├── chatbot-widget.js          # UMD build
│   ├── chatbot-widget.es.js       # ES module
│   ├── chatbot-widget.bundle.js   # IIFE bundle for CDN
│   ├── chatbot-widget.bundle.es.js # ES bundle for CDN
│   └── style.css                  # Widget styles
├── package.json
└── README.md
```

## 🌐 Usage After Publishing

### Exactly like n8n - Via CDN

```html
<!-- CSS -->
<link href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/style.css" rel="stylesheet" />

<!-- JavaScript ES Module (recommended) -->
<script type="module">
  import { createChat } from 'https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/chatbot-widget.bundle.es.js';

  createChat({
    webhookUrl: 'YOUR_WEBHOOK_URL',
    title: 'Chat Support'
  });
</script>
```

### Or via Script Tag
```html
<link href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/style.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/chatbot-widget.bundle.js"></script>
<script>
  ChatbotWidget.init({
    webhookUrl: 'YOUR_WEBHOOK_URL'
  });
</script>
```

### Via npm Install
```bash
npm install @luccaallen/chatbot-widget
```

```javascript
import '@luccaallen/chatbot-widget/style.css';
import { createChat } from '@luccaallen/chatbot-widget';

createChat({
  webhookUrl: 'YOUR_WEBHOOK_URL'
});
```

## 🔄 Updating Your Package

### 1. Update Version
Edit `cdn/package.json`:
```json
{
  "version": "1.0.1"  // Increment this
}
```

### 2. Rebuild and Republish
```bash
npm run publish:npm
```

### 3. Clear jsDelivr Cache (Optional)
For immediate updates:
```
https://purge.jsdelivr.net/npm/@luccaallen/chatbot-widget/
```

## 📊 Version Management

Follow semantic versioning:
- **Patch** (1.0.x): Bug fixes
- **Minor** (1.x.0): New features (backward compatible)
- **Major** (x.0.0): Breaking changes

## 🎉 Benefits of npm + jsDelivr

1. **Global CDN**: Automatic distribution to 100+ CDN nodes worldwide
2. **Version Control**: Users can lock to specific versions
3. **npm Registry**: Discoverable by millions of developers
4. **Auto-minification**: jsDelivr automatically minifies your code
5. **HTTPS**: Secure delivery by default
6. **No hosting costs**: Completely free

## 🆚 Comparison

| Method | Your Current | n8n Style (npm) |
|--------|-------------|-----------------|
| Source | GitHub | npm Registry |
| URL Length | Long | Short & Clean |
| Versioning | Git tags | Semantic versions |
| Discovery | GitHub only | npm + jsDelivr |
| Professional | ✓ | ✓✓✓ |

## 🚨 Important Notes

1. **Package Name**: The `@luccaallen/` prefix is your npm scope. You can change it to your npm username.
2. **First Publish**: May take 5-10 minutes to appear on jsDelivr
3. **Updates**: jsDelivr caches for 24 hours (use purge URL for immediate updates)
4. **Private Packages**: This guide assumes public packages (free on npm)

## ❓ Troubleshooting

### "Package name unavailable"
- Change the name in `cdn/package.json`
- Or use a scoped name: `@yourusername/package-name`

### "Not logged in"
```bash
npm whoami  # Check if logged in
npm login   # Login if needed
```

### "Permission denied"
- Make sure you own the npm scope
- For `@luccaallen/`, you need to be logged in as 'luccaallen'

## 🎯 Result

After publishing, your chatbot widget will work **exactly** like n8n's:
- Professional npm package
- Clean CDN URLs via jsDelivr
- Version management
- Global distribution
- Zero hosting costs