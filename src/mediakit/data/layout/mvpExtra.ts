import { C } from '../../brand'
import type { Layer } from '../../types'
import { I, S, T, type Ctx } from './core'
import { agentLayer } from './parts'

const STATS: [string, string][] = [
  ['kdaLabel', 'kda'],
  ['acsLabel', 'acs'],
  ['hsLabel', 'hs'],
  ['agentLabel', 'agent'],
]

/**
 * MVP — Afiche (2, por defecto): "MVP" calado arriba, el jugador al centro con su nick en la camiseta y el agente
 *       difuminado detrás, y las estadísticas en una fila.
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
  out.push(T('Año', 'mvpTop', '', W / 2, top, W / 2 - m, cond, u * 5.4, { align: 'right', fill: C.lilac }))

  if (variant === 2) {
    // AFICHE (el diseño por defecto): "MVP" calado arriba al centro, el jugador grande al medio con su nick en la
    // camiseta, el agente difuminado detrás y las estadísticas en una fila abajo
    const mvpSize = land ? u * 46 : u * 40
    const mvpTop = top + (land ? -u * 2 : u * 2)
    const mvpW = land ? W * 0.36 : W * 0.66
    out.push(T('MVP calado', 'title', '', (W - mvpW) / 2, mvpTop, mvpW, cond, mvpSize, { fill: 'transparent', stroke: C.violetLight, strokeWidth: 3, autoFit: true, lineHeight: 0.85, glow: 0.5 }, 1))
    // el jugador: grande, centrado, desde debajo de las letras hasta abajo (se corta en el borde)
    const pTop = mvpTop + mvpSize * (land ? 0.42 : 0.58)
    const pW = land ? W * 0.5 : W * 0.95
    const pH = H - pTop + (land ? u * 2 : -c.safeBottom * 0.2)
    // el agente, difuminado detrás del jugador (aparece cuando se elige uno)
    // ocupando toda la placa (rellena la caja, mostrando la parte de arriba del agente) y detrás de todo
    out.unshift(agentLayer(c))
    out.push(I('Foto', 'person:0', '', (W - pW) / 2, pTop, pW, pH, { fadeBottom: 0.15, glow: 0.7 }))
    // "del partido" al costado de las letras
    out.push(T('Acento', 'mvpScript', '', W / 2 + mvpW * (land ? 0.2 : 0.14), mvpTop + mvpSize * 0.55, land ? W * 0.3 : W * 0.42, 'manuscrita', u * (land ? 6.5 : 6), { fill: C.ember, rotation: -8, autoFit: true, lineHeight: 1.3 }))
    // el nick: en X sobre la camiseta; en feed, arriba del hombro (x 696, y 800); en historia, arriba del otro hombro, en lila
    const nickSize = land ? u * 8 : u * 9
    if (land) out.push(T('Nickname', 'sub', '', W / 2 - W * 0.13, pTop + pH * 0.52, W * 0.17, cond, nickSize, { fill: C.ember, autoFit: true, lineHeight: 0.9, glow: 0.3 }))
    else if (fmt === 'feed') out.push(T('Nickname', 'sub', '', 696, 800, W * 0.3, cond, nickSize, { align: 'left', fill: C.lilac, autoFit: true, lineHeight: 0.9, glow: 0.5 }))
    else out.push(T('Nickname', 'sub', '', 232, 1035, W * 0.3, cond, u * 8, { align: 'left', fill: C.lilac, autoFit: true, lineHeight: 0.9, glow: 0.5 }))
    // estadísticas en una fila (en X, a todo el ancho; en vertical, sobre la foto)
    const rowY = land ? bottom - u * 12 : fmt === 'story' ? 1583 : H - c.safeBottom - u * 30
    const rx = land ? m : m + u * 2
    const rw = W - 2 * rx
    const cw = rw / 4
    out.push(S('Divisor', 'line', rx, rowY - u * 2.5, rw, 0, { stroke: 'rgba(199,155,255,0.35)', strokeWidth: 2 }))
    STATS.forEach(([l, v], i) => {
      // en feed y X, ACS y HS% (las del medio) caen sobre el brazo del jugador: van en negro para que se lean
      const dark = fmt !== 'story' && (i === 1 || i === 2)
      out.push(T(`Stat ${i}`, l, '', rx + i * cw, rowY, cw, cond, u * 2.6, { fill: dark ? '#0b0614' : i === 3 ? C.violetLight : C.lilac, letterSpacing: u * 0.3 }))
      out.push(T(`Valor ${i}`, v, '', rx + i * cw, rowY + u * 3.2, cw, cond, land ? u * 6.5 : u * 5.6, { autoFit: true, glow: dark ? 0 : 0.2, fill: dark ? '#0b0614' : C.white }))
    })
    return out
  }

  // DATOS: el jugador enorme a la derecha (cortado en el borde), "MVP" en itálica con "del partido" a la izquierda,
  // el nick arriba del hombro y las estadísticas en una grilla de 2×2 sobre la foto. El agente difuminado, detrás de todo
  out.unshift(agentLayer(c))
  const pTop = land ? u * 2 : c.safeTop - u * 6
  const pW = land ? W * 0.62 : W * 1.25
  const pX = land ? W * 0.44 : W * 0.32
  out.push(I('Foto', 'person:0', '', pX, pTop, pW, H - pTop + u * 2, { fadeBottom: 0.12, glow: 0.7, fit: 'contain' }))
  out.push(T('Nickname', 'sub', '', land ? W * 0.44 : W * 0.48, land ? H * 0.4 : H * 0.42, land ? W * 0.18 : W * 0.32, cond, land ? u * 11 : u * 10, { align: 'left', fill: C.lilac, autoFit: true, lineHeight: 0.9, glow: 0.4 }))
  const mx = land ? m : m + u * 2
  const my = land ? H * 0.3 : H * 0.505
  out.push(T('Titular', 'title', '', mx, my, land ? W * 0.3 : W * 0.4, cond, land ? u * 16 : u * 11, { align: 'left', italic: true, lineHeight: 0.9, glow: 0.3 }))
  out.push(T('Acento', 'mvpScript', '', mx - u, my + (land ? u * 11 : u * 7.5), land ? W * 0.34 : W * 0.5, 'manuscrita', land ? u * 6.5 : u * 6, { align: 'left', fill: C.ember, rotation: -6, autoFit: true, lineHeight: 1.3 }))
  const gx = mx
  const gw = land ? W * 0.4 : W * 0.8
  const gy = land ? H * 0.55 : H * 0.6
  const gap = u * 1.8
  const bw = (gw - gap) / 2
  const bh = land ? u * 13 : u * 11
  STATS.forEach(([l, v], i) => {
    const bx = gx + (i % 2) * (bw + gap)
    const by = gy + Math.floor(i / 2) * (bh + gap)
    out.push(S(`Caja ${i}`, 'rect', bx, by, bw, bh, { fill: 'rgba(76,29,149,0.45)', stroke: 'rgba(142,68,255,0.55)', strokeWidth: 2 }))
    out.push(T(`Stat ${i}`, l, '', bx + u * 2, by + u * 1.8, bw - u * 4, cond, u * 2.4, { align: 'left', fill: C.lilac, letterSpacing: u * 0.25 }))
    out.push(T(`Valor ${i}`, v, '', bx + u * 2, by + bh * 0.4, bw - u * 4, cond, bh * 0.45, { align: 'left', autoFit: true }))
  })
  return out
}
