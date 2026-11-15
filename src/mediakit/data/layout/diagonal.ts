import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { S, stack, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

/**
 * DIAGONAL — un panel violeta lleno, cortado en diagonal, sube desde abajo y pisa la parte baja del equipo;
 * los textos van en blanco sobre el violeta, alineados a la izquierda.
 */
export function diagonal(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m
  const bottom = H - c.safeBottom - m - u * 8
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const out: Layer[] = []

  let textBottom = bottom
  const vs: Layer[] = []
  if (hasVs) {
    const size = land ? u * 11 : u * 13
    vs.push(...versus(m + size * (d.type === 'resultado' ? 2.15 : 1.65), bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    textBottom = bottom - size - u * 3
  }
  const placed = stack(c, mainTexts(c, m, land ? W * 0.55 : W - 2 * m, 'left', land ? 0.85 : 0.95), { bottom: textBottom })
  // sobre el violeta: frase en blanco manuscrita y contexto en lila claro
  for (const l of placed as TextLayer[]) {
    if (l.name === 'Frase') Object.assign(l, { fill: C.white, rotation: -3 })
    if (l.name === 'Contexto') l.fill = '#e6d4ff'
  }
  const textTop = Math.min(...placed.map((l) => l.y))
  const panelY = textTop - u * (land ? 10 : 12)

  // el equipo arriba (en X, corrido a la derecha) y el panel encima de sus piernas
  const heroBottom = panelY + u * (k === 'mascot' ? -1 : 14)
  if (k !== 'none') out.push(...(k === 'people' ? hero(c, land ? W * 0.3 : -u * 6, top, land ? W * 0.7 : W + u * 12, heroBottom - top) : hero(c, land ? W * 0.5 : W * 0.12, top, land ? W * 0.45 : W * 0.76, heroBottom - top)))
  out.push(S('Panel', 'slash', -u * 2, panelY, W + u * 4, H - panelY + u * 4, { fill: 'rgba(122,40,226,0.92)', stroke: C.lilac, strokeWidth: 3, glow: 0.4 }))
  out.push(...placed, ...vs, ...footer(c, 'left').map((l) => ({ ...l, fill: C.white })))
  return out
}
