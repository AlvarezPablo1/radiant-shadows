import { useEffect } from 'react'
import type { AppState } from '../state'
import type { Layer } from '../types'

/** atajos: G guías · ⌘Z / ⇧⌘Z deshacer y rehacer · ⌘A todo · Supr borrar · flechas mover · Esc soltar */
export function useShortcuts(s: AppState, layers: Layer[], toggleGuides: () => void) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const mod = e.metaKey || e.ctrlKey
      if (!mod && e.key.toLowerCase() === 'g') {
        toggleGuides()
        return
      }
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        s.setSelection(layers.filter((l) => l.visible && !l.locked).map((l) => l.id))
        return
      }
      const sel = layers.filter((x) => s.selection.includes(x.id))
      if (!sel.length) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        s.removeLayers(sel.map((l) => l.id))
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const d = e.shiftKey ? 20 : 2
        const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0
        const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0
        s.updateLayers(sel.filter((l) => !l.locked).map((l) => ({ id: l.id, patch: { x: l.x + dx, y: l.y + dy } })))
      } else if (e.key === 'Escape') s.setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s, layers, toggleGuides])
}
