import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'document-cors-proxy',
      configureServer(server) {
        server.middlewares.use('/api/proxy-doc', async (req, res) => {
          try {
            const parsedUrl = new URL(req.url || '', 'http://localhost');
            const targetUrl = parsedUrl.searchParams.get('url');
            if (!targetUrl) {
              res.statusCode = 400;
              res.end('Missing url param');
              return;
            }
            const fetchRes = await fetch(targetUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                'Accept': '*/*',
              },
            });
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
            res.setHeader('Content-Type', fetchRes.headers.get('content-type') || 'application/pdf');
            const arrayBuf = await fetchRes.arrayBuffer();
            res.end(Buffer.from(arrayBuf));
          } catch (err: any) {
            res.statusCode = 502;
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.end(`Proxy error: ${err?.message || 'Failed to fetch document'}`);
          }
        });
      },
    },
  ],
  server: {
    proxy: {
      '/api/figma': {
        target: 'https://api.figma.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/figma/, ''),
      },
    },
  },
  preview: {
    host: '0.0.0.0',
    allowedHosts: true,
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
