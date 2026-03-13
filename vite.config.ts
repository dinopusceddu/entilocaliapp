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
  // No define: { 'process.env': process.env } to avoid security risks and Vite warnings.
  // Use import.meta.env for variables prefixed with VITE_ instead.
  server: {
    host: '0.0.0.0',
    port: 5000,
    // hmr: {
    //   clientPort: 443,
    // },
    allowedHosts: true,
  },
  preview: {
    host: '0.0.0.0',
    port: 5000,
  }
})
