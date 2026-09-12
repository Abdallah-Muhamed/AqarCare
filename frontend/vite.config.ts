import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5041',
        changeOrigin: true,
      },
      // Proxy OSM tiles to avoid CORS issues
      '/osm-tiles': {
        target: 'https://tile.openstreetmap.org',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/osm-tiles/, ''),
        headers: {
          'User-Agent': 'AqarCare/1.0 (real-estate map; contact@aqarcare.com)',
          'Referer': 'http://localhost:5173',
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
  },
  optimizeDeps: {
    exclude: ['maplibre-gl'],
  },
})
