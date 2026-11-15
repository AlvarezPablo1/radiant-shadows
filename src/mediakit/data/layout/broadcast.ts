import { C } from '../../brand'
import type { Layer } from '../../types'
import { S, T, type Ctx } from './core'
import { hero, heroKind, versus } from './parts'

/**
 * TRANSMISIÓN — como un zócalo de stream: el equipo grande y abajo una barra oscura con borde violeta,
 * una etiqueta violeta con la frase, el titular, el contexto y el VS / marcador a la derecha.
 */
export function broadcast(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const out: Layer[] = []
  const cond = 'condensada'

  const barH = land ? u * 26 : u * 30
  const barY = H - c.safeBottom - barH - (land ? 0 : u * 2)
  // el equipo, apoyado sobre la barra
  if (k !== 'none') out.push(...(k === 'people' ? hero(c, -u * 6, top + u * 4, W + u * 12, barY - top) : hero(c, W * 0.15, top + u * 4, W * 0.7, barY - top)))

  out.push(S('Barra', 'rect', 0, barY, W, H - barY, { fill: 'rgba(10,2,22,0.9)', stroke: 'transparent', strokeWidth: 0 }))
  out.push(S('Borde de la barra', 'line', 0, barY, W, 0, { stroke: C.violetLight, strokeWidth: 6, glow: 0.6 }))
  // etiqueta violeta con la frase
  const tagH = u * 7
  out.push(S('Etiqueta', 'rect', m, barY - tagH * 0.6, land ? W * 0.3 : W * 0.5, tagH, { fill: 'rgba(122,40,226,0.95)', stroke: 'transparent', strokeWidth: 0 }))
  out.push(T('Frase', 'kicker', '', m + u * 2, barY - tagH * 0.6 + tagH * 0.2, (land ? W * 0.3 : W * 0.5) - u * 4, cond, tagH * 0.62, { align: 'left', uppercase: true, letterSpacing: u * 0.3, autoFit: true }))

  // dentro de la barra: titular y contexto a la izquierda; VS / marcador o dato a la derecha
  const colW = hasVs ? W * 0.55 : W - 2 * m
  out.push(T('Titular', 'title', '', m, barY + u * 6, colW, cond, land ? u * 10.5 : u * 11, { align: 'left', autoFit: true, lineHeight: 0.95, glow: 0.3 }))
  out.push(T('Contexto', 'sub', '', m, barY + u * (land ? 18 : 19.5), colW, cond, u * 3.6, { align: 'left', fill: C.lilac, letterSpacing: u * 0.3 }))
  if (hasVs) {
    const size = land ? u * 9 : u * 9.5
    out.push(...versus(W - m - size * (d.type === 'resultado' ? 2.6 : 2.2), barY + u * 7, size, d.type === 'resultado' ? 'score' : 'vs'))
  } else out.push(T('Detalle', 'info', '', W * 0.5, barY + u * 9, W * 0.5 - m, 'manuscrita', u * 4, { align: 'right', fill: C.ember }))
  out.push(T('Hashtag', 'hashtag', '', m, H - c.safeBottom - u * (land ? 4.5 : 3), W / 2 - m, cond, u * 2.8, { align: 'left', fill: C.violetLight, letterSpacing: u * 0.1 }))
  out.push(T('Firma', 'signature', '', W / 2, H - c.safeBottom - u * (land ? 4.5 : 3), W / 2 - m, cond, u * 2.8, { align: 'right', opacity: 0.75, letterSpacing: u * 0.25 }))
  return out
}
