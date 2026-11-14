import { useEffect, useState } from 'react'

/** cuánto dura la ida del dragón antes de cambiar de página (ms) */
export const LEAVE_MS = 700

/** link interno de la home a otra sección (no el mediakit, ni pestañas nuevas, ni anclas) */
function sectionLink(e: MouseEvent): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null
  const a = (e.target as Element).closest('a')
  if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return null
  const url = new URL(a.href, location.href)
  if (url.origin !== location.origin || url.pathname.startsWith('/mediakit') || url.pathname.startsWith('/api')) return null
  if (url.pathname === location.pathname && url.search === location.search) return null
  return url.href
}

/**
 * Al tocar un link a otra sección: devuelve `leaving = true` (para mostrar el dragón),
 * espera a que la cortina tape la pantalla y recién ahí navega. La página nueva se destapa sola.
 */
export function useLinkTransition() {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setTimeout>
    const onClick = (e: MouseEvent) => {
      const href = sectionLink(e)
      if (!href) return
      e.preventDefault()
      setLeaving(true)
      timer = setTimeout(() => {
        sessionStorage.setItem('rs-nav', '1')
        location.assign(href)
      }, LEAVE_MS)
    }
    // al volver con "atrás" el navegador puede restaurar la página con la cortina puesta
    const onShow = (e: PageTransitionEvent) => e.persisted && setLeaving(false)
    document.addEventListener('click', onClick)
    window.addEventListener('pageshow', onShow)
    return () => {
      clearTimeout(timer)
      document.removeEventListener('click', onClick)
      window.removeEventListener('pageshow', onShow)
    }
  }, [])

  // llegada: index.html dejó la página tapada; acá se destapa
  useEffect(() => {
    const html = document.documentElement
    if (!html.classList.contains('arriving')) return
    const raf = requestAnimationFrame(() => html.classList.add('arrived'))
    const done = setTimeout(() => html.classList.remove('arriving', 'arrived'), 600)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(done)
    }
  }, [])

  return leaving
}
