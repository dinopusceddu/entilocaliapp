import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    visualizer({
      open: true,
      filename: 'build-stats.html',
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  define: {
    'process.env': process.env
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      clientPort: 443,
    },
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  }
})
