import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { AgendaApp } from './AgendaApp'
import './agenda.css'

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <AgendaApp />
  </StrictMode>,
)
