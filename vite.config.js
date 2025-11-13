import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  publicDir: 'public',
  build: {
    // Exclude images from production build
    // Images will still work locally in dev mode
    rollupOptions: {
      external: []
    },
    // Copy public assets but we'll manually exclude IMAGES
    copyPublicDir: true
  }
})
