import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig({
  base: '/Tetonor/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon-180x180.png', 'og-image.svg', 'icon.svg'],
      manifest: {
        name: 'Tetonor — Pares que suman y multiplican',
        short_name: 'Tetonor',
        description:
          'Juego diario de lógica matemática. Encuentra los pares de números que comparten suma y producto.',
        theme_color: '#1a2a33',
        background_color: '#1a2a33',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/Tetonor/',
        start_url: '/Tetonor/',
        lang: 'es',
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,ico,webp,woff,woff2}'],
        navigateFallback: '/Tetonor/index.html',
      },
    }),
  ],
});
