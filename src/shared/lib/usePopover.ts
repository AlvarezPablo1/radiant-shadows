import { useEffect, useRef, useState } from 'react'

export type PopoverPos = { left: number; top?: number; bottom?: number }

/**
 * Panel flotante fijo sobre la pantalla (así no lo corta un modal con scroll), anclado a un botón:
 * abre hacia arriba si no entra abajo y se cierra al tocar afuera, al scrollear la página o al cambiar el tamaño.
 */
export function usePopover<T extends HTMLElement>(width: number, height: number) {
  const anchor = useRef<T>(null)
  const panel = useRef<HTMLDivElement>(null)
  const [pos, setPos] = useState<PopoverPos | null>(null)

  const open = () => {
    const r = anchor.current!.getBoundingClientRect()
    const left = Math.max(8, Math.min(r.left, innerWidth - width - 8))
    const below = innerHeight - r.bottom
    setPos(below < height + 12 && r.top > below ? { left, bottom: innerHeight - r.top + 6 } : { left, top: r.bottom + 6 })
  }
  const close = () => setPos(null)

  useEffect(() => {
    if (!pos) return
    const outside = (e: Event) => {
      const t = e.target as Node
      if (!panel.current?.contains(t) && !anchor.current?.contains(t)) close()
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation() // que no cierre también el modal
      close()
      anchor.current?.focus()
    }
    addEventListener('pointerdown', outside)
    addEventListener('scroll', outside, true)
    addEventListener('resize', close)
    addEventListener('keydown', onKey, true)
    return () => {
      removeEventListener('pointerdown', outside)
      removeEventListener('scroll', outside, true)
      removeEventListener('resize', close)
      removeEventListener('keydown', onKey, true)
    }
  }, [pos])

  return { anchor, panel, pos, isOpen: pos !== null, open, close, toggle: () => (pos ? close() : open()) }
}
