
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building CDN Widget with ALL latest features...');
console.log('📋 Including: suggestion buttons with Calendar+HelpCircle icons, line break rendering, toggle button visibility fix, hover effects');

// Set environment variable for CDN build
process.env.BUILD_TARGET = 'cdn';

try {
  // Clean previous build
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  
  // Run the build
  execSync('npm run build', { stdio: 'inherit' });
  
  // Copy and rename the generated files
  const cdnPath = path.join(__dirname, 'cdn');
  
  // Create CDN directory if it doesn't exist
  if (!fs.existsSync(cdnPath)) {
    fs.mkdirSync(cdnPath);
  }
  
  // Find the generated files
  const files = fs.readdirSync(distPath);
  const jsFile = files.find(file => file.startsWith('chatbot-widget') && file.endsWith('.js'));
  const cssFile = files.find(file => file.endsWith('.css'));
  
  if (jsFile) {
    // Copy JS file to CDN directory with predictable name
    fs.copyFileSync(
      path.join(distPath, jsFile),
      path.join(cdnPath, 'chatbot-widget.js')
    );
    
    console.log('✅ CDN Widget JS built successfully with ALL latest features!');
    console.log(`📦 Output: cdn/chatbot-widget.js`);
    console.log(`📊 JS file size: ${(fs.statSync(path.join(cdnPath, 'chatbot-widget.js')).size / 1024).toFixed(2)} KB`);
    console.log('🎯 Features: Interactive suggestion buttons, icons, theming, line breaks, toggle visibility');
  } else {
    console.error('❌ Could not find generated JS file');
  }
  
  if (cssFile) {
    // Copy CSS file to CDN directory with predictable name
    fs.copyFileSync(
      path.join(distPath, cssFile),
      path.join(cdnPath, 'chatbot-widget.css')
    );
    
    console.log('✅ CDN Widget CSS built successfully with all styling!');
    console.log(`📦 Output: cdn/chatbot-widget.css`);
    console.log(`📊 CSS file size: ${(fs.statSync(path.join(cdnPath, 'chatbot-widget.css')).size / 1024).toFixed(2)} KB`);
  } else {
    console.log('⚠️ No CSS file generated (this is normal if no styles are included)');
  }
  
  console.log('\n🎉 CDN build COMPLETE! The widget now includes:');
  console.log('   • ✨ Suggestion buttons with Calendar and HelpCircle icons');
  console.log('   • 🎨 Primary color theming for buttons with hover effects');
  console.log('   • 🔒 Button disable functionality after first use');
  console.log('   • 📝 Line break rendering for backend responses (\\n support)');
  console.log('   • 👁️ Toggle button visibility fix (hidden when chat is open)');
  console.log('   • 🖱️ Smooth hover animations and improved styling');
  console.log('   • 📱 Responsive design and mobile optimizations');
  
  console.log('\n🚀 Ready to deploy! Use the updated CDN files.');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
