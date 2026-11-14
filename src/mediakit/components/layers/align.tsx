import type { Layer } from '../../types'

/* ---------- alineación en 9 puntos ---------- */

const POINTS = [
  ['tl', 'Arriba a la izquierda'],
  ['tc', 'Arriba al centro'],
  ['tr', 'Arriba a la derecha'],
  ['ml', 'Centro a la izquierda'],
  ['mc', 'Centro'],
  ['mr', 'Centro a la derecha'],
  ['bl', 'Abajo a la izquierda'],
  ['bc', 'Abajo al centro'],
  ['br', 'Abajo a la derecha'],
] as const

export function AlignGrid({ onAlign }: { onAlign: (pt: string) => void }) {
  return (
    <div className="align-grid" role="group" aria-label="Alinear en el lienzo">
      {POINTS.map(([id, label]) => (
        <button key={id} title={label} aria-label={label} onClick={() => onAlign(id)}>
          <i />
        </button>
      ))}
    </div>
  )
}

/** delta para llevar una caja al punto elegido dentro de los márgenes */
export function alignDelta(b: { x: number; y: number; w: number; h: number }, pt: string, W: number, H: number, safeTop: number, safeBottom: number) {
  const m = Math.min(W, H) * 0.07
  const top = m + safeTop,
    bottom = H - m - safeBottom
  const tx = pt[1] === 'l' ? m : pt[1] === 'r' ? W - m - b.w : (W - b.w) / 2
  const ty = pt[0] === 't' ? top : pt[0] === 'b' ? bottom - b.h : (top + bottom - b.h) / 2
  return { dx: tx - b.x, dy: ty - b.y }
}

/** caja aproximada de un elemento (en coordenadas del diseño) */
export function bbox(l: Layer, values: Record<string, string>) {
  if (l.type === 'text') {
    const v = (l.bind ? values[l.bind] : l.text) ?? ''
    const lines = Math.max(1, v.split('\n').length)
    return { x: l.x, y: l.y, w: l.width, h: lines * l.fontSize * l.lineHeight }
  }
  return { x: l.x, y: l.y, w: l.width, h: Math.max(l.height, 1) }
}
