import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { S, T, stack, textHeight, type Ctx } from './core'
import { hero, heroKind, mainTexts, versus } from './parts'

/**
 * DIAGONAL (el diseño por defecto) — el equipo grande arriba y un panel violeta lleno, cortado en diagonal,
 * que pisa la parte baja de los jugadores. Sobre el panel: los textos a la izquierda, el VS / marcador al costado
 * y la firma abajo a la derecha.
 */
export function diagonal(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + (land ? u * 3 : m)
  const bottom = H - c.safeBottom - m * (land ? 0.6 : 1)
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const out: Layer[] = []

  // textos a la izquierda. En X el VS / marcador va al costado; en vertical, debajo de los textos
  const colW = land ? (hasVs ? W * 0.3 : W * 0.55) : W - 2 * m
  const vsSize = land ? u * 20 : u * 12
  const textBottom = bottom - (land ? 0 : u * 8) - (hasVs && !land ? vsSize + u * 3 : 0)
  const placed = stack(c, mainTexts(c, m, colW, 'left', land ? 0.85 : 0.82), { bottom: textBottom })
  // sobre el violeta: frase manuscrita en ámbar, contexto en lila claro
  for (const l of placed as TextLayer[]) {
    if (l.name === 'Frase') Object.assign(l, { rotation: -3 })
    if (l.name === 'Contexto') l.fill = '#e6d4ff'
  }
  const textTop = Math.min(...placed.map((l) => l.y))
  const textEnd = Math.max(...placed.map((l) => (l.type === 'text' ? l.y + textHeight(l, c.v[l.bind ?? ''] ?? l.text) : l.y)))
  const panelY = Math.min(textTop - u * (land ? 8 : 9), H * (land ? 0.62 : 0.6))

  // el equipo arriba, grande, con las piernas debajo del panel
  const heroBottom = panelY + u * (k === 'mascot' ? -1 : 16)
  if (k === 'people') out.push(...hero(c, land ? W * 0.14 : -u * 6, top, land ? W * 0.72 : W + u * 12, heroBottom - top))
  else if (k !== 'none') out.push(...hero(c, W * 0.15, top, W * 0.7, heroBottom - top))

  out.push(S('Panel', 'slash', -u * 2, panelY, W + u * 4, H - panelY + u * 4, { fill: 'rgba(116,21,193,0.94)', stroke: C.lilac, strokeWidth: 3, glow: 0.4 }))
  out.push(...placed)

  if (hasVs) {
    const midY = land ? panelY + (H - panelY) / 2 + u * 2 : textEnd + u * 2.5 + vsSize / 2
    const cx = land ? W * 0.68 : m + vsSize * (d.type === 'resultado' ? 2.15 : 1.65)
    out.push(...versus(cx, midY - vsSize / 2, vsSize, d.type === 'resultado' ? 'score' : 'vs'))
  }

  // firma y hashtag abajo a la derecha
  const fy = H - c.safeBottom - u * 4.5
  out.push(T('Firma', 'signature', '', W / 2, fy, W / 2 - m, 'condensada', u * 3, { align: 'right', fill: C.white, opacity: 0.8, letterSpacing: u * 0.25 }))
  out.push(T('Hashtag', 'hashtag', '', W / 2, fy - u * 4, W / 2 - m, 'condensada', u * 3, { align: 'right', fill: C.white, letterSpacing: u * 0.1 }))
  return out
}
