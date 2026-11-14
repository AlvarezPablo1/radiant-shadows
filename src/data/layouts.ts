import type { FormatId, Layer, PostDoc, Roster } from '../types'
import { FORMATS } from '../types'
import { computeValues } from './postTypes'
import type { Ctx } from './layout/core'
import { landscape } from './layout/landscape'
import { mvp } from './layout/mvp'
import { neon } from './layout/neon'
import { portrait } from './layout/portrait'
import { typo } from './layout/typo'
import { frame } from './layout/frame'
import { poster } from './layout/poster'

export { I, S, T, TEXT_SCALE, newId } from './layout/core'
export { DEFAULT_OVERLAP, reflowRow } from './layout/rows'

export function buildLayout(d: PostDoc, r: Roster, fmt: FormatId): Layer[] {
  const { w: W, h: H } = FORMATS[fmt]
  const u = Math.min(W, H) / 100
  const c: Ctx = { W, H, fmt, d, r, v: computeValues(d, r), u, safeTop: fmt === 'story' ? 210 : 0, safeBottom: fmt === 'story' ? 250 : 0 }
  if (d.type === 'mvp') return mvp(c, d.variant === 1 ? 1 : 0)
  // el diseño "Paneles" (4) ya no existe: los guardados con ese diseño pasan a Centrado
  if (d.variant === 6) return poster(c)
  if (d.variant === 7) return frame(c)
  const variant = d.variant % 6 === 4 ? 0 : d.variant % 6
  if (variant === 3) return neon(c)
  if (variant === 5) return typo(c)
  return fmt === 'x' ? landscape(c, variant % 3) : portrait(c, variant % 3)
}

