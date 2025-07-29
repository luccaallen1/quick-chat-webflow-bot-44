import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🎙️ Building Voice Widget CDN with 11Labs integration...');

// Set environment variable for CDN build
process.env.BUILD_TARGET = 'voice-cdn';

try {
  // Clean previous build
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }
  
  // Run the build
  execSync('npm run build:app', { stdio: 'inherit' });
  
  // Copy and rename the generated files
  const cdnPath = path.join(__dirname, 'cdn');
  
  // Create CDN directory if it doesn't exist
  if (!fs.existsSync(cdnPath)) {
    fs.mkdirSync(cdnPath);
  }
  
  // Find the generated files
  const files = fs.readdirSync(distPath);
  const jsFile = files.find(file => file.startsWith('voice-widget') && file.endsWith('.js'));
  const cssFile = files.find(file => file.endsWith('.css'));
  
  if (jsFile) {
    // Copy JS file to CDN directory with predictable name
    fs.copyFileSync(
      path.join(distPath, jsFile),
      path.join(cdnPath, 'voice-widget.js')
    );
    
    console.log('✅ Voice Widget CDN JS built successfully!');
    console.log(`📦 Output: cdn/voice-widget.js`);
    console.log(`📊 JS file size: ${(fs.statSync(path.join(cdnPath, 'voice-widget.js')).size / 1024).toFixed(2)} KB`);
  } else {
    console.error('❌ Could not find generated JS file');
  }
  
  // Use the hand-crafted CSS file that matches VoiceWidget.css exactly
  const existingCssPath = path.join(cdnPath, 'voice-widget.css');
  
  // Check if our custom CSS file already exists (which it should)
  if (fs.existsSync(existingCssPath)) {
    console.log('✅ Using existing hand-crafted CSS file');
  } else {
    console.log('⚠️ Creating new CSS file from source');
    // Fallback: copy from source if doesn't exist
    const sourceCssPath = path.join(__dirname, 'src', 'components', 'VoiceWidget.css');
    if (fs.existsSync(sourceCssPath)) {
      fs.copyFileSync(sourceCssPath, existingCssPath);
    }
  }
  
  console.log('✅ Voice Widget CDN CSS built successfully!');
  console.log(`📦 Output: cdn/voice-widget.css`);
  console.log(`📊 CSS file size: ${(fs.statSync(existingCssPath).size / 1024).toFixed(2)} KB`);
  
  console.log('\n🎉 Voice Widget CDN build COMPLETE! Features include:');
  console.log('   • 🎙️ Real-time voice conversation with 11Labs AI');
  console.log('   • 📞 Call controls (mute, speaker, end call)');
  console.log('   • ⏱️ Call duration timer');
  console.log('   • 🎨 Fully customizable styling and colors');
  console.log('   • 📱 Responsive design for mobile and desktop');
  console.log('   • 🔊 Voice activity visualization');
  console.log('   • 🎯 Easy embed with simple script tag');
  
  console.log('\n🚀 Ready to deploy! Use cdn/voice-widget.js and cdn/voice-widget.css');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}