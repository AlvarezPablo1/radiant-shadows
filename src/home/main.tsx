import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HomeApp } from './HomeApp'
import { ContentProvider } from './lib/content'
import './home.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <ContentProvider>
      <HomeApp />
    </ContentProvider>
  </StrictMode>,
)
