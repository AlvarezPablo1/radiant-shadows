import { useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_CONTENT, type Content } from '../../shared/content/content'
import { loadContent } from '../../shared/content/load'
import { ContentContext } from './useContent'

/** Contenido del sitio: arranca con el del código (sin esperar) y lo reemplaza por lo guardado desde /admin */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT)
  useEffect(() => {
    let cancelled = false
    loadContent().then((c) => !cancelled && setContent(c))
    return () => {
      cancelled = true
    }
  }, [])
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}
