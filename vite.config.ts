import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/anonimizer-pdf/',
  plugins: [react()],
  optimizeDeps: {
    include: ['pdfjs-dist/legacy/build/pdf.worker.js'],
  },
});
