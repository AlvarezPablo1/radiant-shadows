import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { I, S, T, stack, type Ctx } from './core'
import { hero, heroKind, mainTexts, versus } from './parts'

/**
 * PÓSTER — afiche de evento: firma vertical abajo a la izquierda, el equipo enorme ocupando
 * casi toda la placa y el titular gigante encima de la parte baja de los jugadores,
 * con un fundido oscuro para que se lea. Abajo, el marcador / VS y el hashtag.
 */
export function poster(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop + m * 0.7
  const bottom = H - c.safeBottom - m * 0.8
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const out: Layer[] = []

  // firma vertical en la esquina inferior izquierda, en violeta oscuro
  out.push(T('Firma', 'signature', '', u * 3.5, bottom + u * 2, H * 0.4, 'condensada', u * 3, { rotation: -90, align: 'left', fill: '#690ae6', letterSpacing: u * 0.5 }))

  // pie: hashtag + (marcador o VS)
  out.push(T('Hashtag', 'hashtag', '', m, bottom - u * 3, W - 2 * m, 'condensada', u * 3.2, { fill: C.violetLight, letterSpacing: u * 0.2 }))
  let textBottom = bottom - u * 6
  if (hasVs) {
    const size = land ? u * 12 : u * 13
    out.push(...versus(W / 2, textBottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    textBottom -= size + u * 3
  }

  // titular gigante: el resto de los textos van más chicos que en los otros diseños
  const texts = mainTexts(c, m, W - 2 * m, 'center', land ? 1 : 1.1)
  for (const t of texts) if (t && typeof t === 'object' && t.name === 'Titular') (t as TextLayer).fontSize *= land ? 1.2 : 1.15
  const placed = stack(c, texts, { bottom: textBottom })
  const textTop = Math.min(...placed.map((l) => l.y))

  // en historia sobra alto: el isotipo grande corona la placa, detrás del equipo
  const tall = fmt === 'story' && k === 'people'
  // héroe: desde la cabecera hasta bien adentro del titular
  const heroTop = top + u * (tall ? 30 : 6)
  const heroBottom = textTop + u * (k === 'mascot' ? -3 : land ? 16 : 20)
  if (k === 'people') out.unshift(...hero(c, land ? W * 0.12 : -u * 6, heroTop, land ? W * 0.76 : W + u * 12, heroBottom - heroTop))
  else if (k !== 'none') out.unshift(...hero(c, W * 0.12, heroTop, W * 0.76, heroBottom - heroTop))
  else out.unshift(I('Isotipo', 'logo:team', '', W / 2 - u * 20, heroTop + u * 6, u * 40, u * 40, { glow: 0.6 }))

  // fundido para que el titular se lea sobre los jugadores (justo encima de ellos)
  const fadeTop = textTop - u * 14
  out.splice(k === 'people' ? out.findIndex((l) => !l.row) : 1, 0, S('Fundido', 'rect', 0, fadeTop, W, H - fadeTop, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))
  // en historia, el isotipo grande va detrás de todo
  if (tall) out.unshift(I('Isotipo de fondo', 'logo:team', '', W / 2 - u * 17, top + u * 8, u * 34, u * 34, { glow: 0.6, opacity: 0.9 }))
  out.push(...placed)
  return out
}
