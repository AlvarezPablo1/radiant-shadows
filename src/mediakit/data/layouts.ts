import type { FormatId, Layer, PostDoc, Roster } from '../types'
import { FORMATS } from '../types'
import { computeValues } from './postTypes'
import type { Ctx } from './layout/core'
import { contour } from './layout/contour'
import { diagonal } from './layout/diagonal'
import { frame } from './layout/frame'
import { landscape } from './layout/landscape'
import { brandMarks } from './layout/marks'
import { mvp } from './layout/mvp'
import { mvpExtra } from './layout/mvpExtra'
import { neon } from './layout/neon'
import { portrait } from './layout/portrait'
import { poster } from './layout/poster'
import { broadcast } from './layout/broadcast'
import { typo } from './layout/typo'

export { I, S, T, TEXT_SCALE, newId } from './layout/core'
export { DEFAULT_OVERLAP, reflowRow } from './layout/rows'

/** diseños por número (los de MVP aparte). Los que ya no existen (1 Lateral, 2 Impacto, 4 Paneles) pasan a Centrado */
const DESIGNS: Record<number, (c: Ctx) => Layer[]> = {
  0: (c) => (c.fmt === 'x' ? landscape(c) : portrait(c)),
  3: neon,
  5: typo,
  6: poster,
  7: frame,
  8: contour,
  9: broadcast,
  10: diagonal,
}

export function buildLayout(d: PostDoc, r: Roster, fmt: FormatId): Layer[] {
  const { w: W, h: H } = FORMATS[fmt]
  const u = Math.min(W, H) / 100
  const c: Ctx = { W, H, fmt, d, r, v: computeValues(d, r), u, safeTop: fmt === 'story' ? 210 : 0, safeBottom: fmt === 'story' ? 250 : 0 }
  const layers = d.type === 'mvp' ? (d.variant >= 2 ? mvpExtra(c, d.variant) : mvp(c, d.variant === 1 ? 1 : 0)) : (DESIGNS[d.variant] ?? DESIGNS[0])(c)
  return brandMarks(c, layers)
}
