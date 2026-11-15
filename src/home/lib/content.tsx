import { useEffect, useState, type ReactNode } from 'react'
import { DEFAULT_CONTENT, type Content } from '../../shared/content/content'
import { loadContent } from '../../shared/content/load'
import { todayKey } from '../../shared/calendar/dates'
import { ContentContext } from './useContent'

/** las noticias con fecha de cierre ya pasada dejan de mostrarse en todo el sitio */
const withoutClosedNews = (c: Content): Content => ({ ...c, news: c.news.filter((n) => !n.until || n.until >= todayKey()) })

/** Contenido del sitio: arranca con el del código (sin esperar) y lo reemplaza por lo guardado desde /admin */
export function ContentProvider({ children }: { children: ReactNode }) {
  const [content, setContent] = useState<Content>(() => withoutClosedNews(DEFAULT_CONTENT))
  useEffect(() => {
    let cancelled = false
    loadContent().then((c) => !cancelled && setContent(withoutClosedNews(c)))
    return () => {
      cancelled = true
    }
  }, [])
  return <ContentContext.Provider value={content}>{children}</ContentContext.Provider>
}
