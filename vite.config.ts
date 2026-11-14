import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Tres páginas: la home pública (/), el creador de publicaciones del staff (/mediakit) y el panel de contenido (/admin)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(__dirname, 'index.html'),
        mediakit: resolve(__dirname, 'mediakit/index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
      },
    },
  },
})
