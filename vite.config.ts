import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/wp-json': {
        target: 'http://localhost/MAGICIEUSE/htdocs',
        changeOrigin: true,
      },
    },
  },
  preview: {
    headers: {
      // index.html jamais mis en cache — évite les 404 sur chunks périmés après rebuild
      'Cache-Control': 'no-cache, no-store, must-revalidate',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('lottie'))                                        return 'vendor-lottie'
          if (id.includes('react-dom') || id.includes('react-router'))     return 'vendor-react'
          if (id.includes('swr'))                                           return 'vendor-swr'
          return 'vendor'
        },
      },
    },
  },
})
