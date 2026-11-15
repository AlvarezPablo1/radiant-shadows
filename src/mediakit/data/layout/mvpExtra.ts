import { C } from '../../brand'
import type { Layer } from '../../types'
import { I, S, T, type Ctx } from './core'
import { hero, heroKind } from './parts'

const STATS: [string, string][] = [
  ['kdaLabel', 'kda'],
  ['acsLabel', 'acs'],
  ['hsLabel', 'hs'],
  ['agentLabel', 'agent'],
]

/**
 * MVP — Afiche (2): "MVP" gigante calado detrás del jugador, nickname enorme y estadísticas en una fila.
 *       Datos (3): el jugador a un lado y las estadísticas en tarjetas grandes, con los números protagonistas.
 * En los dos, el "del partido" va inclinado justo debajo del jugador.
 */
export function mvpExtra(c: Ctx, variant: number): Layer[] {
  const { W, H, u, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m * 0.8
  const bottom = H - c.safeBottom - m * 0.8
  const cond = 'condensada'
  const out: Layer[] = []
  const photo = (x: number, y: number, w: number, h: number) => (heroKind(c) === 'person' ? I('Foto', 'person:0', '', x, y, w, h, { fadeBottom: 0.18, glow: 0.6 }) : hero(c, x, y, w, h)[0])
  out.push(T('Año', 'mvpTop', '', W / 2, top, W / 2 - m, cond, u * 5.4, { align: 'right', fill: C.lilac }))

  if (variant === 2) {
    // AFICHE
    const rowY = bottom - u * 10
    const cw = (W - 2 * m) / 4
    STATS.forEach(([l, v], i) => {
      out.push(T(`Stat ${i}`, l, '', m + i * cw, rowY, cw, cond, u * 2.8, { fill: C.lilac, letterSpacing: u * 0.25 }))
      out.push(T(`Valor ${i}`, v, '', m + i * cw, rowY + u * 3.5, cw, cond, u * 6, { autoFit: true }))
    })
    out.push(S('Divisor', 'line', m, rowY - u * 3, W - 2 * m, 0, { stroke: 'rgba(199,155,255,0.3)', strokeWidth: 2 }))
    const nameY = rowY - u * 9
    const nickSize = land ? u * 12 : u * 15
    const nickY = nameY - nickSize * 0.95
    out.push(T('Nombre real', 'info', '', m, nameY, W - 2 * m, 'manuscrita', u * 4, { fill: C.lilac }))
    out.push(T('Nickname', 'sub', '', m, nickY, W - 2 * m, cond, nickSize, { fill: C.ember, autoFit: true, lineHeight: 0.9, glow: 0.4 }))
    const photoBottom = nickY - u * 9
    out.unshift(photo(land ? W * 0.3 : W * 0.1, top + u * 6, land ? W * 0.4 : W * 0.8, photoBottom - (top + u * 6)))
    out.unshift(T('MVP calado', 'title', '', m * 0.5, top + u * 4, W - m, cond, land ? u * 50 : u * 58, { fill: 'transparent', stroke: C.violetLight, strokeWidth: 3, autoFit: true, lineHeight: 0.85, glow: 0.3 }))
    out.push(T('Acento', 'mvpScript', '', W * 0.3, photoBottom + u * 0.5, W * 0.4, 'manuscrita', u * 7, { fill: C.ember, rotation: -6, autoFit: true, lineHeight: 1.3 }))
    return out
  }

  // DATOS
  const px = land ? W * 0.52 : W * 0.3
  const pw = land ? W * 0.46 : W * 0.7
  const photoBottom = land ? H * 0.8 : top + (bottom - top) * 0.45
  out.unshift(photo(px, top + u * 4, pw, photoBottom - (top + u * 4)))
  out.push(T('Acento', 'mvpScript', '', px + pw * 0.15, photoBottom + u * 0.5, pw * 0.7, 'manuscrita', u * 7, { fill: C.ember, rotation: -6, autoFit: true, lineHeight: 1.3 }))
  const tx = m
  const tw = land ? W * 0.46 - m : W - 2 * m
  const ty = land ? top + u * 10 : photoBottom + u * 9
  out.push(T('Titular', 'title', '', tx, ty, tw, cond, land ? u * 16 : u * 14, { align: 'left', lineHeight: 0.9, glow: 0.3 }))
  out.push(T('Nickname', 'sub', '', tx, ty + u * (land ? 14 : 12.5), tw, cond, land ? u * 9 : u * 9, { align: 'left', fill: C.ember, autoFit: true, lineHeight: 0.9 }))
  out.push(T('Nombre real', 'info', '', tx, ty + u * (land ? 22.5 : 21), tw, 'manuscrita', u * 3.6, { align: 'left', fill: C.lilac }))
  const gy = ty + u * (land ? 29 : 27)
  const gap = u * 2.5
  const bw = (tw - gap) / 2
  const bh = Math.min(u * 15, (bottom - gy - gap) / 2)
  STATS.forEach(([l, v], i) => {
    const bx = tx + (i % 2) * (bw + gap)
    const by = gy + Math.floor(i / 2) * (bh + gap)
    out.push(S(`Caja ${i}`, 'rect', bx, by, bw, bh, { fill: 'rgba(76,29,149,0.38)', stroke: 'rgba(142,68,255,0.45)', strokeWidth: 2 }))
    out.push(T(`Stat ${i}`, l, '', bx + u * 2.5, by + u * 2, bw - u * 5, cond, u * 2.8, { align: 'left', fill: C.lilac, letterSpacing: u * 0.25 }))
    out.push(T(`Valor ${i}`, v, '', bx + u * 2.5, by + bh * 0.38, bw - u * 5, cond, bh * 0.55, { align: 'left', autoFit: true }))
  })
  return out
}
