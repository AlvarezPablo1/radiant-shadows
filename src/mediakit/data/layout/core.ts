import { C } from '../../brand'
import { fontFamily, fontWeight } from '../../lib/fonts'
import type { FormatId, ImageLayer, Layer, PostDoc, Roster, ShapeLayer, TextLayer } from '../../types'

let seq = 0
export const newId = () => 'L' + (++seq).toString(36) + Math.random().toString(36).slice(2, 7)

const base = (name: string, x: number, y: number, bind?: string) => ({ id: newId(), key: name, name, x, y, rotation: 0, opacity: 1, visible: true, locked: false, bind })

/** los jugadores son lo principal: todos los textos de las plantillas salen un poco más chicos */
export const TEXT_SCALE = 0.86

export function T(name: string, bind: string | undefined, text: string, x: number, y: number, width: number, font: string, fontSize: number, o: Partial<TextLayer> = {}, scale = TEXT_SCALE): TextLayer {
  return { ...base(name, x, y, bind), type: 'text', text, font, fontSize: fontSize * scale, italic: false, fill: C.white, align: 'center', width, letterSpacing: 0, lineHeight: 1.05, uppercase: false, glow: 0, ...o }
}
export function I(name: string, bind: string | undefined, src: string, x: number, y: number, width: number, height: number, o: Partial<ImageLayer> = {}): ImageLayer {
  return { ...base(name, x, y, bind), type: 'image', src, width, height, fit: 'contain', filter: 'none', flipX: false, glow: 0, fadeBottom: 0, ...o }
}
export function S(name: string, shape: ShapeLayer['shape'], x: number, y: number, width: number, height: number, o: Partial<ShapeLayer> = {}): ShapeLayer {
  return { ...base(name, x, y), type: 'shape', shape, width, height, fill: 'transparent', stroke: C.violet, strokeWidth: 3, cornerRadius: 0, glow: 0, ...o }
}

export type Align = 'left' | 'center' | 'right'
export interface Ctx {
  W: number
  H: number
  fmt: FormatId
  v: Record<string, string>
  d: PostDoc
  r: Roster
  u: number // unidad = 1% del lado corto
  safeTop: number
  safeBottom: number
}

/** Estima la altura de un bloque de texto (para apilar). */
export const measure = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null

/** Alto real de un bloque de texto: mide con la fuente y simula el corte de líneas por palabras (como Konva). */
export function textHeight(t: TextLayer, value: string) {
  const text = t.uppercase ? value.toUpperCase() : value
  if (t.autoFit || !measure) {
    const lines = t.autoFit ? text.split('\n').length : text.split('\n').reduce((n, line) => n + Math.max(1, Math.ceil(line.length / Math.max(4, t.width / (t.fontSize * 0.62 + t.letterSpacing)))), 0)
    return lines * t.fontSize * t.lineHeight
  }
  measure.font = `${t.italic ? 'italic ' : ''}${t.weight ?? fontWeight(t.font)} ${t.fontSize}px ${fontFamily(t.font)}`
  const w = (str: string) => measure.measureText(str).width + str.length * t.letterSpacing
  let lines = 0
  for (const para of text.split('\n')) {
    let cur = ''
    let n = 1
    for (const word of para.split(' ')) {
      const next = cur ? cur + ' ' + word : word
      if (cur && w(next) > t.width) {
        n++
        cur = word
      } else cur = next
    }
    lines += n
  }
  return lines * t.fontSize * t.lineHeight
}

/** Apila bloques de texto de abajo hacia arriba desde `bottom`, o de arriba hacia abajo desde `top`. */
export function stack(c: Ctx, items: (TextLayer | number | null)[], from: { bottom?: number; top?: number }): Layer[] {
  const list = items.filter((x) => x !== null) as (TextLayer | number)[]
  const hs = list.map((it) => (typeof it === 'number' ? it : textHeight(it, c.v[it.bind ?? ''] ?? it.text)))
  const total = hs.reduce((a, b) => a + b, 0)
  let y = from.top ?? (from.bottom ?? c.H) - total
  const out: Layer[] = []
  list.forEach((it, i) => {
    if (typeof it !== 'number') {
      it.y = y
      out.push(it)
    }
    y += hs[i]
  })
  return out
}

/** mueve un bloque de textos para que quede centrado verticalmente entre `from` y `to` */
export function centerBlock(c: Ctx, ls: Layer[], from: number, to: number) {
  const tops = ls.map((l) => l.y)
  const bottoms = ls.map((l) => (l.type === 'text' ? l.y + textHeight(l, c.v[l.bind ?? ''] ?? l.text) : l.y))
  const blockTop = Math.min(...tops),
    blockBottom = Math.max(...bottoms)
  const dy = (from + to) / 2 - (blockTop + blockBottom) / 2
  for (const l of ls) l.y += dy
}
