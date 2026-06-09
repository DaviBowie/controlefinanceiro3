import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // O Vite faz strip do prefixo /api e envia /auth/register, /transactions, etc.
      // ao backend (porta 8000). O backend nao usa globalPrefix.
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
