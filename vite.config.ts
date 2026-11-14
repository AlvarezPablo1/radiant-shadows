import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Dos páginas: la home pública (/) y el creador de publicaciones del staff (/mediakit)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        mediakit: resolve(__dirname, 'mediakit/index.html'),
      },
    },
  },
})
