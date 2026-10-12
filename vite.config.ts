import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// Caminho onde o app fica publicado. GitHub Pages (projeto): BASE_PATH=/futkids/ no build
// (ver .github/workflows/deploy.yml). Em casa, no `npm run dev`, é a raiz.
const base = process.env.BASE_PATH ?? '/'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  base,
  // No "npm run dev", as partes do Firebase precisam ser pré-empacotadas juntas; separadas, cada uma
  // tem a sua cópia do núcleo e dá "Component auth has not been registered yet"
  optimizeDeps: {
    include: ['firebase/app', 'firebase/app-check', 'firebase/auth', 'firebase/firestore', 'firebase/functions'],
  },
  plugins: [
    react(),
    tailwindcss(),
    // `npm run dev:celular`: HTTPS com certificado de teste, para abrir no celular pela rede
    // local (sensores de movimento só funcionam em HTTPS). O `npm run dev` normal segue em HTTP.
    mode === 'celular' && basicSsl(),
    VitePWA({
      // Atualiza o service worker sozinho quando sai versão nova (sem pedir nada pra criança)
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'apple-touch-icon.png'],
      manifest: {
        name: 'FutKids - Treino de Futebol',
        short_name: 'FutKids',
        description: 'Treinos de futebol e de goleiro para crianças, com conquistas e figurinhas.',
        lang: 'pt-BR',
        theme_color: '#16a34a',
        background_color: '#f0fdf4',
        display: 'standalone',
        // 'any': o tablet pode ficar deitado (ex.: apoiado no chão nos drills de reação)
        orientation: 'any',
        start_url: base,
        scope: base,
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cacheia o app inteiro para funcionar offline; vídeos ficam fora (são grandes)
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json,mp3,ogg}'],
        // O Firebase (conta da família, ~150 KB) não vai no pacote inicial: só quem usa a conta baixa
        globIgnores: ['**/nuvem-*.js'],
        // Vídeos curtos dos gestos (src/assets/goleiro3d): ficam fora do pacote inicial e são guardados
        // na 1ª vez que a criança abre o gesto; depois tocam sem internet. "rangeRequests" é o que
        // deixa o vídeo guardado tocar no iPhone (ele pede o vídeo em pedaços).
        runtimeCaching: [
          {
            // Firebase da conta da família: guardado na 1ª vez que é usado (depois abre sem internet)
            urlPattern: /\/assets\/nuvem-[^/]+\.js$/,
            handler: 'CacheFirst',
            options: { cacheName: 'conta-familia', expiration: { maxEntries: 4 } },
          },
          {
            urlPattern: /\.(?:mp4|webm)$/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'videos-gestos',
              expiration: { maxEntries: 60 },
              cacheableResponse: { statuses: [0, 200] },
              rangeRequests: true,
            },
          },
        ],
        // Lembrete de treino em segundo plano e clique na notificação (public/lembrete-sw.js)
        importScripts: ['lembrete-sw.js'],
      },
      // Liga o service worker também no `npm run dev`, para testar a instalação
      devOptions: { enabled: true },
    }),
  ],
}))
