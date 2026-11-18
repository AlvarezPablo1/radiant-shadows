import Konva from 'konva'
import type { RefObject } from 'react'
import type { BgRecipe, ImageLayer, Layer, TextLayer } from '../../types'
import { guideLines, type Guides } from './guides'

export interface StageProps {
  width: number
  height: number
  scale: number
  bg: BgRecipe
  layers: Layer[]
  values: Record<string, string>
  imageFor: (l: ImageLayer) => string | undefined
  selection: string[]
  /** additive = Shift/⌘ presionado */
  onSelect: (id: string | null, additive?: boolean) => void
  onSelectMany?: (ids: string[]) => void
  onChange: (id: string, patch: Partial<Layer>) => void
  onChangeMany?: (patches: { id: string; patch: Partial<Layer> }[]) => void
  onTextEdit?: (l: TextLayer) => void
  safeZone?: boolean
  /** configuración de guías (el imantado funciona aunque no se muestren) */
  guides?: Guides | null
  showGuides?: boolean
  interactive?: boolean
  /** escala y corrimiento de los elementos dentro del lienzo (el fondo ocupa todo); para exportar a otros tamaños */
  content?: { scale: number; x: number; y: number }
}

export interface DragCtx {
  /** posiciones iniciales de los otros seleccionados (mover en bloque) */
  others: { node: Konva.Node; x: number; y: number }[]
  x: number
  y: number
  setSnap: (s: { x?: number; y?: number } | null) => void
}

type Base = StageProps & { interactive: boolean; drag: RefObject<DragCtx> }
export type NodeProps<L> = Base & { l: L }

/** propiedades comunes de cada elemento: posición, selección, arrastre con imantado y mover en bloque */
export function common(l: Layer, p: Base) {
  const select = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const ev = e.evt as MouseEvent
    const additive = !!(ev.shiftKey || ev.metaKey || ev.ctrlKey)
    // clic sobre un elemento ya seleccionado (en grupo) no rompe la selección
    if (!additive && p.selection.includes(l.id) && p.selection.length > 1) return
    p.onSelect(l.id, additive)
  }
  return {
    id: l.id,
    x: l.x,
    y: l.y,
    rotation: l.rotation,
    opacity: l.opacity,
    draggable: p.interactive && !l.locked,
    listening: p.interactive,
    onMouseDown: select,
    onTouchStart: select,
    onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
      const drag = p.drag.current
      const n = e.target
      const st = n.getStage()!
      drag.x = n.x()
      drag.y = n.y()
      drag.others = p.selection.includes(l.id)
        ? (p.selection
            .filter((id) => id !== l.id && !p.layers.find((x) => x.id === id)?.locked)
            .map((id) => st.findOne('#' + id))
            .filter(Boolean)
            .map((node) => ({ node: node!, x: node!.x(), y: node!.y() })) as DragCtx['others'])
        : []
    },
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
      const drag = p.drag.current
      const n = e.target
      // imantado (siempre activo salvo que se desactive en Guías)
      let sx: number | undefined, sy: number | undefined
      if (p.guides?.snap !== false) {
        const g = p.guides ?? { margin: 7, rows: 0, cols: 0, center: true, snap: true }
        const r = n.getClientRect({ relativeTo: n.getLayer()! })
        const { xs, ys } = guideLines(g, p.width, p.height)
        const th = 8 / p.scale
        const best = (vals: number[], lines: number[]) => {
          let d = Infinity,
            at = 0
          for (const v of vals)
            for (const ln of lines)
              if (Math.abs(ln - v) < Math.abs(d)) {
                d = ln - v
                at = ln
              }
          return Math.abs(d) <= th ? { d, at } : null
        }
        const bx = best([r.x, r.x + r.width / 2, r.x + r.width], xs)
        const by = best([r.y, r.y + r.height / 2, r.y + r.height], ys)
        if (bx || by) n.position({ x: n.x() + (bx?.d ?? 0), y: n.y() + (by?.d ?? 0) })
        sx = bx?.at
        sy = by?.at
      }
      drag.setSnap(sx !== undefined || sy !== undefined ? { x: sx, y: sy } : null)
      // mover en bloque
      const dx = n.x() - drag.x,
        dy = n.y() - drag.y
      for (const o of drag.others) o.node.position({ x: o.x + dx, y: o.y + dy })
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      const drag = p.drag.current
      drag.setSnap(null)
      const patches = [{ id: l.id, patch: { x: e.target.x(), y: e.target.y() } }, ...drag.others.map((o) => ({ id: o.node.id(), patch: { x: o.node.x(), y: o.node.y() } }))]
      drag.others = []
      if (patches.length > 1 && p.onChangeMany) p.onChangeMany(patches)
      else p.onChange(l.id, patches[0].patch)
    },
  }
}
