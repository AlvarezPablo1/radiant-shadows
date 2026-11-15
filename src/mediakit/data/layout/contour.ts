import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { S, T, stack, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

/**
 * CONTORNO — el titular gigante, sólo con el contorno violeta, cruza la placa detrás del equipo;
 * abajo, la frase, el contexto y el VS / marcador sobre un fundido oscuro.
 */
export function contour(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m
  const bottom = H - c.safeBottom - m - u * 8
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const out: Layer[] = []

  // titular calado (sólo el borde), enorme, detrás de todo
  const big = land ? u * 30 : u * 34
  out.push(T('Titular contorno', 'title', '', m * 0.5, top + (land ? u * 2 : u * 10), W - m, 'condensada', big, { fill: 'transparent', stroke: C.violetLight, strokeWidth: 3, autoFit: true, lineHeight: 0.9, glow: 0.3 }))

  // abajo: la frase, el resto de los textos (sin el titular sólido) y el VS
  let textBottom = bottom
  const vs: Layer[] = []
  if (hasVs) {
    const size = land ? u * 12 : u * 14
    vs.push(...versus(W / 2, bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    textBottom = bottom - size - u * 3
  }
  const texts = mainTexts(c, m, W - 2 * m, 'center', land ? 0.9 : 1).filter((t) => !(t && typeof t === 'object' && t.name === 'Titular'))
  const placed = stack(c, texts, { bottom: textBottom })
  const kick = placed.find((l) => l.name === 'Frase') as TextLayer | undefined
  if (kick) Object.assign(kick, { fontSize: kick.fontSize * 1.5, rotation: -4 })
  const textTop = Math.min(...placed.map((l) => l.y))

  // el equipo, delante del titular calado
  const heroTop = top + (land ? u * 8 : u * 20)
  const heroBottom = textTop + u * (k === 'mascot' ? -3 : 10)
  if (k !== 'none') out.push(...(k === 'people' ? hero(c, land ? W * 0.12 : -u * 6, heroTop, land ? W * 0.76 : W + u * 12, heroBottom - heroTop) : hero(c, W * 0.15, heroTop, W * 0.7, heroBottom - heroTop)))
  const fadeTop = textTop - u * 16
  out.push(S('Fundido', 'rect', 0, fadeTop, W, H - fadeTop, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))
  out.push(...placed, ...vs, ...footer(c, 'center'))
  return out
}
