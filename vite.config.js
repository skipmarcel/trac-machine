import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    // Two pages: the portfolio and /work-with-trac/ (payments).
    rollupOptions: { input: { main: 'index.html', work: 'work-with-trac/index.html' } },
  },
});
