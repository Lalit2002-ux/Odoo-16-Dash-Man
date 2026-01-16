import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/odoo-api': {
        target: 'https://testoig1.odoo.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/odoo-api/, ''),
        secure: false,
        headers: {
          'Origin': 'https://testoig1.odoo.com'
        }
      },
    },
  },
});
