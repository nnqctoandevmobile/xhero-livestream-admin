import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  envPrefix: ['NEXT_PUBLIC_'],
  server: {
    proxy: {
      '/ant-media-api': {
        target: 'http://live.xheroapp.com:5443',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/ant-media-api/, ''),
        secure: false,
      }
    }
  }
})
