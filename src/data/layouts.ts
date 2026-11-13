import { C } from '../brand'
import type { FormatId, ImageLayer, Layer, PostDoc, Roster, ShapeLayer, TextLayer } from '../types'
import { FORMATS } from '../types'
import { computeValues, postType, selectedPeople } from './postTypes'
import { fontFamily, fontWeight } from '../lib/fonts'

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

type Align = 'left' | 'center' | 'right'
interface Ctx {
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
const measure = typeof document !== 'undefined' ? document.createElement('canvas').getContext('2d') : null

/** Alto real de un bloque de texto: mide con la fuente y simula el corte de líneas por palabras (como Konva). */
function textHeight(t: TextLayer, value: string) {
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
function stack(c: Ctx, items: (TextLayer | number | null)[], from: { bottom?: number; top?: number }): Layer[] {
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
function centerBlock(c: Ctx, ls: Layer[], from: number, to: number) {
  const tops = ls.map((l) => l.y)
  const bottoms = ls.map((l) => (l.type === 'text' ? l.y + textHeight(l, c.v[l.bind ?? ''] ?? l.text) : l.y))
  const blockTop = Math.min(...tops),
    blockBottom = Math.max(...bottoms)
  const dy = (from + to) / 2 - (blockTop + blockBottom) / 2
  for (const l of ls) l.y += dy
}

function heroKind(c: Ctx): 'person' | 'people' | 'mascot' | 'logo' | 'none' {
  const t = postType(c.d.type)
  if (c.d.visual === 'mascots') return 'mascot'
  if (c.d.visual === 'none') return c.d.type === 'comunicado' || c.d.type === 'stream' ? 'none' : 'logo'
  if (t.people === 'one') return 'person'
  if (t.people === 'many') return 'people'
  return 'mascot'
}

/** Imagen(es) principal(es) dentro de un rectángulo. */
function hero(c: Ctx, x: number, y: number, w: number, h: number, flip = false): Layer[] {
  const k = heroKind(c)
  const glow = 0.35
  // por defecto las fotos van sin filtro (se elige uno desde Edición si se quiere)
  const photoFilter = 'none' as const
  if (k === 'person') return [I('Foto', 'person:0', '', x, y, w, h, { fadeBottom: 0.22, glow, filter: photoFilter, flipX: flip })]
  if (k === 'mascot') return [I('Mascota', 'mascot', '', x, y, w, h, { fadeBottom: 0.12, glow: 0.25, flipX: flip })]
  if (k === 'logo') {
    const s = Math.min(w, h) * 0.78
    if (c.d.fields.noPhotoArt === 'teclas') return [I('Teclas RSWP', 'art:keycaps', '', x + (w - s) / 2, y + (h - s) / 2, s, s, {})]
    return [I('Isotipo', 'logo:team', '', x + (w - s) / 2, y + (h - s) / 2, s, s, { glow: 0.5, opacity: 0.95 })]
  }
  if (k === 'none') return []
  // varias personas: fila con superposición, el del medio más grande y adelante
  const people = selectedPeople(c.d, c.r).slice(0, 6)
  const row = { kind: 'stage' as const, x, y, w, h, overlap: overlapOf(c), dense: c.fmt === 'x' }
  const ls = people.map((_, i) => I(`Jugador ${i + 1}`, `person:${i}`, '', 0, 0, 1, 1, { fadeBottom: 0.25, glow: 0.25, filter: photoFilter, row: { ...row, slot: i, role: 'photo' } }))
  return reflowRow(ls)
}

/* ---------- filas de jugadores que se reacomodan solas ---------- */

const overlapOf = (c: Ctx) => (c.d.fields.rowOverlap !== undefined && c.d.fields.rowOverlap !== '' ? Number(c.d.fields.rowOverlap) : DEFAULT_OVERLAP)

/** posiciones armónicas para una fila "stage": el del medio más grande y adelante */
export const DEFAULT_OVERLAP = 0.34

function stageSlots(n: number, r: { x: number; y: number; w: number; h: number; overlap?: number; dense?: boolean }) {
  // pirámide: el del centro más grande y se van achicando hacia los costados de a un escalón,
  // todos apoyados abajo. El tamaño se calcula para la separación máxima; la "separación"
  // sólo acerca o aleja a los jugadores entre sí (el grupo queda centrado en su zona).
  const mid = (n - 1) / 2
  const step = n >= 5 ? 0.14 : 0.16
  const scales = Array.from({ length: n }, (_, i) => 1 - Math.abs(i - mid) * step)
  const sum = scales.reduce((a, b) => a + b, 0)
  const spanFor = (ov: number, base: number) => base * (sum * (1 - ov) + scales[n - 1] * ov)
  // en X (filas anchas y bajas) se superponen más: cada jugador sale bastante más grande
  const extra = r.dense ? 0.14 : 0
  const ref = 0.34 + extra
  const base = r.w / (sum * (1 - ref) + scales[n - 1] * ref)
  const overlap = Math.min(0.7, Math.max(0, (r.overlap ?? DEFAULT_OVERLAP) + extra))
  let x = r.x + (r.w - spanFor(overlap, base)) / 2
  return scales.map((k, i) => {
    const bw = base * k,
      bh = r.h * k
    const slot = { x, y: r.y + (r.h - bh), width: bw, height: bh, dist: Math.abs(i - mid) / Math.max(1, mid) }
    x += bw * (1 - overlap)
    return slot
  })
}

/**
 * Reacomoda las filas de jugadores: cuando se oculta uno o se lo arrastra a otro lugar,
 * los visibles se reparten de nuevo (orden según su posición X actual) con tamaños armónicos.
 */
export function reflowRow(layers: Layer[]): Layer[] {
  const out = [...layers]
  const photos = out.filter((l): l is ImageLayer => l.type === 'image' && !!l.row && l.row.role === 'photo')
  if (!photos.length) return out
  const kind = photos[0].row!.kind
  const r = photos[0].row!
  const visible = photos.filter((l) => l.visible).sort((a, b) => a.x + a.width / 2 - (b.x + b.width / 2))
  const n = visible.length
  const idx = (id: string) => out.findIndex((l) => l.id === id)

  if (kind === 'stage') {
    const slots = stageSlots(Math.max(1, n), r)
    visible.forEach((l, i) => (out[idx(l.id)] = { ...l, ...slots[i] }))
    // profundidad: el del centro adelante
    const positions = photos.map((l) => idx(l.id)).sort((a, b) => a - b)
    const byDepth = [...photos].sort((a, b) => {
      const da = visible.includes(a) ? slots[visible.indexOf(a)].dist : 2
      const db = visible.includes(b) ? slots[visible.indexOf(b)].dist : 2
      return db - da
    })
    const current = byDepth.map((l) => out[idx(l.id)])
    positions.forEach((pos, i) => (out[pos] = current[i]))
    return out
  }

  const panels = out.filter((l): l is ShapeLayer => l.type === 'shape' && !!l.row && l.row.role === 'panel')

  // grilla fija (historias: 3 columnas): las fotos llenan cada celda y las columnas de color van de arriba a abajo
  if (r.cols) {
    const cols = r.cols
    const rows = Math.max(1, Math.ceil(n / cols))
    const cw = r.w / cols
    const ch = (r.ph ?? r.h) / rows
    visible.forEach((p, i) => {
      out[idx(p.id)] = { ...out[idx(p.id)], x: r.x + (i % cols) * cw, y: (r.py ?? r.y) + Math.floor(i / cols) * ch, width: cw, height: ch } as Layer
    })
    panels.forEach((pn, i) => {
      out[idx(pn.id)] = i < cols ? { ...pn, visible: true, x: r.x + i * cw, y: r.y, width: cw, height: r.h, fill: i % 2 ? C.violet : '#2A1846' } : { ...pn, visible: false }
    })
    // celda libre (ej. 5 jugadores en 3 columnas): la ocupa el isotipo
    const filler = out.find((l): l is ImageLayer => l.type === 'image' && l.row?.role === 'filler')
    if (filler) {
      const free = rows * cols - n
      const i = n
      const sz = Math.min(cw, ch) * 0.6
      out[idx(filler.id)] = free > 0
        ? { ...filler, visible: true, x: r.x + (i % cols) * cw + (cw - sz) / 2, y: (r.py ?? r.y) + Math.floor(i / cols) * ch + (ch - sz) / 2, width: sz, height: sz }
        : { ...filler, visible: false }
    }
    return out
  }

  // paneles: columnas iguales, colores alternados; el panel acompaña a su foto
  const colW = r.w / Math.max(1, n)
  for (const p of photos) {
    const panel = panels.find((x) => x.row!.slot === p.row!.slot)
    const i = visible.indexOf(p)
    if (i < 0) {
      if (panel) out[idx(panel.id)] = { ...panel, visible: false }
      continue
    }
    const x = r.x + i * colW
    out[idx(p.id)] = { ...out[idx(p.id)], x, y: r.py ?? r.y, width: colW, height: r.ph ?? r.h } as Layer
    if (panel) out[idx(panel.id)] = { ...panel, visible: true, x, y: r.y, width: colW, height: r.h, fill: i % 2 ? C.violet : '#2A1846' }
  }
  return out
}

/** Bloque "logo vs logo" o marcador. */
function versus(cx: number, y: number, size: number, center: 'vs' | 'score'): Layer[] {
  const gap = center === 'score' ? size * 2.3 : size * 1.25
  const out: Layer[] = [
    I('Logo equipo', 'logo:team', '', cx - gap / 2 - size, y, size, size, { glow: 0.4 }),
    I('Logo rival', 'logo:rival', '', cx + gap / 2, y, size, size, {}),
    T('Nombre rival', 'rivalName', '', cx + gap / 2 + size * 0.05, y + size * 0.36, size * 1.7, 'condensada', size * 0.26, { autoFit: true, align: 'left' }),
  ]
  if (center === 'vs') out.push(T('VS', undefined, 'VS', cx - gap / 2, y + size * 0.22, gap, 'manuscrita', size * 0.48, { fill: C.lilac }))
  else out.push(T('Marcador', 'score', '13 - 9', cx - gap / 2 - size * 0.2, y + size * 0.12, gap + size * 0.4, 'condensada', size * 0.68, { autoFit: true, glow: 0.4 }))
  return out
}

function footer(c: Ctx, align: Align = 'center'): Layer[] {
  const { W, u } = c
  const m = u * 7
  const y = c.H - c.safeBottom - u * 4.5
  if (align === 'center')
    return [T('Firma', 'signature', '', m, y, W - m * 2, 'condensada', u * 3, { fill: C.white, opacity: 0.75, letterSpacing: u * 0.25 }), T('Hashtag', 'hashtag', '', m, y - u * 4, W - m * 2, 'condensada', u * 3, { fill: C.violetLight, letterSpacing: u * 0.1 })]
  return [
    T('Hashtag', 'hashtag', '', m, y, W / 2 - m, 'condensada', u * 3, { fill: C.violetLight, align: 'left' }),
    T('Firma', 'signature', '', W / 2, y, W / 2 - m, 'condensada', u * 3, { align: 'right', opacity: 0.75, letterSpacing: u * 0.25 }),
  ]
}

/** Textos principales según tipo: kicker (alma) + título (fuerza) + extras */
function mainTexts(c: Ctx, x: number, w: number, align: Align, scale = 1): (TextLayer | number | null)[] {
  const { u, d } = c
  const s = (n: number) => n * u * scale
  const kick = T('Frase', 'kicker', '', x, 0, w, 'manuscrita', s(6.4), { align, fill: C.white, lineHeight: 1.5, autoFit: true })
  const title = T('Titular', 'title', '', x, 0, w, 'condensada', s(d.type === 'cumple' ? 19 : 15), { align, autoFit: true, glow: 0.35, lineHeight: 1 })
  const sub = T('Contexto', 'sub', '', x, 0, w, 'condensada', s(3.6), { align, fill: C.violetLight, letterSpacing: s(0.35), lineHeight: 1.2 })
  const info = T('Detalle', 'info', '', x, 0, w, 'manuscrita', s(3.6), { align, fill: C.white, opacity: 0.9, lineHeight: 1.25 })
  const body = T('Texto', 'body', '', x, 0, w, 'fuerza', s(3.4), { align, weight: '500', lineHeight: 1.35, fill: C.white })
  const list = T('Lista', 'list', '', x, 0, w, 'condensada', s(d.type === 'roster' ? 3.3 : 4.6), { align, lineHeight: 1.35, letterSpacing: s(0.15) })
  switch (d.type) {
    case 'cumple':
      return [kick, s(0.5), title, s(1.5), T('Nombre', 'sub', '', x, 0, w, 'condensada', s(6), { align, fill: C.violetLight, autoFit: true, letterSpacing: s(0.3) }), s(1), c.v.info ? info : null]
    case 'bienvenida':
    case 'despedida':
      return [kick, s(0.5), title, s(1.2), sub, s(1.2), info]
    case 'tryouts':
      return [kick, title, s(2), list, s(1.5), sub, s(1), info]
    case 'roster':
      return [kick, s(0.5), title, s(2), list, s(1), sub]
    case 'comunicado':
      // "COMUNICADO OFICIAL" va siempre entre el logo y la firma manuscrita "Radiant Shadows"
      return [T('Titular', 'title', '', x, 0, w, 'condensada', s(8.5), { align, lineHeight: 1.05, glow: 0.25 }), s(1), kick, s(2.5), body]
    case 'comunidad':
      return [kick, s(0.5), T('Titular', 'title', '', x, 0, w, 'condensada', s(8.5), { align, lineHeight: 1.05, glow: 0.25 }), s(2.5), body]
    case 'stream':
      return [kick, title, s(1.5), sub, s(0.8), c.v.info ? info : null]
    case 'matchday':
      return [kick, title, s(1.5), sub, s(0.8), info, s(0.6), T('Dónde verlo', 'foot', '', x, 0, w, 'condensada', s(3), { align, fill: C.lilac, letterSpacing: s(0.2) })]
    case 'resultado':
    case 'torneo':
    default:
      return [kick, title, s(1.5), sub, s(0.8), c.v.info ? info : null]
  }
}

export function buildLayout(d: PostDoc, r: Roster, fmt: FormatId): Layer[] {
  const { w: W, h: H } = FORMATS[fmt]
  const u = Math.min(W, H) / 100
  const c: Ctx = { W, H, fmt, d, r, v: computeValues(d, r), u, safeTop: fmt === 'story' ? 210 : 0, safeBottom: fmt === 'story' ? 250 : 0 }
  if (d.type === 'mvp') return mvp(c, d.variant === 1 ? 1 : 0)
  const variant = d.variant % 6
  if (variant === 3) return neon(c)
  if (variant === 4 && postType(d.type).people === 'many') return panels(c)
  if (variant === 5) return typo(c)
  return fmt === 'x' ? landscape(c, variant % 3) : portrait(c, variant % 3)
}

function portrait(c: Ctx, variant: number): Layer[] {
  const { W, H, u, d } = c
  const m = u * 7
  const top = c.safeTop + m
  const bottom = H - c.safeBottom - m - u * 9 // espacio para footer
  const out: Layer[] = []
  const k = heroKind(c)
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  // logo superior: no se repite si ya está en el bloque de resultado / VS o si es el protagonista
  // logo arriba a la izquierda, con el nombre del equipo al lado
  const topLogo = k !== 'logo' && !hasVs
  if (topLogo) out.push(I('Logo', 'logo:team', '', m, top, u * 14, u * 14, { glow: 0.3 }))
  if (k !== 'logo') out.push(T('Equipo', 'team', '', topLogo ? m + u * 17 : m, top + u * 5.3, W - 2 * m - u * 17, 'condensada', u * 2.8, { align: 'left', letterSpacing: u * 0.6, opacity: 0.8 }))

  if (variant === 2) {
    // IMPACTO: palabra gigante calada detrás + panel angular
    out.push(T('Fondo tipográfico', 'title', '', -u * 5, H * 0.16, W + u * 10, 'condensada', u * 30, { autoFit: true, fill: 'transparent', stroke: C.violet, strokeWidth: 3, opacity: 0.35 }))
  }

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
    // la palabra calada queda detrás del héroe
    const i = out.findIndex((l) => l.name === 'Fondo tipográfico')
    if (i > 0) out.unshift(...out.splice(i, 1))
  }

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

function landscape(c: Ctx, variant: number): Layer[] {
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
  // logo arriba a la izquierda, con el nombre del equipo al lado
  if (showLogo) out.push(I('Logo', 'logo:team', '', m, m * 0.8, u * 14, u * 14, { glow: 0.3 }))
  if (k !== 'logo' || !centered) out.push(T('Equipo', 'team', '', showLogo ? m + u * 16 : m, m * 0.8 + u * 5.2, W * 0.5, 'condensada', u * 2.8, { align: 'left', letterSpacing: u * 0.6, opacity: 0.8 }))

  const texts = mainTexts(c, colX, colW, align, 0.95)
  let bottom = H - m - u * 6
  const vs: Layer[] = []
  if (hasVs) {
    const size = u * 15
    vs.push(...versus(centered ? W / 2 : colX + size * (d.type === 'resultado' ? 2.15 : 1.65), bottom - size, size, d.type === 'resultado' ? 'score' : 'vs'))
    bottom -= size + u * 4
  }
  const placed = stack(c, texts, { bottom })
  if (d.type === 'comunicado' && k === 'none') centerBlock(c, placed, m * 0.8 + u * 18, H - m - u * 8)
  const textTop = Math.min(...placed.map((l) => l.y))

  if (centered) {
    if (k === 'person' || k === 'mascot') {
      out.unshift(...hero(c, -u * 4, u * 2, W * 0.4, H - u * 2))
      if (k === 'mascot') out.unshift(...hero(c, W * 0.64, u * 2, W * 0.4, H - u * 2, true))
    } else if (k === 'people') out.unshift(...hero(c, W * 0.02, u * 8, W * 0.96, textTop + u * 13))
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

/**
 * NEÓN — basado en las placas actuales del equipo (Match Day / Game Day):
 * logo chico + "VALORANT" arriba, texto vertical al costado, isotipo gigante con glow
 * (o la foto), titular condensado en dos líneas (blanco / violeta), divisor y fila
 * inferior con rival a la izquierda y fecha/dato destacado en ámbar a la derecha.
 */
function neon(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7.5
  const top = c.safeTop + m * 0.9
  const bottom = H - c.safeBottom - m * 1.1
  const out: Layer[] = []
  const k = heroKind(c)
  const cond = 'condensada'

  // cabecera (si el isotipo gigante es el protagonista no se repite el logo chico)
  const bigLogo = (k === 'logo' || k === 'none') && d.fields.noPhotoArt !== 'teclas'
  if (!bigLogo) {
    out.push(I('Logo chico', 'logo:team', '', m, top, u * 9, u * 9, { glow: 0.2 }))
    out.push(T('Encabezado', 'panelHeader', '', m + u * 11.5, top + u * 1.6, W / 2, cond, u * 6, { align: 'left', fill: C.white, letterSpacing: u * 0.15 }))
  } else out.push(T('Equipo', 'team', '', m, top + u * 1.6, W / 2, cond, u * 6, { align: 'left', fill: C.white, letterSpacing: u * 0.15 }))
  out.push(T('Juego', undefined, 'VALORANT', W / 2, top + u * 1.6, W / 2 - m, cond, u * 6, { align: 'right', fill: C.lilac, letterSpacing: u * 0.15 }))
  // texto vertical lateral
  out.push(
    T('Texto lateral', 'sideline', '', W - m * 0.42, H * (land ? 0.18 : 0.33), land ? H * 0.64 : H * 0.4, cond, u * 2.6, {
      rotation: 90,
      align: 'left',
      fill: C.lilac,
      opacity: 0.45,
      letterSpacing: u * 0.55,
    }),
  )

  // fila inferior
  const rowH = u * 8
  const rowY = bottom - rowH
  const hasVs = d.type === 'matchday' || d.type === 'resultado'
  if (hasVs) {
    out.push(T('VS', undefined, 'vs', m, rowY + u * 0.6, u * 8, 'manuscrita', u * 6, { align: 'left', fill: C.ember, }))
    out.push(I('Logo rival', 'logo:rival', '', m + u * 8.5, rowY - u * 0.2, u * 8, u * 8, {}))
    out.push(T('Rival', 'rivalUpper', '', m + u * (d.fields.rivalLogo ? 18 : 9), rowY + u * 1.2, W * 0.45, cond, u * 6.4, { align: 'left', letterSpacing: u * 0.1 }))
  } else {
    out.push(T('Contexto', 'neonLeft', '', m, rowY + u * 1.2, W * 0.5, cond, u * 6.4, { align: 'left', letterSpacing: u * 0.1, autoFit: true }))
  }
  out.push(T('Dato destacado', 'neonRight', '', W * 0.45, rowY + u * 1.2, W * 0.55 - m, cond, u * 6.4, { align: 'right', fill: C.ember, letterSpacing: u * 0.1, autoFit: true }))
  out.push(S('Divisor', 'line', m, rowY - u * 3, W - 2 * m, 0, { stroke: 'rgba(199,155,255,0.35)', strokeWidth: 2 }))

  // bloque extra (lista / texto) para tryouts, roster, comunicados
  let titleBottom = rowY - u * 5
  const extraBind = d.type === 'tryouts' || d.type === 'roster' ? 'list' : d.type === 'comunicado' || d.type === 'comunidad' ? 'body' : d.type === 'matchday' ? 'foot' : ''
  if (extraBind) {
    const ex = T(extraBind === 'foot' ? 'Dónde verlo' : extraBind === 'list' ? 'Lista' : 'Texto', extraBind, '', m, 0, land ? W * 0.5 : W - 2 * m, extraBind === 'body' ? 'fuerza' : cond, u * (extraBind === 'body' ? 3.3 : 5), {
      align: 'left',
      weight: extraBind === 'body' ? '500' : undefined,
      lineHeight: extraBind === 'body' ? 1.35 : 1.1,
      fill: extraBind === 'foot' ? C.lilac : C.white,
      letterSpacing: extraBind === 'body' ? 0 : u * 0.1,
    })
    const hgt = textHeight(ex, c.v[extraBind] ?? '')
    ex.y = titleBottom - hgt
    out.push(ex)
    titleBottom = ex.y - u * 3
  }

  // titular: dos líneas en vertical, una sola en X (como las placas actuales)
  const size = land ? u * 22 : u * 27
  const tw = land ? W * 0.56 : W * 0.78
  const titleLayers: TextLayer[] = []
  let titleTop: number
  if (land) {
    const t1 = T('Titular', 'neonTitle', '', m, titleBottom - size * 0.92, tw, cond, size, { align: 'left', autoFit: true, fill: C.white, lineHeight: 0.9, extrude: u * 0.5 })
    titleLayers.push(t1)
    titleTop = t1.y
  } else {
    const l2 = T('Titular 2', 'neon2', '', m, titleBottom - size * 0.92, tw, cond, size, { align: 'left', autoFit: true, fill: C.violetLight, lineHeight: 0.9, glow: 0.35 })
    const l1 = T('Titular 1', 'neon1', '', m, l2.y - size * 0.86, tw, cond, size, { align: 'left', autoFit: true, fill: C.white, lineHeight: 0.9, glow: 0.2 })
    titleLayers.push(l1, l2)
    titleTop = l1.y
  }
  const keys = d.fields.noPhotoArt === 'teclas'

  // héroe: isotipo gigante con glow, o foto/mascota
  const heroLayers: Layer[] = []
  if (land) {
    const hx = W * 0.5,
      hw = W * 0.46
    if (k === 'logo' || k === 'none') {
      const sz = H * (keys ? 0.78 : 0.66)
      heroLayers.push(keys ? I('Teclas RSWP', 'art:keycaps', '', W - m - sz, H * 0.06, sz, sz, {}) : I('Isotipo', 'logo:team', '', hx + (hw - sz) / 2, H * 0.14, sz, sz, { glow: 0.9 }))
    } else heroLayers.push(...hero(c, hx - u * 6, 0, hw + u * 10, rowY - u * 2))
  } else {
    const areaTop = top + u * 11
    const areaH = titleTop + size * 0.6 - areaTop
    if (k === 'logo' || k === 'none') {
      const sz = Math.min(W * (keys ? 0.86 : 0.74), areaH * 1.02)
      heroLayers.push(
        keys
          ? I('Teclas RSWP', 'art:keycaps', '', (W - sz) / 2, areaTop + (areaH - sz) * 0.2, sz, sz, {})
          : I('Isotipo', 'logo:team', '', (W - sz) / 2, areaTop + (areaH - sz) * 0.25, sz, sz, { glow: 0.9 }),
      )
    } else heroLayers.push(...hero(c, -u * 6, areaTop - u * 6, W + u * 12, areaH + u * 14))
  }
  out.unshift(...heroLayers)
  out.push(...titleLayers)
  return out
}

/**
 * PANELES — Match Day con los jugadores en columnas alternando violeta / púrpura,
 * fotos con duotono, "vs rival" + titular gigante abajo y fila de fecha / fase.
 */
function panels(c: Ctx): Layer[] {
  // historias y feed (formatos verticales) usan la versión de 3 columnas
  if (c.fmt !== 'x') return panelsStory(c)
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop
  const bottom = H - c.safeBottom
  const cond = 'condensada'
  const out: Layer[] = []
  const people = selectedPeople(d, c.r).slice(0, 6)
  const k = heroKind(c)

  // zona de paneles: toda la placa; las fotos arriba y el texto sobre un degradado abajo
  const photoTop = land ? 0 : top + u * 13
  const textStart = bottom - m - u * 6 - u * 4.5 - (land ? u * 24 : u * 26) * 0.92 - u * 10 - u * 3
  const photoH = land ? H : textStart - photoTop
  const row = { kind: 'panels' as const, x: 0, y: 0, w: W, h: H, py: photoTop, ph: photoH }
  if (k === 'people') {
    people.forEach((_, i) => out.push(S(`Panel ${i + 1}`, 'rect', 0, 0, 1, 1, { fill: '#2A1846', stroke: 'transparent', strokeWidth: 0, row: { ...row, slot: i, role: 'panel' } })))
    people.forEach((_, i) => out.push(I(`Jugador ${i + 1}`, `person:${i}`, '', 0, 0, 1, 1, { fit: 'cover', cropY: 0.05, row: { ...row, slot: i, role: 'photo' } })))
  } else {
    const sz = Math.min(W * 0.7, H * 0.95)
    out.push(...hero(c, (W - sz) / 2, (H - sz) / 2, sz, sz))
  }
  const placed = reflowRow(out)
  placed.push(S('Fundido', 'rect', 0, H * (land ? 0.42 : 0.4), W, H * (land ? 0.58 : 0.6), { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))
  panelHeader(c, placed)

  const rowY = bottom - m - u * 6
  panelFooter(c, placed, rowY)
  const size = land ? u * 24 : u * 26
  const titleY = rowY - u * 4.5 - size * 0.92
  placed.push(T('Titular', 'panelTitle', '', m, titleY, land ? W * 0.62 : W - 2 * m, cond, size, { align: 'left', autoFit: true, lineHeight: 0.9 }))
  panelVs(c, placed, titleY - u * 10)
  placed.push(T('Acento', 'script', '', land ? W * 0.74 : W * 0.6, land ? H * 0.56 : titleY - u * 14, u * 26, 'manuscrita', u * 9, { align: 'center', fill: C.ember, rotation: -8, autoFit: true, lineHeight: 1.3 }))
  return placed
}

function panelHeader(c: Ctx, out: Layer[]) {
  const { W, u } = c
  const m = u * 7
  const hy = c.safeTop + u * 5
  out.push(I('Logo chico', 'logo:team', '', m, hy - u * 1.1, u * 8, u * 8, { glow: 0.2 }))
  out.push(T('Encabezado', 'panelHeader', '', m + u * 10, hy, W * 0.4, 'condensada', u * 5.4, { align: 'left', letterSpacing: u * 0.1 }))
  out.push(T('Juego', undefined, 'VALORANT', W / 2, hy, W / 2 - m, 'condensada', u * 5.4, { align: 'right', fill: C.lilac, letterSpacing: u * 0.1 }))
}
function panelFooter(c: Ctx, out: Layer[], rowY: number, dateBind = 'panelDate') {
  const { W, u } = c
  const m = u * 7
  out.push(T('Fecha', dateBind, '', m, rowY, W * 0.45, 'condensada', u * 5.4, { align: 'left', letterSpacing: u * 0.1 }))
  out.push(T('Fase', 'panelRight', '', W * 0.4, rowY, W * 0.6 - m, 'condensada', u * 5.4, { align: 'right', fill: C.lilac, letterSpacing: u * 0.1, autoFit: true }))
  out.push(S('Divisor', 'line', m, rowY - u * 3, W - 2 * m, 0, { stroke: 'rgba(199,155,255,0.3)', strokeWidth: 2 }))
}
function panelVs(c: Ctx, out: Layer[], vy: number) {
  const { W, u, d } = c
  const m = u * 7
  if (d.type !== 'matchday' && d.type !== 'resultado') return
  out.push(T('VS', undefined, 'vs', m, vy + u * 0.4, u * 8, 'manuscrita', u * 6, { align: 'left', fill: C.ember }))
  out.push(I('Logo rival', 'logo:rival', '', m + u * 8.5, vy - u * 0.6, u * 8, u * 8, {}))
  out.push(T('Rival', 'rivalUpper', '', m + u * (d.fields.rivalLogo ? 18 : 9), vy + u * 0.8, W * 0.5, 'condensada', u * 6.4, { align: 'left', letterSpacing: u * 0.1 }))
}

/**
 * PANELES en historia y feed (vertical): 3 columnas, una por jugador, con la foto llenando toda la
 * columna desde arriba; titular gigante en dos líneas que pisa el final de las columnas.
 */
function panelsStory(c: Ctx): Layer[] {
  const { W, H, u, d } = c
  const m = u * 7
  const bottom = H - c.safeBottom
  const out: Layer[] = []
  const k = heroKind(c)
  // sólo entran 3: los primeros 3 del orden elegido en "Quiénes aparecen"
  const people = selectedPeople(d, c.r).slice(0, 3)

  const rowY = bottom - m - u * 4
  const divY = rowY - u * 3
  const size = u * 31
  const line2Y = divY - u * 2.5 - size * 0.9
  const line1Y = line2Y - size * 0.86
  // columnas de color de arriba a abajo; las fotos ocupan el espacio entre la cabecera y el titular
  // las fotos arrancan debajo del encabezado (fuera de la zona de la interfaz de IG) y llegan hasta detrás del titular
  const photoTop = c.safeTop + u * 13
  const photoBottom = line2Y + size * 0.3
  const row = { kind: 'panels' as const, x: 0, y: 0, w: W, h: H, py: photoTop, ph: photoBottom - photoTop }
  if (k === 'people') {
    people.forEach((_, i) => out.push(S(`Panel ${i + 1}`, 'rect', 0, 0, 1, 1, { fill: '#2A1846', stroke: 'transparent', strokeWidth: 0, row: { ...row, slot: i, role: 'panel' } })))
    people.forEach((_, i) => out.push(I(`Jugador ${i + 1}`, `person:${i}`, '', 0, 0, 1, 1, { fit: 'cover', cropY: 0.02, fadeBottom: 0.3, row: { ...row, slot: i, role: 'photo' } })))
  } else {
    const sz = Math.min(W * 0.8, (photoBottom - photoTop) * 0.85)
    out.push(...hero(c, (W - sz) / 2, photoTop + (photoBottom - photoTop - sz) / 2, sz, sz))
  }
  const placed = reflowRow(out)
  // fundido suave: las columnas siguen visibles hasta abajo pero el texto se lee
  placed.push(S('Fundido', 'rect', 0, H * 0.45, W, H * 0.55 + 2, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))
  panelHeader(c, placed)
  panelFooter(c, placed, rowY)
  placed.push(T('Titular 1', 'neon1', '', m, line1Y, W * 0.62, 'condensada', size, { align: 'left', autoFit: true, lineHeight: 0.9 }))
  placed.push(T('Titular 2', 'neon2', '', m, line2Y, W * 0.62, 'condensada', size, { align: 'left', autoFit: true, lineHeight: 0.9 }))
  panelVs(c, placed, line1Y - u * 9)
  placed.push(T('Acento', 'script', '', W * 0.6, line1Y - u * 4, W * 0.34, 'manuscrita', u * 10, { align: 'center', fill: C.ember, rotation: -8, autoFit: true, lineHeight: 1.3 }))
  return placed
}

/**
 * MVP — Clásico (tabla de estadísticas + foto grande) o Tarjeta (foto enmarcada,
 * nickname calado vertical y estadísticas en grilla).
 */
function mvp(c: Ctx, variant: number): Layer[] {
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

  // cabecera
  out.push(I('Logo chico', 'logo:team', '', m, top, u * 8, u * 8, { glow: 0.2 }))
  out.push(T('Encabezado', 'mvpHeader', '', m + u * 10.5, top + u * 1.2, W * 0.5, cond, u * 5.4, { align: 'left', letterSpacing: u * 0.15 }))
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
    // CLÁSICO
    const colW = land ? W * 0.4 : W - 2 * m
    if (land) out.unshift(photo(W * 0.42, u * 3, W * 0.56, H - u * 3))
    else out.unshift(photo(W * 0.18, top + u * 8, W * 0.82, (bottom - top) * 0.55))
    const rowH = land ? u * 7.4 : u * 8.5
    const tableY = bottom - rowH * 4
    stats.forEach(([l, v], i) => out.push(...stat(l, v, m, tableY + i * rowH, colW, rowH, i)))
    const nickSize = land ? u * 12 : u * 17
    const mvpSize = land ? u * 22 : u * 34
    let badgeY: number, mvpY: number, nickY: number, nameY: number
    if (land) {
      // en X se arma de arriba hacia abajo para no chocar con la cabecera
      badgeY = top + u * 12
      mvpY = badgeY + u * 7
      nickY = mvpY + mvpSize * 0.9
      nameY = nickY + nickSize * 0.92
    } else {
      nameY = tableY - u * 9
      nickY = nameY - nickSize * 0.95
      mvpY = nickY - mvpSize * 0.92
      badgeY = mvpY - u * 7
    }
    out.push(T('Nombre real', 'info', '', m, nameY, colW, 'manuscrita', u * 4.2, { align: 'left', fill: C.lilac, }))
    out.push(T('Nickname', 'sub', '', m, nickY, colW, cond, nickSize, { align: 'left', fill: C.ember, autoFit: true, lineHeight: 0.9 }))
    out.push(T('Titular', 'title', '', m, mvpY, colW, cond, mvpSize, { align: 'left', lineHeight: 0.9 }))
    out.push(T('Badge', undefined, 'MVP', m, badgeY, u * 10, cond, u * 4, { align: 'center', fill: C.black, background: C.ember }))
    out.push(T('Acento', 'mvpScript', '', land ? W * 0.62 : W * 0.42, land ? H * 0.78 : tableY - u * 30, u * 50, 'manuscrita', land ? u * 8 : u * 9, { align: 'center', fill: C.ember, rotation: -8, autoFit: true, lineHeight: 1.3 }))
    return out
  }

  // TARJETA
  const cardW = land ? W * 0.3 : W * 0.62
  const cardH = land ? H - u * 10 : (bottom - top) * 0.5
  const cardX = land ? W * 0.29 : (W - cardW) / 2 + u * 4
  const cardY = land ? u * 5 : top + u * 11
  out.push(T('Nickname vertical', 'sub', '', land ? W * 0.21 : cardX - u * 3, cardY + cardH, cardH, cond, land ? u * 18 : u * 16, { rotation: -90, align: 'left', autoFit: true, fill: 'transparent', stroke: C.violet, strokeWidth: 2.5, opacity: 0.7 }))
  out.push(S('Tarjeta', 'rect', cardX, cardY, cardW, cardH, { fill: 'rgba(76,29,149,0.35)', stroke: 'rgba(142,68,255,0.4)', strokeWidth: 2 }))
  out.push(photo(cardX, cardY + u * 3, cardW, cardH - u * 3, { fit: 'contain' }))
  out.push(S('Esquinas', 'frame', cardX + u * 2, cardY + u * 2, cardW - u * 4, cardH - u * 4, { stroke: C.ember, strokeWidth: 3 }))
  out.push(T('Badge', undefined, 'MVP', cardX + u * 4, cardY + u * 4, u * 9, cond, u * 3.6, { align: 'center', fill: C.black, background: C.ember }))
  out.push(T('Acento', 'mvpScript', '', cardX + cardW * 0.1, cardY + cardH - u * 12, cardW, 'manuscrita', u * (land ? 6 : 7), { align: 'center', fill: C.ember, rotation: -8, autoFit: true, lineHeight: 1.3 }))
  const tx = land ? W * 0.66 : m
  const tw = land ? W * 0.34 - m : W - 2 * m
  const ty = land ? u * 18 : cardY + cardH + u * 6
  out.push(T('Titular', 'title', '', tx, ty, tw, cond, land ? u * 22 : u * 18, { align: 'left', lineHeight: 0.9 }))
  out.push(T('Nickname', 'sub', '', tx, ty + (land ? u * 20 : u * 16.5), tw, cond, land ? u * 11 : u * 11, { align: 'left', fill: C.ember, autoFit: true, lineHeight: 0.9 }))
  out.push(T('Nombre real', 'info', '', tx, ty + (land ? u * 31 : u * 27.5), tw, 'manuscrita', u * 3.6, { align: 'left', fill: C.lilac, }))
  const gy = ty + (land ? u * 38 : u * 33)
  const cw = (tw - u * 3) / 2
  const rh = u * 6.4
  stats.forEach(([l, v], i) => out.push(...stat(l, v, tx + (i % 2) * (cw + u * 3), gy + Math.floor(i / 2) * rh, cw, rh, i)))
  return out
}

/**
 * TIPOGRÁFICO — el titular repetido como patrón de fondo (filas oscuras y una resaltada en violeta),
 * los jugadores al centro, dato gigante en ámbar (hora / marcador) y acento manuscrito.
 */
function typo(c: Ctx): Layer[] {
  const { W, H, u, d, fmt } = c
  const land = fmt === 'x'
  const m = u * 7
  const top = c.safeTop
  const bottom = H - c.safeBottom
  const cond = 'condensada'
  const out: Layer[] = []
  const k = heroKind(c)

  // patrón de filas
  const rowSize = land ? u * 15 : u * 17
  const rowStep = rowSize * 0.88
  const nRows = Math.ceil(H / rowStep) + 1
  const hiRow = Math.floor(nRows * (land ? 0.36 : 0.4))
  for (let i = 0; i < nRows; i++) {
    const hi = i === hiRow
    out.push(
      T(hi ? 'Patrón resaltado' : `Patrón ${i + 1}`, 'patternRow', '', -u * 4 - (i % 2 ? rowSize * 1.6 : 0), -rowSize * 0.35 + i * rowStep, W * 3, cond, rowSize, {
        align: 'left',
        fill: hi ? '#8A2BE2' : '#2A1C40',
        opacity: hi ? 1 : 0.75,
        lineHeight: 1,
        locked: true,
      }, 1),
    )
  }

  // jugadores / héroe al centro
  const heroTop = land ? H * 0.15 : top + u * 16
  const heroBottom = land ? bottom - u * 9 : bottom - u * 36
  const hw = land ? W * 0.74 : W * 1.26
  const hx = (W - hw) / 2
  if (k === 'people') {
    const people = selectedPeople(d, c.r).slice(0, land ? 3 : 3)
    const row = { kind: 'stage' as const, x: hx, y: heroTop, w: hw, h: heroBottom - heroTop, overlap: overlapOf(c), dense: land }
    out.push(...reflowRow(people.map((_, i) => I(`Jugador ${i + 1}`, `person:${i}`, '', 0, 0, 1, 1, { fadeBottom: 0.3, row: { ...row, slot: i, role: 'photo' } }))))
  } else out.push(...hero(c, hx, heroTop, hw, heroBottom - heroTop))
  out.push(S('Fundido', 'rect', 0, heroBottom - u * 22, W, H - heroBottom + u * 22, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))

  // cabecera
  out.push(I('Logo chico', 'logo:team', '', m, top + u * 3.9, u * 8, u * 8, { glow: 0.2 }))
  out.push(T('Encabezado', 'panelHeader', '', m + u * 10, top + u * 5, W * 0.4, cond, u * 5.4, { align: 'left', letterSpacing: u * 0.1 }))
  out.push(T('Juego', undefined, 'VALORANT', W / 2, top + u * 5, W / 2 - m, cond, u * 5.4, { align: 'right', fill: C.lilac, letterSpacing: u * 0.1 }))

  // pie
  const rowY = bottom - m - u * 4
  // la hora ya va grande: abajo sólo el día
  panelFooter(c, out, rowY, c.v.bigData && d.type === 'matchday' ? 'panelDay' : 'panelDate')
  const bigSize = land ? u * 19 : u * 22
  const bigY = rowY - u * 5 - bigSize * 0.9
  if (c.v.bigData) {
    out.push(T('Dato grande', 'bigData', '', m, bigY, land ? W * 0.3 : W * 0.6, cond, bigSize, { align: 'left', fill: C.ember, lineHeight: 0.9, autoFit: true }))
    out.push(T('Unidad', 'bigUnit', '', m + bigSize * 1.85, bigY + bigSize * 0.48, u * 14, cond, u * 7, { align: 'left', fill: C.white }))
  } else {
    out.push(T('Titular', 'panelTitle', '', m, bigY, land ? W * 0.45 : W - 2 * m, cond, bigSize, { align: 'left', lineHeight: 0.9, autoFit: true }))
  }
  if (d.type === 'matchday' || d.type === 'resultado') panelVs(c, out, bigY - u * 10)
  else out.push(T('Contexto', 'sub', '', m, bigY - u * 8, W * 0.6, cond, u * 6, { align: 'left', fill: C.lilac, letterSpacing: u * 0.1, autoFit: true }))
  out.push(T('Acento', 'script2', '', land ? W * 0.68 : W * 0.5, rowY - u * (land ? 16 : 50), land ? W * 0.28 : W * 0.44, 'manuscrita', land ? u * 7 : u * 8, { align: 'center', fill: C.lilac, rotation: -6, autoFit: true, lineHeight: 1.3 }))
  return out
}
