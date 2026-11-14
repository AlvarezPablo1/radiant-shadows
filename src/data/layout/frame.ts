import { C } from '../../brand'
import type { Layer } from '../../types'
import { I, S, stack, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

/**
 * MARCO — el equipo dentro de una tarjeta violeta con esquinas en ámbar (como un cromo),
 * y los textos alineados a la izquierda debajo (vertical) o al costado (X).
 */
export function frame(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m * 0.8
  const bottom = H - c.safeBottom - m * 0.8
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const out: Layer[] = []

  // textos (alineados a la izquierda) apilados desde abajo, con el VS / marcador debajo
  const colX = land ? m + W * 0.52 + u * 6 : m
  const colW = land ? W - colX - m : W - 2 * m
  const size = u * (land ? 12 : 13)
  const bottomText = bottom - u * 9 - (hasVs ? size + u * 3 : 0)
  const placed = stack(c, mainTexts(c, colX, colW, 'left', land ? 0.85 : 0.82), { bottom: bottomText })
  const textTop = Math.min(...placed.map((l) => l.y))

  // tarjeta: a la izquierda en X; en vertical, todo el espacio libre arriba de los textos
  const cardX = m
  const cardY = land ? m : top + (hasVs ? 0 : u * 12)
  const cardW = land ? W * 0.52 : W - 2 * m
  const cardH = land ? H - 2 * m : textTop - u * 5 - cardY
  out.push(S('Tarjeta', 'rect', cardX, cardY, cardW, cardH, { fill: 'rgba(76,29,149,0.38)', stroke: 'rgba(142,68,255,0.5)', strokeWidth: 2 }))
  if (k !== 'none') out.push(...hero(c, cardX + u * 1.5, cardY + u * 4, cardW - u * 3, cardH - u * 4))
  else out.push(I('Isotipo', 'logo:team', '', cardX + cardW / 2 - u * 18, cardY + cardH / 2 - u * 18, u * 36, u * 36, { glow: 0.6 }))
  out.push(S('Esquinas', 'frame', cardX + u * 2, cardY + u * 2, cardW - u * 4, cardH - u * 4, { stroke: C.ember, strokeWidth: 3 }))
  // logo (en los partidos ya está en el VS)
  if (!hasVs) out.push(I('Logo', 'logo:team', '', land ? colX : m, land ? m : top, u * 9, u * 9, { glow: 0.3 }))

  out.push(...placed)
  if (hasVs) out.push(...versus(colX + size * (d.type === 'resultado' ? 2.15 : 1.65), bottomText + u * 2, size, d.type === 'resultado' ? 'score' : 'vs'))
  out.push(
    ...footer(c, 'left').map((l) =>
      land ? (l.name === 'Firma' ? { ...l, x: colX, width: colW, align: 'left' as const, y: l.y - u * 4.6 } : { ...l, x: colX, width: colW }) : l,
    ),
  )
  return out
}
