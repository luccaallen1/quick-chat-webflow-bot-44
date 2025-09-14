import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    lib: {
      entry: path.resolve(__dirname, 'src/clean-widget-entry.js'),
      name: 'ChatbotWidget',
      formats: ['es', 'iife', 'umd'],
      fileName: (format) => {
        if (format === 'es') return 'chatbot-widget.bundle.es.js'
        if (format === 'iife') return 'chatbot-widget.bundle.js'
        if (format === 'umd') return 'chatbot-widget.js'
        return `chatbot-widget.${format}.js`
      }
    },
    rollupOptions: {
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react-dom/client': 'ReactDOM'
        },
        // Inline all dependencies like n8n does
        inlineDynamicImports: format => format === 'iife',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'style.css'
          return assetInfo.name
        }
      },
      external: (id) => {
        // Don't externalize anything for IIFE build (like n8n)
        return false
      }
    },
    cssCodeSplit: false,
    outDir: 'cdn/dist'
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})