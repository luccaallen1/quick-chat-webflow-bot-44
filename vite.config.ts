
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const buildTarget = process.env.BUILD_TARGET;
  
  if (buildTarget === 'cdn' || buildTarget === 'voice-cdn') {
    // CDN Widget Build Configuration
    const isVoiceWidget = buildTarget === 'voice-cdn';
    
    return {
      plugins: [react()],
      build: {
        lib: {
          entry: path.resolve(__dirname, isVoiceWidget ? 'src/components/StandaloneVoiceWidget.tsx' : 'src/clean-widget-entry.js'),
          name: isVoiceWidget ? 'VoiceWidget' : 'ChatbotWidget',
          fileName: isVoiceWidget ? 'voice-widget' : 'chatbot-widget',
          formats: ['iife']
        },
        rollupOptions: {
          external: [],
          output: {
            globals: {},
            assetFileNames: (assetInfo) => {
              if (assetInfo.name?.endsWith('.css')) {
                return isVoiceWidget ? 'voice-widget.css' : 'chatbot-widget.css';
              }
              return assetInfo.name || 'asset';
            }
          }
        },
        minify: true,
        sourcemap: false,
        cssCodeSplit: false
      },
      resolve: {
        alias: {
          "@": path.resolve(__dirname, "./src"),
        },
      },
      define: {
        'process.env.NODE_ENV': '"production"'
      }
    };
  }

  // Default Demo App Build Configuration
  return {
    server: {
      host: "::",
      port: 8080,
    },
    plugins: [
      react(),
      mode === 'development' &&
      componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
