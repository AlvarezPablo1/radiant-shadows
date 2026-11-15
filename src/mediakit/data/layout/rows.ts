import { C } from '../../brand'
import type { ImageLayer, Layer, ShapeLayer } from '../../types'

/* ---------- filas de jugadores que se reacomodan solas ---------- */

/** posiciones armónicas para una fila "stage": el del medio más grande y adelante */
export const DEFAULT_OVERLAP = 0.4

function stageSlots(n: number, r: { x: number; y: number; w: number; h: number; overlap?: number; dense?: boolean }) {
  // escalonados en profundidad: el del centro adelante y los de los costados apenas más chicos
  // y un poco más arriba (más "atrás"), en vez de una pirámide marcada apoyada abajo.
  // El del centro (el capitán, si hay) queda siempre en el medio exacto de la zona; con un número
  // par de jugadores sobra uno a la izquierda. La "separación" sólo acerca o aleja a los demás.
  const c = Math.floor(n / 2)
  const step = n >= 5 ? 0.06 : 0.07
  const scales = Array.from({ length: n }, (_, i) => 1 - Math.abs(i - c) * step)
  const sum = scales.reduce((a, b) => a + b, 0)
  // en X (filas anchas y bajas) se superponen más: cada jugador sale bastante más grande
  const extra = r.dense ? 0.14 : 0
  const ref = 0.4 + extra
  const base = r.w / (sum * (1 - ref) + scales[n - 1] * ref)
  const overlap = Math.min(0.7, Math.max(0, (r.overlap ?? DEFAULT_OVERLAP) + extra))
  const lefts: number[] = []
  let x = 0
  for (const k of scales) {
    lefts.push(x)
    x += base * k * (1 - overlap)
  }
  const shift = r.x + r.w / 2 - (lefts[c] + (base * scales[c]) / 2)
  const far = Math.max(1, c, n - 1 - c)
  return scales.map((k, i) => {
    const bw = base * k,
      bh = r.h * k
    // cuanto más atrás, más arriba apoya los pies (perspectiva)
    const back = (1 - k) * r.h * 0.9
    return { x: lefts[i] + shift, y: r.y + (r.h - bh) - back, width: bw, height: bh, dist: Math.abs(i - c) / far }
  })
}

/**
 * Reacomoda las filas de jugadores: cuando se oculta uno o se lo arrastra a otro lugar,
 * los visibles se reparten de nuevo (orden según su posición X actual) con tamaños armónicos.
 */
export function reflowRow(layers: Layer[]): Layer[] {
  const out = [...layers]
  const photos = out.filter((l): l is ImageLayer => l.type === 'image' && !!l.row && l.row.role === 'photo')
  if (!photos.length) return out
  const kind = photos[0].row!.kind
  const r = photos[0].row!
  const visible = photos.filter((l) => l.visible).sort((a, b) => a.x + a.width / 2 - (b.x + b.width / 2))
  const n = visible.length
  const idx = (id: string) => out.findIndex((l) => l.id === id)

  if (kind === 'stage') {
    const slots = stageSlots(Math.max(1, n), r)
    visible.forEach((l, i) => {
      // si se le cambió el tamaño a mano, se respeta (centrado en su lugar y apoyado abajo)
      const k = l.row?.scale ?? 1
      const s = slots[i]
      const w = s.width * k,
        h = s.height * k
      out[idx(l.id)] = { ...l, x: s.x + (s.width - w) / 2, y: s.y + s.height - h, width: w, height: h }
    })
    // profundidad: el del centro adelante
    const positions = photos.map((l) => idx(l.id)).sort((a, b) => a - b)
    const byDepth = [...photos].sort((a, b) => {
      const da = visible.includes(a) ? slots[visible.indexOf(a)].dist : 2
      const db = visible.includes(b) ? slots[visible.indexOf(b)].dist : 2
      return db - da
    })
    const current = byDepth.map((l) => out[idx(l.id)])
    positions.forEach((pos, i) => (out[pos] = current[i]))
    return out
  }

  const panels = out.filter((l): l is ShapeLayer => l.type === 'shape' && !!l.row && l.row.role === 'panel')

  // grilla fija (historias: 3 columnas): las fotos llenan cada celda y las columnas de color van de arriba a abajo
  if (r.cols) {
    const cols = r.cols
    const rows = Math.max(1, Math.ceil(n / cols))
    const cw = r.w / cols
    const ch = (r.ph ?? r.h) / rows
    visible.forEach((p, i) => {
      out[idx(p.id)] = { ...out[idx(p.id)], x: r.x + (i % cols) * cw, y: (r.py ?? r.y) + Math.floor(i / cols) * ch, width: cw, height: ch } as Layer
    })
    panels.forEach((pn, i) => {
      out[idx(pn.id)] = i < cols ? { ...pn, visible: true, x: r.x + i * cw, y: r.y, width: cw, height: r.h, fill: i % 2 ? C.violet : '#2A1846' } : { ...pn, visible: false }
    })
    // celda libre (ej. 5 jugadores en 3 columnas): la ocupa el isotipo
    const filler = out.find((l): l is ImageLayer => l.type === 'image' && l.row?.role === 'filler')
    if (filler) {
      const free = rows * cols - n
      const i = n
      const sz = Math.min(cw, ch) * 0.6
      out[idx(filler.id)] = free > 0
        ? { ...filler, visible: true, x: r.x + (i % cols) * cw + (cw - sz) / 2, y: (r.py ?? r.y) + Math.floor(i / cols) * ch + (ch - sz) / 2, width: sz, height: sz }
        : { ...filler, visible: false }
    }
    return out
  }

  // paneles: columnas iguales, colores alternados; el panel acompaña a su foto
  const colW = r.w / Math.max(1, n)
  for (const p of photos) {
    const panel = panels.find((x) => x.row!.slot === p.row!.slot)
    const i = visible.indexOf(p)
    if (i < 0) {
      if (panel) out[idx(panel.id)] = { ...panel, visible: false }
      continue
    }
    const x = r.x + i * colW
    out[idx(p.id)] = { ...out[idx(p.id)], x, y: r.py ?? r.y, width: colW, height: r.ph ?? r.h } as Layer
    if (panel) out[idx(panel.id)] = { ...panel, visible: true, x, y: r.y, width: colW, height: r.h, fill: i % 2 ? C.violet : '#2A1846' }
  }
  return out
}

