import type { FormatId, Layer, PostDoc, Roster } from '../types'
import { FORMATS } from '../types'
import { computeValues } from './postTypes'
import type { Ctx } from './layout/core'
import { contour } from './layout/contour'
import { designOf } from './designs'
import { frame } from './layout/frame'
import { landscape } from './layout/landscape'
import { brandMarks } from './layout/marks'
import { mvp } from './layout/mvp'
import { mvpExtra } from './layout/mvpExtra'
import { neon } from './layout/neon'
import { portrait } from './layout/portrait'
import { poster } from './layout/poster'
import { broadcast } from './layout/broadcast'
import { birthdayPoster } from './layout/birthday'
import { result } from './layout/result'

export { I, S, T, TEXT_SCALE, newId } from './layout/core'
export { DEFAULT_OVERLAP, reflowRow } from './layout/rows'

/** diseños por número (los de MVP aparte). Cuáles se ofrecen en cada publicación: data/designs.ts */
const DESIGNS: Record<number, (c: Ctx) => Layer[]> = {
  0: (c) => (c.fmt === 'x' ? landscape(c) : portrait(c)),
  3: neon,
  6: poster,
  7: frame,
  8: contour,
  9: broadcast,
}

/** publicaciones con su propia versión de un diseño (resultados y cumpleaños) */
function special(c: Ctx, v: number): Layer[] | null {
  if (c.d.type === 'resultado') return result(c, v === 8 ? 'contour' : v === 0 ? 'center' : 'poster')
  if (c.d.type === 'cumple' && v === 6) return birthdayPoster(c)
  return null
}

export function buildLayout(d: PostDoc, r: Roster, fmt: FormatId): Layer[] {
  const { w: W, h: H } = FORMATS[fmt]
  const u = Math.min(W, H) / 100
  const c: Ctx = { W, H, fmt, d, r, v: computeValues(d, r), u, safeTop: fmt === 'story' ? 210 : 0, safeBottom: fmt === 'story' ? 250 : 0 }
  const v = designOf(d)
  const layers = d.type === 'mvp' ? (v >= 2 ? mvpExtra(c, v) : mvp(c, 0)) : (special(c, v) ?? (DESIGNS[v] ?? DESIGNS[0])(c))
  // cumpleaños en contorno: el "FELIZ" arriba a la izquierda (en X, arriba al centro), un poco inclinado
  if (d.type === 'cumple' && v === 8) {
    const feliz = layers.find((l) => l.name === 'Frase')
    if (feliz && feliz.type === 'text') Object.assign(feliz, fmt === 'x' ? { x: 718, y: 52, rotation: -4, align: 'left' } : { x: 76, y: 154 + c.safeTop, rotation: -4, align: 'left' })
  }
  // el link de Twitch ("Dónde verlo") siempre en una sola línea: se achica hasta entrar en su caja
  for (const l of layers) if (l.type === 'text' && l.bind === 'foot') l.autoFit = true
  return brandMarks(c, layers)
}
