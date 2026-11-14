import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HomeApp } from './HomeApp'
import './home.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <HomeApp />
  </StrictMode>,
)
