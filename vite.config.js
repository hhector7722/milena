import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['logo-circulo-perro-chica.png', 'avatars/*.png'],
      manifest: {
        name: 'Milena González',
        short_name: 'Milena',
        description: 'Gestió d\'adiestrament caní i facturació',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'logo-circulo-perro-chica.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'logo-circulo-perro-chica.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
