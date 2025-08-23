# Deployment Instructions for Netlify

## Quick Deploy to Netlify

### Option 1: Deploy with Git

1. Push this repository to GitHub:
```bash
git add .
git commit -m "Add Netlify deployment configuration"
git push origin main
```

2. Go to [Netlify](https://app.netlify.com)
3. Click "Add new site" → "Import an existing project"
4. Connect your GitHub account and select this repository
5. Use these build settings:
   - **Build command**: `npm run build:cdn`
   - **Publish directory**: `dist`
6. Click "Deploy site"

### Option 2: Deploy without Git (Drag & Drop)

1. Build the project locally:
```bash
npm install
npm run build:cdn
```

2. Go to [Netlify](https://app.netlify.com)
3. Drag the `dist` folder to the deployment area
4. Your site will be live immediately!

## After Deployment

Your site will be available at a URL like:
- `https://amazing-einstein-123456.netlify.app`

You can:
1. **Custom Domain**: Add your own domain in Site settings → Domain management
2. **Rename Site**: Change the subdomain in Site settings → Site information
3. **HTTPS**: Automatically enabled with Let's Encrypt SSL

## Using the CDN Files

Once deployed, your chatbot widget will be available at:
- CSS: `https://your-site.netlify.app/cdn/chatbot-widget.css`
- JS: `https://your-site.netlify.app/cdn/chatbot-widget.js`

### Integration Example

```html
<!-- Add to any website -->
<link rel="stylesheet" href="https://your-site.netlify.app/cdn/chatbot-widget.css">
<script src="https://your-site.netlify.app/cdn/chatbot-widget.js"></script>

<script>
  window.addEventListener('load', function() {
    const instance = new window.ChatbotWidget.ChatbotManager();
    instance.init({
      webhookUrl: 'https://luccatora.app.n8n.cloud/webhook/webbot',
      title: 'Chat Support',
      primaryColor: '#000000',
      clinicId: '104'
    });
  });
</script>
```

## Environment Variables (Optional)

If you need environment variables, add them in:
- Netlify Dashboard → Site settings → Environment variables

## Continuous Deployment

Any push to your main branch will automatically trigger a new deployment.

## Build Cache

Netlify caches dependencies between builds. To clear cache:
- Netlify Dashboard → Deploys → Trigger deploy → Clear cache and deploy site