import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/Relat-rio-D-bitos-Pralog/',
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
