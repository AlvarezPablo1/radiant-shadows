import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { UIProvider } from './components/ui.tsx'
import { initFonts } from './lib/fonts.ts'

// Konva mide los textos al dibujar: las fuentes tienen que estar listas antes
initFonts().finally(() =>
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <UIProvider>
        <App />
      </UIProvider>
    </StrictMode>,
  ),
)
