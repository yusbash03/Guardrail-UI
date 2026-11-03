import { defineConfig, loadEnv, type ProxyOptions } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json';

// Where `npm run dev` / `npm run preview` forward /api. Local API by default; `npm run dev:render` targets Render.
const env = loadEnv(process.env.NODE_ENV ?? 'development', process.cwd(), '');
const apiTarget = env.API_PROXY_TARGET || 'http://localhost:5080';

// The browser stays same-origin (so the httpOnly refresh cookie, Path=/api/v1/auth, round-trips). The API's refresh
// endpoint rejects a foreign Origin (CSRF defence), so the proxy presents the target's own origin.
const apiProxy: ProxyOptions = {
  target: apiTarget,
  changeOrigin: true,
  secure: true,
  configure: (proxy) =>
    proxy.on('proxyReq', (req) => {
      if (req.getHeader('origin')) req.setHeader('origin', new URL(apiTarget).origin);
    }),
};

// PWA_REQUIREMENTS.md: precache the shell only; /api/** is never cached; PayPal is not intercepted.
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString().slice(0, 10).replace(/-/g, '.')),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'prompt',
      includeAssets: ['icons/*.png', 'favicon.svg'],
      manifest: {
        name: 'Guardrail AI',
        short_name: 'Guardrail',
        description: 'Your money. Your rules. Your AI.',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#0B0F1A',
        theme_color: '#4F46E5',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          { urlPattern: ({ url }) => url.pathname.startsWith('/api/'), handler: 'NetworkOnly' },
          {
            urlPattern: ({ url }) => url.pathname.startsWith('/images/'),
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'catalogue-images', expiration: { maxEntries: 100, maxAgeSeconds: 7 * 24 * 60 * 60 } },
          },
        ],
      },
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    proxy: { '/api': apiProxy, '/images': apiProxy },
  },
  preview: {
    port: 4173,
    proxy: { '/api': apiProxy, '/images': apiProxy },
  },
});
