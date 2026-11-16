import { C } from '../../brand'
import type { Layer } from '../../types'
import { I, S, stack, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

/**
 * MARCO — el equipo dentro de una tarjeta violeta con esquinas en ámbar (como un cromo).
 * Vertical: con una sola persona, la foto grande sale de la tarjeta hasta el borde de abajo y
 * los textos van encima, a la izquierda; con varios, los textos van debajo de la tarjeta.
 * X: la tarjeta ancha a la izquierda y los textos alineados a la derecha.
 */
export function frame(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m * 0.8
  const bottom = H - c.safeBottom - m * 0.8
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const big = !land && k === 'person'
  const out: Layer[] = []

  // tarjeta en X: dos tercios del ancho; textos en la columna de la derecha
  const cardX = land ? m + u * 2.5 : m
  const cardW = land ? W * 0.66 : big ? W * 0.79 : W - 2 * m
  const colX = land ? cardX + cardW + u * 4 : m
  const colW = land ? W - colX - m : big ? W * 0.62 : W - 2 * m
  const align = land ? ('right' as const) : ('left' as const)
  const size = u * (land ? 12 : 13)
  const bottomText = bottom - u * (land ? 13 : 9) - (hasVs ? size + u * 3 : 0)
  const placed = stack(c, mainTexts(c, colX, colW, align, land ? 0.8 : 0.82), { bottom: bottomText })
  const textTop = Math.min(...placed.map((l) => l.y))

  const cardY = land ? u * 7.8 : big ? top + u * 12 : top + (hasVs ? 0 : u * 12)
  const cardH = land ? H - u * 7.8 - u * 9 : big ? (fmt === 'story' ? H * 0.42 : u * 62.8) : textTop - u * 5 - cardY
  out.push(S('Tarjeta', 'rect', cardX, cardY, cardW, cardH, { fill: 'rgba(76,29,149,0.38)', stroke: 'rgba(142,68,255,0.5)', strokeWidth: 2 }))
  out.push(S('Esquinas', 'frame', cardX + u * 2, cardY + u * 2, cardW - u * 4, cardH - u * 4, { stroke: C.ember, strokeWidth: 3 }))
  // la foto: en vertical con una persona, desde el borde de arriba de la tarjeta hasta abajo de todo (se sale del marco)
  if (big) out.push(...hero(c, cardX - u * 4, cardY - u * 3, cardW + u * 8, Math.min(H - cardY + u * 3, (cardW + u * 8) * 1.3)))
  else if (k !== 'none') out.push(...hero(c, cardX + u * 1.5, cardY + u * 4, cardW - u * 3, cardH - u * 4))
  else out.push(I('Isotipo', 'logo:team', '', cardX + cardW / 2 - u * 18, cardY + cardH / 2 - u * 18, u * 36, u * 36, { glow: 0.6 }))
  // con la foto grande, un fundido abajo para que los textos se lean encima
  if (big) out.push(S('Fundido', 'rect', 0, textTop - u * 14, W, H - textTop + u * 14, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))
  // logo (en los partidos ya está en el VS)
  if (!hasVs && !land) out.push(I('Logo', 'logo:team', '', m, top, u * 9, u * 9, { glow: 0.3 }))

  out.push(...placed)
  if (hasVs) {
    const vx = land ? colX + colW - size * (d.type === 'resultado' ? 2.15 : 1.65) - size * 0.4 : colX + size * (d.type === 'resultado' ? 2.15 : 1.65)
    out.push(...versus(vx, bottomText + u * 2, size, d.type === 'resultado' ? 'score' : 'vs'))
  }
  // pie: en X, firma y hashtag en la columna de la derecha, uno arriba del otro
  out.push(
    ...footer(c, 'left').map((l) =>
      land ? { ...l, x: colX, width: colW, align: 'right' as const, y: l.name === 'Firma' ? H - u * 11 : H - u * 6.5 } : l,
    ),
  )
  return out
}
