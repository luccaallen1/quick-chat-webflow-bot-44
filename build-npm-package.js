import { build } from 'vite';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function buildNpmPackage() {
  console.log('🚀 Building npm package for @luccaallen/chatbot-widget...');
  console.log('📋 Creating standalone widget exactly like n8n...');

  // Clean the cdn/dist directory
  const distPath = path.resolve(__dirname, 'cdn/dist');
  await fs.emptyDir(distPath);

  // Build using widget-specific Vite config
  console.log('📦 Building widget with Vite...');
  await build({
    configFile: path.resolve(__dirname, 'vite.config.widget.js')
  });

  // Create a README for the npm package
  const readmeContent = `# @luccaallen/chatbot-widget

A customizable chatbot widget for websites. Easy to integrate, works with any backend.

## Installation

\`\`\`bash
npm install @luccaallen/chatbot-widget
\`\`\`

## Usage

### Via CDN (Recommended)

\`\`\`html
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
\`\`\`

### Or via script tag

\`\`\`html
<link href="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/style.css" rel="stylesheet" />
<script src="https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/dist/chatbot-widget.bundle.js"></script>
<script>
  ChatbotWidget.init({
    webhookUrl: 'YOUR_WEBHOOK_URL',
    title: 'Chat Support'
  });
</script>
\`\`\`

### Via npm

\`\`\`javascript
import '@luccaallen/chatbot-widget/style.css';
import { createChat } from '@luccaallen/chatbot-widget';

createChat({
  webhookUrl: 'YOUR_WEBHOOK_URL',
  title: 'Chat Support'
});
\`\`\`

## Configuration

See [GitHub Repository](https://github.com/luccaallen1/quick-chat-webflow-bot-44) for full documentation.

## License

MIT
`;

  await fs.writeFile(path.join(__dirname, 'cdn/README.md'), readmeContent);

  console.log('✅ npm package built successfully!');
  console.log('📁 Output directory: cdn/dist/');
  console.log('\n📤 To publish to npm:');
  console.log('   1. cd cdn');
  console.log('   2. npm login (if not already logged in)');
  console.log('   3. npm publish');
  console.log('\n🌐 After publishing, your widget will be available at:');
  console.log('   https://cdn.jsdelivr.net/npm/@luccaallen/chatbot-widget/');
}

buildNpmPackage().catch(console.error);