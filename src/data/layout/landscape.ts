import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { I, S, centerBlock, stack, type Align, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

export function landscape(c: Ctx, variant: number): Layer[] {
  const { W, H, u, d } = c
  const m = u * 7
  const out: Layer[] = []
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const centered = variant === 2
  const heroLeft = variant === 1

  const colX = centered ? m : heroLeft ? W * 0.57 : m
  const colW = centered ? W - 2 * m : heroLeft ? W * 0.43 - m : W * 0.5 - m
  const align: Align = centered ? 'center' : 'left'

  const showLogo = !hasVs && (k !== 'logo' || !centered)
  // logo arriba a la izquierda
  if (showLogo) out.push(I('Logo', 'logo:team', '', m, m * 0.8, u * 10, u * 10, { glow: 0.3 }))

  const texts = mainTexts(c, colX, colW, align, 0.95)
  // IMPACTO en X con el equipo: titular gigante y el grupo más compacto encima
  const bigTitle = centered && k === 'people' && hasVs
  if (bigTitle) for (const t of texts) if (t && typeof t === 'object' && t.name === 'Titular') t.fontSize *= 1.7
  let bottom = H - m - u * 6
  const vs: Layer[] = []
  if (hasVs) {
    const size = u * 15
    vs.push(...versus(centered ? W / 2 : colX + size * (d.type === 'resultado' ? 2.15 : 1.65), bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    bottom -= size + u * 4
  }
  const placed = stack(c, texts, { bottom })
  if (d.type === 'comunicado' && k === 'none') centerBlock(c, placed, m * 0.8 + u * 18, H - m - u * 8)
  if (bigTitle) {
    // la frase sale del bloque y va inclinada a la izquierda, por encima del titular
    const kick = placed.find((l) => l.name === 'Frase') as TextLayer | undefined
    const title = placed.find((l) => l.name === 'Titular')
    if (kick && title) Object.assign(kick, { x: W * 0.06, width: W * 0.3, align: 'left', rotation: -12, y: title.y - u * 16 })
  }
  const textTop = Math.min(...placed.filter((l) => !bigTitle || l.name !== 'Frase').map((l) => l.y))

  if (centered) {
    if (k === 'person' || k === 'mascot') {
      out.unshift(...hero(c, -u * 4, u * 2, W * 0.4, H - u * 2))
      if (k === 'mascot') out.unshift(...hero(c, W * 0.64, u * 2, W * 0.4, H - u * 2, true))
    } else if (k === 'people') out.unshift(...(bigTitle ? hero(c, W * 0.22, u * 12, W * 0.56, textTop) : hero(c, W * 0.02, u * 15, W * 0.96, textTop + u * 6)))
    else if (k === 'logo' && d.fields.noPhotoArt === 'teclas' && variant === 2) {
      // IMPACTO con teclas: las cuatro teclas repartidas por toda la placa, alrededor del texto
      const ks = u * 40
      const keys: [string, number, number, number][] = [
        ['R', -12, W * 0.04, -u * 2],
        ['S', 10, W - ks - W * 0.04, -u * 4],
        ['W', 8, W * 0.08, H - ks + u * 2],
        ['P', -9, W - ks - W * 0.08, H - ks + u * 4],
      ]
      out.unshift(...keys.map(([l, rot, x, y]) => I(`Tecla ${l}`, `art:key:${l}:${rot}`, '', x, y, ks, ks, {})))
    } else if (k === 'logo') out.unshift(...hero(c, W / 2 - u * 15, m * 0.4, u * 30, u * 30))
    out.push(S('Línea', 'line', W / 2 - u * 9, textTop - u * 3, u * 18, 0, { stroke: C.violet, strokeWidth: 4 }))
  } else {
    // el héroe se queda en su mitad para que los textos no lo tapen
    if (k === 'people') out.unshift(...(heroLeft ? hero(c, -u * 1, u * 18, W * 0.57 - u * 2, H - u * 18) : hero(c, W * 0.38, u * 2, W * 0.62, H - u * 2)))
    else out.unshift(...hero(c, heroLeft ? 0 : W * 0.5, heroLeft ? u * 16 : 0, heroLeft ? W * 0.57 - u * 2 : W * 0.5 - u * 2, heroLeft ? H - u * 16 : H, heroLeft))
    out.push(S('Marco', 'corner', colX, textTop - u * 5, u * 24, u * 3, { stroke: C.violet, strokeWidth: 4 }))
  }
  out.push(...placed, ...vs)
  out.push(
    ...footer({ ...c, safeBottom: 0 }, centered ? 'center' : 'left').map((l) =>
      // en X la firma va en su propio renglón sobre el hashtag (la manuscrita es más ancha)
      centered ? l : l.name === 'Firma' ? { ...l, x: colX, width: colW, align: 'left' as const, y: l.y - u * 4.6 } : { ...l, x: colX, width: colW },
    ),
  )
  return out
}

