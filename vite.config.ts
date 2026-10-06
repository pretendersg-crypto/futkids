import tailwindcss from '@tailwindcss/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
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
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-maskable-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Cacheia o app inteiro para funcionar offline; vídeos ficam fora (são grandes)
        globPatterns: ['**/*.{js,css,html,svg,png,webp,json,mp3,ogg}'],
      },
      // Liga o service worker também no `npm run dev`, para testar a instalação
      devOptions: { enabled: true },
    }),
  ],
}))
