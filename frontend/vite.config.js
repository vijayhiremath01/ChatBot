import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
    allowedHosts: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5001', // ✅ Flask backend
        changeOrigin: true,
        secure: false, // optional: avoids SSL issues
        // ❌ removed rewrite so /api stays in path
      },
    },
  },
});
