import { useEffect, useRef, useState } from 'react'

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

/** true durante un instante cada tanto (entre `minMs` y `maxMs`, al azar); nunca con "reducir movimiento" */
export function useWink(minMs = 5000, maxMs = 9000, durationMs = 180) {
  const [winking, setWinking] = useState(false)
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let timer: ReturnType<typeof setTimeout>
    const schedule = () => {
      timer = setTimeout(
        () => {
          setWinking(true)
          timer = setTimeout(() => {
            setWinking(false)
            schedule()
          }, durationMs)
        },
        minMs + Math.random() * (maxMs - minMs),
      )
    }
    schedule()
    return () => clearTimeout(timer)
  }, [minMs, maxMs, durationMs])
  return winking
}

/** true cuando el elemento entra en pantalla (una sola vez); con "reducir movimiento" ya arranca visible */
export function useInView<T extends Element>(threshold = 0.2) {
  const ref = useRef<T>(null)
  const [visible, setVisible] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const el = ref.current
    if (!el || visible) return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          io.disconnect()
        }
      },
      { threshold },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [threshold, visible])
  return [ref, visible] as const
}

/** la hora actual, actualizada cada `intervalMs` (para cuentas regresivas) */
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}

/** true mientras se cumpla la media query (se actualiza si cambia el tamaño de la ventana) */
export function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const onChange = () => setMatches(mq.matches)
    onChange()
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [query])
  return matches
}
