import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import fs from 'fs';
import { defineConfig } from 'vite';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'serve-pwa-manifest',
        configureServer(server) {
          server.middlewares.use((req, res, next) => {
            const rawUrl = req.url ? req.url.split('?')[0] : '';
            if (rawUrl === '/manifest.json' || rawUrl === '/manifest.webmanifest') {
              const filePath = path.resolve(__dirname, 'public/manifest.json');
              if (fs.existsSync(filePath)) {
                res.setHeader('Content-Type', 'application/manifest+json; charset=utf-8');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
                res.setHeader('Cache-Control', 'public, max-age=3600');
                return fs.createReadStream(filePath).pipe(res);
              }
            }
            if (rawUrl === '/sw.js') {
              const swPath = path.resolve(__dirname, 'public/sw.js');
              if (fs.existsSync(swPath)) {
                res.setHeader('Content-Type', 'text/javascript; charset=utf-8');
                res.setHeader('Service-Worker-Allowed', '/');
                res.setHeader('Access-Control-Allow-Origin', '*');
                res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
                return fs.createReadStream(swPath).pipe(res);
              }
            }
            next();
          });
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    preview: {
      port: 3000,
      host: '0.0.0.0',
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
    },
    server: {
      cors: true,
      headers: {
        'Access-Control-Allow-Origin': '*',
      },
      // HMR is disabled in AI Studio environment
      hmr: false,
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
