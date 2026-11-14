import { useEffect, useState } from 'react'

/** true cuando terminó la animación del logo (o enseguida si no hubo animación) */
export function useReveal() {
  const [ready, setReady] = useState(false)
  useEffect(() => {
    const splash = document.getElementById('splash')
    const reveal = () => {
      document.documentElement.classList.remove('splashing')
      setReady(true)
    }
    if (splash?.dataset.play !== undefined) {
      const a = setTimeout(reveal, 1050)
      const b = setTimeout(() => splash.remove(), 1700)
      return () => {
        clearTimeout(a)
        clearTimeout(b)
      }
    }
    const raf = requestAnimationFrame(reveal)
    return () => cancelAnimationFrame(raf)
  }, [])
  return ready
}

/** true cuando la página bajó más de `offset` píxeles */
export function useScrolled(offset = 10) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > offset)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [offset])
  return scrolled
}

/** Frena el scroll de la página mientras `locked` sea true */
export function useScrollLock(locked: boolean) {
  useEffect(() => {
    if (!locked) return
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [locked])
}

/** Llama a `onEscape` al apretar Escape mientras `active` sea true */
export function useEscape(active: boolean, onEscape: () => void) {
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onEscape()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [active, onEscape])
}
