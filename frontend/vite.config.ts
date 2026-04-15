import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    proxy: {
      // Any request to /api/* in the frontend will be forwarded
      // to the Express server running on port 3001
      '/api': 'http://localhost:3001',
    },
  },
});
