import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building ALL CDN Widgets (Chat + Voice) for deployment...');

try {
  // Clean previous build
  const distPath = path.join(__dirname, 'dist');
  if (fs.existsSync(distPath)) {
    fs.rmSync(distPath, { recursive: true, force: true });
  }

  // 1. Build Chat CDN Widget
  console.log('\n📞 Building Chat CDN Widget...');
  execSync('node build-cdn.js', { stdio: 'inherit' });
  
  // 2. Build Voice CDN Widget  
  console.log('\n🎙️ Building Voice CDN Widget...');
  execSync('node build-voice-cdn.js', { stdio: 'inherit' });
  
  // 3. Run regular build for main app
  console.log('\n🏗️ Building main application...');
  execSync('npm run build:app', { stdio: 'inherit' });
  
  // 4. Copy CDN folder to dist for deployment
  const cdnPath = path.join(__dirname, 'cdn');
  const distCdnPath = path.join(distPath, 'cdn');
  
  if (fs.existsSync(cdnPath)) {
    console.log('\n📦 Copying CDN files to dist folder...');
    
    // Create cdn directory in dist
    fs.mkdirSync(distCdnPath, { recursive: true });
    
    // Copy all CDN files
    const cdnFiles = fs.readdirSync(cdnPath);
    cdnFiles.forEach(file => {
      const srcFile = path.join(cdnPath, file);
      const destFile = path.join(distCdnPath, file);
      
      if (fs.statSync(srcFile).isFile()) {
        fs.copyFileSync(srcFile, destFile);
        console.log(`✅ Copied: ${file}`);
      }
    });
    
    console.log('\n🎉 All builds completed successfully!');
    console.log('\n📊 File Summary:');
    
    // Show file sizes
    cdnFiles.forEach(file => {
      const filePath = path.join(distCdnPath, file);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const size = (fs.statSync(filePath).size / 1024).toFixed(2);
        console.log(`   • ${file}: ${size} KB`);
      }
    });
    
    console.log('\n🚀 Ready for deployment!');
    console.log('   • Main app: dist/');
    console.log('   • CDN widgets: dist/cdn/');
    console.log('\n📋 CDN Files included:');
    console.log('   • chatbot-widget.js & chatbot-widget.css (Chat widget)');
    console.log('   • voice-widget.js & voice-widget.css (Voice widget)');
    console.log('   • Example HTML files for testing');
    
  } else {
    console.warn('⚠️ CDN folder not found - skipping CDN copy');
  }
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}