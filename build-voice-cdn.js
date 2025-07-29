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
  
  // Copy custom CSS file (preserve our hand-written CSS with !important)
  const customCssPath = path.join(__dirname, 'src', 'components', 'VoiceWidget.css');
  const cdnCssPath = path.join(cdnPath, 'voice-widget.css');
  
  // Read our custom CSS file
  const customCss = fs.readFileSync(customCssPath, 'utf8');
  
  // Write all necessary styles with !important declarations
  const finalCss = `/* Voice Widget CDN Styles */
@keyframes voice-bar {
  0%, to { height: 8px; transform: scaleY(.5); }
  50% { height: 16px; transform: scaleY(1); }
}

.animate-voice-bar {
  animation: voice-bar .6s ease-in-out infinite;
  transform-origin: bottom;
}

/* Container styles to prevent overflow */
.voice-widget-container {
  width: 100% !important;
  max-width: 100% !important;
  overflow-x: hidden !important;
  box-sizing: border-box !important;
}

.voice-widget {
  transition: background .3s ease;
  width: 100% !important;
  max-width: 100% !important;
  box-sizing: border-box !important;
  overflow-x: hidden !important;
}

.voice-widget.in-call {
  animation: subtle-pulse 3s ease-in-out infinite;
}

@keyframes subtle-pulse {
  0%, to { box-shadow: 0 10px 30px #00000014; }
  50% { box-shadow: 0 10px 30px #22c55e26; }
}

/* Essential Tailwind-like utilities with !important */
.voice-widget .max-w-\\[400px\\] { max-width: 400px !important; }
.voice-widget .max-w-\\[1200px\\] { max-width: 1200px !important; }
.voice-widget .max-w-\\[600px\\] { max-width: 600px !important; }
.voice-widget .w-full { width: 100% !important; }
.voice-widget .w-\\[100px\\] { width: 100px !important; }
.voice-widget .h-\\[100px\\] { height: 100px !important; }
.voice-widget .w-8 { width: 2rem !important; }
.voice-widget .h-8 { height: 2rem !important; }
.voice-widget .w-12 { width: 3rem !important; }
.voice-widget .h-12 { height: 3rem !important; }
.voice-widget .w-14 { width: 3.5rem !important; }
.voice-widget .h-14 { height: 3.5rem !important; }
.voice-widget .w-3\\.5 { width: 0.875rem !important; }
.voice-widget .h-3\\.5 { height: 0.875rem !important; }
.voice-widget .w-5 { width: 1.25rem !important; }
.voice-widget .h-5 { height: 1.25rem !important; }
.voice-widget .w-6 { width: 1.5rem !important; }
.voice-widget .h-6 { height: 1.5rem !important; }
.voice-widget .w-1\\.5 { width: 0.375rem !important; }
.voice-widget .h-1\\.5 { height: 0.375rem !important; }
.voice-widget .w-\\[1\\.5px\\] { width: 1.5px !important; }

.voice-widget .rounded-\\[20px\\] { border-radius: 20px !important; }
.voice-widget .rounded-full { border-radius: 9999px !important; }
.voice-widget .rounded-sm { border-radius: 0.125rem !important; }

.voice-widget .p-6 { padding: 1.5rem !important; }
.voice-widget .p-8 { padding: 2rem !important; }
.voice-widget .px-4 { padding-left: 1rem !important; padding-right: 1rem !important; }
.voice-widget .py-1\\.5 { padding-top: 0.375rem !important; padding-bottom: 0.375rem !important; }
.voice-widget .px-9 { padding-left: 2.25rem !important; padding-right: 2.25rem !important; }
.voice-widget .py-4 { padding-top: 1rem !important; padding-bottom: 1rem !important; }

.voice-widget .flex { display: flex !important; }
.voice-widget .inline-flex { display: inline-flex !important; }
.voice-widget .flex-col { flex-direction: column !important; }
.voice-widget .flex-row { flex-direction: row !important; }
.voice-widget .items-center { align-items: center !important; }
.voice-widget .items-end { align-items: flex-end !important; }
.voice-widget .justify-center { justify-content: center !important; }
.voice-widget .gap-6 { gap: 1.5rem !important; }
.voice-widget .gap-10 { gap: 2.5rem !important; }
.voice-widget .gap-4 { gap: 1rem !important; }
.voice-widget .gap-3 { gap: 0.75rem !important; }
.voice-widget .gap-2 { gap: 0.5rem !important; }
.voice-widget .gap-2\\.5 { gap: 0.625rem !important; }
.voice-widget .gap-1\\.5 { gap: 0.375rem !important; }
.voice-widget .gap-\\[1px\\] { gap: 1px !important; }

.voice-widget .flex-shrink-0 { flex-shrink: 0 !important; }
.voice-widget .flex-1 { flex: 1 1 0% !important; }

.voice-widget .relative { position: relative !important; }
.voice-widget .absolute { position: absolute !important; }
.voice-widget .bottom-0 { bottom: 0px !important; }
.voice-widget .right-0 { right: 0px !important; }

.voice-widget .overflow-hidden { overflow: hidden !important; }

.voice-widget .text-center { text-align: center !important; }
.voice-widget .text-left { text-align: left !important; }
.voice-widget .text-2xl { font-size: 1.5rem !important; line-height: 2rem !important; }
.voice-widget .text-\\[32px\\] { font-size: 32px !important; }
.voice-widget .text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
.voice-widget .text-base { font-size: 1rem !important; line-height: 1.5rem !important; }
.voice-widget .text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
.voice-widget .text-xs { font-size: 0.75rem !important; line-height: 1rem !important; }

.voice-widget .font-bold { font-weight: 700 !important; }
.voice-widget .font-semibold { font-weight: 600 !important; }
.voice-widget .font-medium { font-weight: 500 !important; }
.voice-widget .font-mono { font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace !important; }

.voice-widget .leading-tight { line-height: 1.25 !important; }
.voice-widget .leading-relaxed { line-height: 1.625 !important; }

.voice-widget .tabular-nums { font-variant-numeric: tabular-nums !important; }
.voice-widget .whitespace-nowrap { white-space: nowrap !important; }

.voice-widget .mb-2 { margin-bottom: 0.5rem !important; }

.voice-widget .bg-green-500 { background-color: rgb(34 197 94) !important; }
.voice-widget .bg-gray-800 { background-color: rgb(31 41 55) !important; }
.voice-widget .bg-gray-200 { background-color: rgb(229 231 235) !important; }
.voice-widget .bg-red-500 { background-color: rgb(239 68 68) !important; }
.voice-widget .bg-blue-500 { background-color: rgb(59 130 246) !important; }

.voice-widget .text-white { color: rgb(255 255 255) !important; }
.voice-widget .text-gray-600 { color: rgb(75 85 99) !important; }
.voice-widget .text-green-500 { color: rgb(34 197 94) !important; }

.voice-widget .shadow-lg { box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important; }

.voice-widget .border-2 { border-width: 2px !important; }
.voice-widget .border-white { border-color: rgb(255 255 255) !important; }

.voice-widget .transition-all { transition-property: all !important; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important; }
.voice-widget .duration-200 { transition-duration: 200ms !important; }

.voice-widget .hover\\:scale-110:hover { transform: scale(1.1) !important; }
.voice-widget .hover\\:bg-gray-300:hover { background-color: rgb(209 213 219) !important; }
.voice-widget .hover\\:bg-red-600:hover { background-color: rgb(220 38 38) !important; }
.voice-widget .hover\\:-translate-y-0\\.5:hover { transform: translateY(-0.125rem) !important; }

.voice-widget .active\\:translate-y-0:active { transform: translateY(0px) !important; }

.voice-widget .cursor-pointer { cursor: pointer !important; }
.voice-widget .object-contain { object-fit: contain !important; }

.voice-widget .space-y-2 > * + * { margin-top: 0.5rem !important; }

.voice-widget .animate-pulse { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite !important; }
@keyframes pulse { 50% { opacity: .5; } }

@media (min-width: 640px) {
  .voice-widget .sm\\:max-w-\\[1200px\\] { max-width: 1200px !important; }
  .voice-widget .sm\\:p-8 { padding: 2rem !important; }
}

@media (min-width: 1024px) {
  .voice-widget .lg\\:flex-row { flex-direction: row !important; }
  .voice-widget .lg\\:text-left { text-align: left !important; }
  .voice-widget .lg\\:text-\\[32px\\] { font-size: 32px !important; }
  .voice-widget .lg\\:text-lg { font-size: 1.125rem !important; line-height: 1.75rem !important; }
  .voice-widget .lg\\:text-3xl { font-size: 1.875rem !important; line-height: 2.25rem !important; }
  .voice-widget .lg\\:px-\\[60px\\] { padding-left: 60px !important; padding-right: 60px !important; }
  .voice-widget .lg\\:py-10 { padding-top: 2.5rem !important; padding-bottom: 2.5rem !important; }
  .voice-widget .lg\\:gap-10 { gap: 2.5rem !important; }
  .voice-widget .lg\\:mb-2 { margin-bottom: 0.5rem !important; }
  .voice-widget .lg\\:items-end { align-items: flex-end !important; }
}

@media (max-width: 1024px) {
  .voice-widget { padding: 30px 40px !important; gap: 30px !important; }
}

@media (max-width: 640px) {
  .voice-widget {
    flex-direction: column !important;
    text-align: center !important;
    padding: 20px !important;
    gap: 16px !important;
    max-width: 400px !important;
    margin: 0 auto !important;
  }
  .voice-widget button:not(.w-12):not(.w-14):not(.w-8) { padding: 12px 20px !important; }
}

@media (max-width: 380px) {
  .voice-widget { padding: 25px 15px !important; }
  .voice-widget h2 { font-size: 22px !important; }
  .voice-widget p { font-size: 14px !important; }
}

.voice-widget * { box-sizing: border-box !important; }
.voice-widget button {
  border: none !important;
  outline: none !important;
  background: none !important;
  font-family: inherit !important;
  font-size: inherit !important;
  cursor: pointer !important;
}
.voice-widget img {
  max-width: 100% !important;
  height: auto !important;
  display: block !important;
}`;
  
  fs.writeFileSync(cdnCssPath, finalCss);
  
  console.log('✅ Voice Widget CDN CSS built successfully!');
  console.log(`📦 Output: cdn/voice-widget.css`);
  console.log(`📊 CSS file size: ${(fs.statSync(cdnCssPath).size / 1024).toFixed(2)} KB`);
  
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