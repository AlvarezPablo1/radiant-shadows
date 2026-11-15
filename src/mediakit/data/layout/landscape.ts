import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { S, centerBlock, stack, type Ctx } from './core'
import { footer, hero, heroKind, mainTexts, versus } from './parts'

/** CENTRADO en X: los textos a la izquierda y el héroe en la mitad derecha */
export function landscape(c: Ctx): Layer[] {
  const { W, H, u, d } = c
  const m = u * 7
  const out: Layer[] = []
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  const colX = m
  const colW = W * 0.5 - m

  const texts = mainTexts(c, colX, colW, 'left', 0.95)
  let bottom = H - m - u * 6
  if (hasVs) {
    const size = u * 15
    out.push(...versus(colX + size * (d.type === 'resultado' ? 2.15 : 1.65), bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    bottom -= size + u * 4
  }
  const placed = stack(c, texts, { bottom })
  if (d.type === 'comunicado' && k === 'none') centerBlock(c, placed, m * 0.8 + u * 18, H - m - u * 8)
  // despedida: el "Gracias" un poco inclinado
  const thanks = d.type === 'despedida' ? (placed.find((l) => l.name === 'Frase') as TextLayer | undefined) : undefined
  if (thanks) thanks.rotation = -8
  const textTop = Math.min(...placed.map((l) => l.y))

  // el héroe se queda en su mitad para que los textos no lo tapen
  if (k === 'people') out.unshift(...hero(c, W * 0.38, u * 10, W * 0.62, H - u * 10))
  else out.unshift(...hero(c, W * 0.5, 0, W * 0.5 - u * 2, H))
  out.push(S('Marco', 'corner', colX, textTop - u * 5, u * 24, u * 3, { stroke: C.violet, strokeWidth: 4 }))
  out.push(...placed)
  out.push(
    ...footer({ ...c, safeBottom: 0 }, 'left').map((l) =>
      // en X la firma va en su propio renglón sobre el hashtag
      l.name === 'Firma' ? { ...l, x: colX, width: colW, align: 'left' as const, y: l.y - u * 4.6 } : { ...l, x: colX, width: colW },
    ),
  )
  return out
}
