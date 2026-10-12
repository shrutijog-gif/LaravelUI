import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/figma': {
        target: 'https://api.figma.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/figma/, ''),
      },
    },
  },
  esbuild: {
    sourcemap: false,
  },
  optimizeDeps: {
    esbuildOptions: {
      sourcemap: false,
    },
  },
});
