import { C } from '../../brand'
import type { Layer } from '../../types'
import { S, T, type Ctx } from './core'
import { hero } from './parts'

/**
 * CUMPLEAÑOS en Póster: el jugador grande al centro; sobre su pecho un "FELIZ" gigante en ámbar,
 * encima "CUMPLEAÑOS" blanco con brillo y el nombre manuscrito debajo. Firma vertical a la izquierda.
 */
export function birthdayPoster(c: Ctx): Layer[] {
  const { W, H, u, fmt } = c
  const m = u * 7
  const land = fmt === 'x'
  const top = c.safeTop + m * 0.7
  const bottom = H - c.safeBottom - m * 0.8
  const out: Layer[] = []

  // medidas tomadas de las referencias (en vertical se miden desde el hashtag para que sirvan en feed e historia)
  const hashY = land ? H - u * 7.5 : bottom - u * 3
  const g = land
    ? { heroX: W / 2 - 440, heroY: -20, heroW: 880, heroH: H + 20, feliz: [380, 235], title: [620, 125], name: [712, 95] }
    : { heroX: W * 0.08, heroY: top + u * 6, heroW: W * 0.84, heroH: hashY - u * 22 - (top + u * 6), feliz: [hashY - 490, 335], title: [hashY - 342, 200], name: [hashY - 215, 150] }

  out.push(...hero(c, g.heroX, g.heroY, g.heroW, g.heroH))
  out.push(S('Fundido', 'rect', 0, g.feliz[0] - u * 6, W, H - g.feliz[0] + u * 6, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))
  out.push(T('Frase', 'kicker', '', m, g.feliz[0], W - 2 * m, 'condensada', g.feliz[1], { fill: C.ember, opacity: 0.85, lineHeight: 0.9, letterSpacing: u * 0.4 }, 1))
  out.push(T('Titular', 'title', '', land ? W * 0.3 : m * 1.4, g.title[0], land ? W * 0.4 : W - m * 2.8, 'condensada', g.title[1], { autoFit: true, glow: 0.5, lineHeight: 0.95 }, 1))
  out.push(T('Nombre', 'sub', '', W / 2 - 260, g.name[0], 520, 'manuscrita', g.name[1], { fill: C.lilac, autoFit: true, rotation: -6, lineHeight: 1.1 }, 1))
  if (c.v.info) out.push(T('Detalle', 'info', '', m, g.name[0] + g.name[1] * 1.1, W - 2 * m, 'manuscrita', u * 3.6, { opacity: 0.9, lineHeight: 1.25 }, 1))
  out.push(T('Hashtag', 'hashtag', '', m, hashY, W - 2 * m, 'condensada', u * 3.2, { fill: C.violetLight, letterSpacing: u * 0.2 }))
  out.push(T('Firma', 'signature', '', u * 3.5, bottom + u * 2, H * 0.4, 'condensada', u * 3, { rotation: -90, align: 'left', fill: '#690ae6', letterSpacing: u * 0.5 }))
  return out
}
