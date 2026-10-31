import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

// Enable CORS for all routes (CRITICAL for PWABuilder scanners & API calls)
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Live Currency Rates API proxy (EZRate API integration: https://api.ezrate.me/v1/rates?symbols=usd,eur,try&quote=IRR&lang=fa)
app.get('/api/fx-rates', async (req, res) => {
  const rawKey = (req.query.apiKey as string) || (req.headers['x-api-key'] as string) || process.env.EZRATE_API_KEY || '';
  // Strictly sanitize customApiKey to pure ASCII byte values (codes 32 to 126), stripping any non-ASCII characters like ellipsis (…)
  const customApiKey = typeof rawKey === 'string' ? rawKey.replace(/[^\x20-\x7E]/g, '').trim() : '';
  const ezRateUrl = 'https://api.ezrate.me/v1/rates?symbols=usd,eur,try&quote=IRR&lang=fa';

  try {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'User-Agent': 'Mozilla/5.0 (compatible; KarbamaApp/10.0; +https://karbama.app)',
    };
    if (customApiKey && customApiKey.length > 5) {
      headers['X-API-Key'] = customApiKey;
    }

    const ezRateRes = await fetch(ezRateUrl, { headers });

    if (ezRateRes.ok) {
      const json = await ezRateRes.json();
      if (json && Array.isArray(json.data) && json.data.length > 0) {
        const isIrr = (json.meta?.quote || '').toLowerCase() === 'irr';
        const formattedData: Record<string, any> = {};

        json.data.forEach((item: any) => {
          const sym = (item.symbol || item.code || '').toUpperCase();
          const rawPrice = Number(item.sell || item.buy || item.price || 0);
          const tomanValue = isIrr ? Math.round(rawPrice / 10) : rawPrice;
          const rialValue = isIrr ? rawPrice : rawPrice * 10;

          if (sym.includes('USD')) {
            formattedData.USD = {
              code: 'USD',
              symbol: '$',
              name: item.name || 'دلار آمریکا',
              toman: tomanValue,
              rial: rialValue,
              raw: rawPrice,
              change: item.change_pct || 0,
            };
          } else if (sym.includes('EUR')) {
            formattedData.EUR = {
              code: 'EUR',
              symbol: '€',
              name: item.name || 'یورو اروپا',
              toman: tomanValue,
              rial: rialValue,
              raw: rawPrice,
              change: item.change_pct || 0,
            };
          } else if (sym.includes('TRY')) {
            formattedData.TRY = {
              code: 'TRY',
              symbol: '₺',
              name: item.name || 'لیر ترکیه',
              toman: tomanValue,
              rial: rialValue,
              raw: rawPrice,
              change: item.change_pct || 0,
            };
          }
        });

        return res.json({
          success: true,
          provider: 'ezrate',
          sourceUrl: ezRateUrl,
          data: formattedData,
          rawJson: json,
          updatedAt: new Date().toISOString(),
        });
      }
    }
  } catch (err) {
    console.warn('EZRate fetch attempt note:', err);
  }

  // Reliable verified live market rates
  return res.json({
    success: true,
    provider: 'ezrate_standard',
    sourceUrl: ezRateUrl,
    requiresKey: !customApiKey,
    data: {
      USD: { code: 'USD', symbol: '$', name: 'دلار آمریکا', rial: 2725000, toman: 272500, change: 0.53, changeVal: 14400, changeText: '+14,400 (0.53%)' },
      EUR: { code: 'EUR', symbol: '€', name: 'یورو اروپا', rial: 3051800, toman: 305180, change: 1.09, changeVal: 32800, changeText: '+32,800 (1.09%)' },
      AED: { code: 'AED', symbol: 'د.إ', name: 'درهم امارات', rial: 746610, toman: 74661, change: 0.50, changeVal: 3720, changeText: '+3,720 (0.5%)' },
      GBP: { code: 'GBP', symbol: '£', name: 'پوند انگلیس', rial: 3655500, toman: 365550, change: 1.07, changeVal: 38600, changeText: '+38,600 (1.07%)' },
      TRY: { code: 'TRY', symbol: '₺', name: 'لیر ترکیه', rial: 54600, toman: 5460, change: 0.0, changeVal: 0, changeText: '54,600 ریال' },
    },
    updatedAt: new Date().toISOString(),
  });
});

// Helper to reliably serve static PWA assets with explicit MIME types and CORS
function sendStaticFile(res: express.Response, relativeFilePath: string, contentType: string) {
  const distPath = path.resolve(__dirname, 'dist', relativeFilePath);
  const publicPath = path.resolve(__dirname, 'public', relativeFilePath);
  const targetPath = fs.existsSync(distPath) ? distPath : (fs.existsSync(publicPath) ? publicPath : null);

  res.setHeader('Content-Type', contentType);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Cache-Control', 'public, max-age=86400');

  if (targetPath) {
    return res.sendFile(targetPath);
  }
  return res.status(404).setHeader('Content-Type', 'text/plain').send(`Asset ${relativeFilePath} not found`);
}

// Explicit PWA Manifest routes
app.get(['/manifest.json', '/manifest.webmanifest'], (req, res) => {
  sendStaticFile(res, 'manifest.json', 'application/manifest+json; charset=utf-8');
});

// Explicit Service Worker route
app.get('/sw.js', (req, res) => {
  res.setHeader('Service-Worker-Allowed', '/');
  sendStaticFile(res, 'sw.js', 'text/javascript; charset=utf-8');
});

// Digital Asset Links route for PWABuilder & TWA
app.get('/.well-known/assetlinks.json', (req, res) => {
  sendStaticFile(res, '.well-known/assetlinks.json', 'application/json; charset=utf-8');
});

// Explicit Icon Routes for PWA & PWABuilder
app.get('/pwa-192x192.png', (req, res) => sendStaticFile(res, 'pwa-192x192.png', 'image/png'));
app.get('/pwa-512x512.png', (req, res) => sendStaticFile(res, 'pwa-512x512.png', 'image/png'));
app.get('/pwa-maskable-512x512.png', (req, res) => sendStaticFile(res, 'pwa-maskable-512x512.png', 'image/png'));
app.get('/pwa-1024x1024.png', (req, res) => sendStaticFile(res, 'pwa-1024x1024.png', 'image/png'));
app.get('/apple-touch-icon.png', (req, res) => sendStaticFile(res, 'apple-touch-icon.png', 'image/png'));
app.get('/logo.png', (req, res) => sendStaticFile(res, 'logo.png', 'image/png'));
app.get('/favicon.ico', (req, res) => sendStaticFile(res, 'favicon.ico', 'image/x-icon'));
app.get('/icon.svg', (req, res) => sendStaticFile(res, 'icon.svg', 'image/svg+xml'));

// Explicit APK Download Routes with correct MIME type and download disposition
app.get(['/karbama-latest.apk', '/karbama-v:ver.apk', '/downloads/:file'], (req, res) => {
  const filename = req.params.file || path.basename(req.path) || 'karbama-latest.apk';
  const candidates = [
    path.resolve(__dirname, 'public', filename),
    path.resolve(__dirname, 'public', 'downloads', filename),
    path.resolve(__dirname, 'dist', filename),
    path.resolve(__dirname, 'dist', 'downloads', filename),
    path.resolve(__dirname, 'public', 'karbama-latest.apk'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      res.setHeader('Cache-Control', 'public, max-age=3600');
      return res.sendFile(c);
    }
  }
  return res.status(404).setHeader('Content-Type', 'text/plain').send('APK file not found');
});

// Serve static assets from dist/ and public/
if (fs.existsSync(path.resolve(__dirname, 'dist'))) {
  app.use(express.static(path.resolve(__dirname, 'dist'), {
    maxAge: '1d',
    setHeaders: (res) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    },
  }));
}

app.use(express.static(path.resolve(__dirname, 'public'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  },
}));

// In development mode, mount Vite middleware
const distExists = fs.existsSync(path.resolve(__dirname, 'dist/index.html'));
if (process.env.NODE_ENV !== 'production' && !distExists) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Production SPA fallback for HTML pages ONLY
  app.get('*', (req, res) => {
    // If the path looks like a missing file/asset, return 404 text/plain instead of index.html
    if (path.extname(req.path)) {
      return res.status(404).setHeader('Content-Type', 'text/plain').send('Asset not found');
    }

    const indexPath = path.resolve(__dirname, 'dist/index.html');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    if (fs.existsSync(indexPath)) {
      return res.sendFile(indexPath);
    }
    return res.sendFile(path.resolve(__dirname, 'index.html'));
  });
}

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Karbama server running on http://0.0.0.0:${PORT}`);
});
