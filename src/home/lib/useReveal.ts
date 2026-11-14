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
