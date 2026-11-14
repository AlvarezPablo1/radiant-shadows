import { useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_CONTENT, type Content } from '../data/content'
import { ContentContext } from './useContent'

/** Contenido del sitio: arranca con el del código (sin esperar) y lo reemplaza por lo guardado desde /admin */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT)
  useEffect(() => {
    let cancelled = false
    fetch('/api/content')
      .then((r) => (r.ok ? (r.json() as Promise<Partial<Content>>) : null))
      .then((saved) => !cancelled && saved && setContent({ ...DEFAULT_CONTENT, ...saved }))
      .catch(() => {}) // sin conexión o sin API (npm run dev): queda el contenido del código
    return () => {
      cancelled = true
    }
  }, [])
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}
