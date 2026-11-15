import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { S, TEXT_SCALE, centerBlock, stack, textHeight, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

/** CENTRADO vertical (historia y feed): el héroe arriba y los textos centrados abajo */
export function portrait(c: Ctx): Layer[] {
  const { W, H, u, d } = c
  const m = u * 7
  const top = c.safeTop + m
  const bottom = H - c.safeBottom - m - u * 9 // espacio para footer
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  // partidos (Matchday / resultado) con el equipo: el texto arriba y los jugadores abajo
  if (hasVs && k === 'people') return textOnTop(c, [])

  const out: Layer[] = []
  const texts = mainTexts(c, m, W - 2 * m, 'center', c.fmt === 'feed' ? 0.92 : 1)
  let textBottom = bottom
  if (hasVs) {
    const size = u * 17
    out.push(...versus(W / 2, bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    textBottom = bottom - size - u * 4
  }
  const placed = stack(c, texts, { bottom: textBottom })
  // comunicado sin imagen: el bloque va centrado en el espacio libre entre el logo y el pie
  if (d.type === 'comunicado' && k === 'none') centerBlock(c, placed, top + u * 22, bottom - u * 2)
  // despedida: el "Gracias" sale del bloque y va grande e inclinado arriba a la izquierda, junto a la cabeza
  const thanks = d.type === 'despedida' && k === 'person' ? (placed.find((l) => l.name === 'Frase') as TextLayer | undefined) : undefined
  const textTop = Math.min(...placed.filter((l) => l !== thanks).map((l) => l.y))

  // héroe: ocupa el espacio entre el logo y los textos, solapando un poco
  const heroTop = top + u * (k === 'people' ? 9 : 15)
  // las fotos se meten un poco detrás de los textos; la mascota (sticker con su palabra) termina antes
  const heroBottom = textTop + u * (k === 'people' ? 22 : k === 'mascot' ? -3 : 20)
  if (k === 'people') out.unshift(...hero(c, -u * 6, heroTop, W + u * 12, Math.max(u * 30, heroBottom - heroTop)))
  else if (k !== 'none') out.unshift(...hero(c, W * 0.06, heroTop, W * 0.88, Math.max(u * 30, heroBottom - heroTop)))
  if (thanks) Object.assign(thanks, { x: W * 0.12, y: heroTop - u * 2, width: W * 0.8, align: 'left', fontSize: u * 11 * TEXT_SCALE, rotation: -12, autoFit: true })

  out.push(S('Línea', 'line', W / 2 - u * 9, textTop - u * 3.5, u * 18, 0, { stroke: C.violet, strokeWidth: 4 }))
  out.push(...placed, ...footer(c, 'center'))
  return out
}

/** Centrado vertical para partidos: kicker + titular + datos + logo VS/marcador arriba, jugadores grandes abajo */
export function textOnTop(c: Ctx, out: Layer[]): Layer[] {
  const { W, H, u, d, fmt } = c
  const m = u * 7
  const placed = stack(c, mainTexts(c, m, W - 2 * m, 'center', fmt === 'feed' ? 0.92 : 1), { top: c.safeTop + m * 0.6 })
  const textBottom = Math.max(...placed.map((l) => (l.type === 'text' ? l.y + textHeight(l, c.v[l.bind ?? ''] ?? l.text) : l.y)))
  const size = u * 15
  const vs = versus(W / 2, textBottom + u * 2, size, d.type === 'resultado' ? 'score' : 'vs')
  const heroTop = textBottom + size + u * 2
  const heroLayers = hero(c, -u * 6, heroTop, W + u * 12, H - heroTop + u * 2)
  const fade = S('Fundido', 'rect', 0, H - u * 30, W, u * 30, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true })
  const foot = footer(c, 'center')
  // Matchday en historia: la firma va vertical al costado y el hashtag queda sobre los jugadores
  if (d.type === 'matchday' && fmt === 'story') {
    const sig = foot.find((l) => l.name === 'Firma') as TextLayer | undefined
    if (sig) Object.assign(sig, { rotation: -90, x: u * 3.5, y: H * 0.5, width: H * 0.25, align: 'left', opacity: 0.6 })
    const tag = foot.find((l) => l.name === 'Hashtag')
    if (tag) tag.y += u * 4
  }
  return [...heroLayers, fade, ...out, ...placed, ...vs, ...foot]
}

