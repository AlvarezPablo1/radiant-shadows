import { C } from '../../brand'
import type { ImageLayer, Layer } from '../../types'
import { I, S, T, type Ctx } from './core'
import { agentLayer, hero, heroKind } from './parts'

/**
 * MVP — Clásico (tabla de estadísticas + foto grande) o Tarjeta (foto enmarcada,
 * nickname calado vertical y estadísticas en grilla).
 */
export function mvp(c: Ctx, variant: number): Layer[] {
  const { W, H, u, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m * 0.8
  const bottom = H - c.safeBottom - m * 0.8
  const cond = 'condensada'
  const out: Layer[] = []
  const k = heroKind(c)
  const photo = (x: number, y: number, w: number, h: number, extra: Partial<ImageLayer> = {}) =>
    k === 'person' ? I('Foto', 'person:0', '', x, y, w, h, { fadeBottom: 0.15, ...extra }) : hero(c, x, y, w, h)[0]

  // cabecera (el logo lo agrega la regla común de marca)
  out.push(T('Año', 'mvpTop', '', W / 2, top + u * 1.2, W / 2 - m, cond, u * 5.4, { align: 'right', fill: C.lilac, letterSpacing: u * 0.15 }))

  const stat = (label: string, value: string, x: number, y: number, w: number, h: number, i: number) => [
    S(`Línea stat ${i}`, 'line', x, y, w, 0, { stroke: 'rgba(199,155,255,0.25)', strokeWidth: 2 }),
    T(`Stat ${i}`, label, '', x, y + h * 0.3, w * 0.5, cond, h * 0.38, { align: 'left', fill: C.lilac, letterSpacing: u * 0.25 }),
    T(`Valor ${i}`, value, '', x + w * 0.4, y + h * 0.16, w * 0.6, cond, h * 0.62, { align: 'right' }),
  ]
  const stats: [string, string][] = [
    ['kdaLabel', 'kda'],
    ['acsLabel', 'acs'],
    ['hsLabel', 'hs'],
    ['agentLabel', 'agent'],
  ]

  if (variant === 0) {
    // CLÁSICO: "MVP" grande en cursiva arriba a la izquierda, el jugador enorme a la derecha (cortado por el borde),
    // el nickname junto a su hombro y la tabla de estadísticas abajo a la izquierda (pisa al jugador)
    out.length = 0
    const story = fmt === 'story'
    const P = (x: number, y: number) => ({ x: land ? x : x * (W / 1080), y: land ? y : story ? y : y * (H / 1350) })
    if (land) {
      out.push(photo(1096, 0, 800, 1000, { fit: 'contain', fadeBottom: 0.1 }))
      out.push(T('Titular', 'title', '', 365, 120, 560, cond, 230, { align: 'left', italic: true, lineHeight: 0.9 }, 1))
      out.push(T('Acento', 'mvpScript', '', 437, 300, 360, 'manuscrita', 70, { align: 'left', fill: C.ember, rotation: -6, autoFit: true, lineHeight: 1.3 }, 1))
      out.push(T('Nickname', 'sub', '', 1000, 386, 396, cond, 82, { align: 'right', fill: C.lilac, glow: 0.5, autoFit: true, letterSpacing: 4, lineHeight: 1 }, 1))
      stats.forEach(([l, v], i) => out.push(...stat(l, v, 61, 583 + i * 66.5, 642, 66.5, i)))
    } else {
      // vertical (medidas pensadas para la historia; en feed se escalan al alto)
      const ph = P(222, story ? 200 : 60)
      out.push(photo(ph.x, ph.y, 1400, H - ph.y, { fit: 'contain', fadeBottom: 0.1 }))
      const mv = P(94, story ? 490 : 230)
      out.push(T('Titular', 'title', '', mv.x, mv.y, 640, cond, story ? 340 : 280, { align: 'left', italic: true, lineHeight: 0.9 }, 1))
      out.push(T('Acento', 'mvpScript', '', mv.x + 70, mv.y + (story ? 270 : 225), 480, 'manuscrita', 100, { align: 'left', fill: C.ember, rotation: -8, autoFit: true, lineHeight: 1.3 }, 1))
      out.push(T('Nickname', 'sub', '', 420, mv.y + (story ? 385 : 320), 330, cond, story ? 125 : 105, { align: 'right', fill: C.lilac, glow: 0.5, autoFit: true, letterSpacing: 5, lineHeight: 1 }, 1))
      const rowH = story ? 92 : 80
      const tableY = bottom - rowH * 4 - (story ? u * 2 : 0)
      stats.forEach(([l, v], i) => out.push(...stat(l, v, 75, tableY + i * rowH, W - 75 - u * 7, rowH, i)))
    }
    out.unshift(agentLayer(c)) // el agente elegido, detrás de todo
    return out
  }

  // TARJETA
  const cardW = land ? W * 0.3 : W * 0.62
  // en X la tarjeta deja lugar abajo para el "del partido"
  const cardH = land ? H - u * 24 : (bottom - top) * 0.5
  const cardX = land ? W * 0.29 : (W - cardW) / 2 + u * 4
  const cardY = land ? u * 5 : top + u * 11
  out.push(T('Nickname vertical', 'sub', '', land ? W * 0.21 : cardX - u * 3, cardY + cardH, cardH, cond, land ? u * 18 : u * 16, { rotation: -90, align: 'left', autoFit: true, fill: 'transparent', stroke: C.violet, strokeWidth: 2.5, opacity: 0.7 }))
  out.push(S('Tarjeta', 'rect', cardX, cardY, cardW, cardH, { fill: 'rgba(76,29,149,0.35)', stroke: 'rgba(142,68,255,0.4)', strokeWidth: 2 }))
  out.push(photo(cardX, cardY + u * 3, cardW, cardH - u * 3, { fit: 'contain' }))
  out.push(S('Esquinas', 'frame', cardX + u * 2, cardY + u * 2, cardW - u * 4, cardH - u * 4, { stroke: C.ember, strokeWidth: 3 }))
  // "del partido": inclinado, justo debajo de la tarjeta (no sobre el jugador)
  out.push(T('Acento', 'mvpScript', '', cardX + cardW * (land ? 0.05 : 0.3), cardY + cardH + u * 1.5, cardW * (land ? 0.9 : 0.75), 'manuscrita', u * (land ? 6 : 7), { align: 'center', fill: C.ember, rotation: -6, autoFit: true, lineHeight: 1.3 }))
  const tx = land ? W * 0.66 : m
  const tw = land ? W * 0.34 - m : W - 2 * m
  const ty = land ? u * 18 : cardY + cardH + u * 6
  out.push(T('Titular', 'title', '', tx, ty, tw, cond, land ? u * 24 : u * 16, { align: 'left', lineHeight: 0.9, fill: land ? C.ember : C.white, glow: land ? 0.5 : 0 }))
  if (!land) out.push(T('Nickname', 'sub', '', tx, ty + u * 16.5, tw, cond, u * 11, { align: 'left', fill: C.ember, autoFit: true, lineHeight: 0.9 }))
  out.push(T('Nombre real', 'info', '', tx, ty + (land ? u * 31 : u * 27.5), tw, 'manuscrita', u * 3.6, { align: 'left', fill: C.lilac, }))
  const gy = ty + (land ? u * 38 : u * 33)
  const cw = (tw - u * 3) / 2
  const rh = u * 6.4
  stats.forEach(([l, v], i) => out.push(...stat(l, v, tx + (i % 2) * (cw + u * 3), gy + Math.floor(i / 2) * rh, cw, rh, i)))
  return out
}

