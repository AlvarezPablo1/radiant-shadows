import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { I, S, centerBlock, stack, textHeight, type Align, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

export function portrait(c: Ctx, variant: number): Layer[] {
  const { W, H, u, d } = c
  const m = u * 7
  const top = c.safeTop + m
  const bottom = H - c.safeBottom - m - u * 9 // espacio para footer
  const out: Layer[] = []
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  // logo superior: no se repite si ya está en el bloque de resultado / VS o si es el protagonista
  // logo arriba a la izquierda
  const topLogo = k !== 'logo' && !hasVs
  if (topLogo) out.push(I('Logo', 'logo:team', '', m, top, u * 10, u * 10, { glow: 0.3 }))
  // partidos (Matchday / resultado) en Centrado: el texto arriba y los jugadores abajo
  if (variant === 0 && hasVs && k === 'people') return textOnTop(c, out)

  const textW = variant === 1 ? W * 0.62 : W - 2 * m
  const align: Align = variant === 1 ? 'left' : 'center'
  const texts = mainTexts(c, m, textW, align, c.fmt === 'feed' ? 0.92 : 1)
  let textBottom = bottom
  const vsLayers: Layer[] = []
  if (hasVs) {
    const size = u * 17
    vsLayers.push(...versus(variant === 1 ? m + size * 1.6 : W / 2, bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    textBottom = bottom - size - u * 4
  }
  const placed = stack(c, texts, { bottom: textBottom })
  // comunicado sin imagen: el bloque va centrado en el espacio libre entre el logo y el pie
  if (d.type === 'comunicado' && k === 'none') centerBlock(c, placed, top + u * 22, bottom - u * 2)
  const textTop = Math.min(...placed.map((l) => l.y))

  // héroe: ocupa el espacio entre el logo y los textos, solapando un poco
  const heroTop = top + u * (variant === 1 ? 10 : k === 'people' ? 9 : 15)
  const heroBottom = textTop + u * (k === 'people' ? 22 : 20)
  // el héroe va debajo del logo y los textos
  const heroLayers =
    variant === 1 ? hero(c, k === 'people' ? -u * 2 : W * 0.12, top + u * 18, k === 'people' ? W + u * 4 : W * 0.9, Math.max(u * 30, textTop - u * 4 - (top + u * 18))) : k === 'people' ? hero(c, -u * 6, heroTop, W + u * 12, Math.max(u * 30, heroBottom - heroTop)) : k !== 'none' ? hero(c, W * 0.06, heroTop, W * 0.88, Math.max(u * 30, heroBottom - heroTop)) : []
  out.unshift(...heroLayers)

  if (variant === 2) {
    const py = textTop - u * 3
    out.push(S('Panel', 'slash', -u * 2, py, W + u * 4, bottom - py + u * 4, { fill: 'rgba(0,0,16,0.55)', stroke: C.violet, strokeWidth: 3 }))
  } else if (variant === 0) {
    out.push(S('Línea', 'line', W / 2 - u * 9, textTop - u * 3.5, u * 18, 0, { stroke: C.violet, strokeWidth: 4 }))
  } else {
    out.push(S('Marco', 'corner', m, textTop - u * 5, u * 26, u * 3, { stroke: C.violet, strokeWidth: 4 }))
  }
  out.push(...placed, ...vsLayers, ...footer(c, variant === 1 ? 'left' : 'center'))
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

