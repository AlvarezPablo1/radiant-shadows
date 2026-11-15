import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'

// Páginas: la home pública (/), el creador de publicaciones del staff (/mediakit), el panel de contenido (/admin) y la agenda del staff (/agenda)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        mediakit: resolve(import.meta.dirname, 'mediakit/index.html'),
        admin: resolve(import.meta.dirname, 'admin/index.html'),
        agenda: resolve(import.meta.dirname, 'agenda/index.html'),
      },
    },
  },
})
