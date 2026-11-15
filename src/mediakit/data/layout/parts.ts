import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { outcome, postType, selectedPeople } from '../postTypes'
import { I, S, T, type Align, type Ctx } from './core'
import { DEFAULT_OVERLAP, reflowRow } from './rows'

export function heroKind(c: Ctx): 'person' | 'people' | 'mascot' | 'logo' | 'none' {
  const t = postType(c.d.type)
  if (c.d.visual === 'mascots') return 'mascot'
  if (c.d.visual === 'none') return c.d.type === 'comunicado' || c.d.type === 'stream' ? 'none' : 'logo'
  if (t.people === 'one') return 'person'
  if (t.people === 'many') return 'people'
  return 'mascot'
}

/** Imagen(es) principal(es) dentro de un rectángulo. */
export function hero(c: Ctx, x: number, y: number, w: number, h: number, flip = false): Layer[] {
  const k = heroKind(c)
  // por defecto las fotos van sin filtro (se elige uno desde Edición si se quiere)
  const photoFilter = 'none' as const
  if (k === 'person') return [I('Foto', 'person:0', '', x, y, w, h, { fadeBottom: 0.22, glow: 0.75, filter: photoFilter, flipX: flip })]
  // la mascota es un sticker con su palabra abajo: sin fundido, para que se lea entera
  if (k === 'mascot') return [I('Mascota', 'mascot', '', x, y, w, h, { glow: 0.25, flipX: flip })]
  if (k === 'logo') {
    const s = Math.min(w, h) * 0.78
    if (c.d.fields.noPhotoArt === 'teclas') return [I('Teclas RSWP', 'art:keycaps', '', x + (w - s) / 2, y + (h - s) / 2, s, s, {})]
    return [I('Isotipo', 'logo:team', '', x + (w - s) / 2, y + (h - s) / 2, s, s, { glow: 0.5, opacity: 0.95 })]
  }
  if (k === 'none') return []
  // varias personas: fila con superposición, el del medio más grande y adelante
  const people = selectedPeople(c.d, c.r).slice(0, 6)
  // los jugadores se ven más grandes: la fila crece hacia arriba (las cabezas pueden pisar un poco el texto de fondo)
  // (sin salirse de la placa: nunca se cortan las cabezas arriba)
  const grow = Math.min(h * 0.14, Math.max(0, y - c.u * 2))
  const row = { kind: 'stage' as const, x, y: y - grow, w, h: h + grow, overlap: overlapOf(c), dense: c.fmt === 'x' }
  const ls = people.map((_, i) => I(`Jugador ${i + 1}`, `person:${i}`, '', 0, 0, 1, 1, { fadeBottom: 0.25, glow: 0.25, filter: photoFilter, row: { ...row, slot: i, role: 'photo' } }))
  return reflowRow(ls)
}

export const overlapOf = (c: Ctx) => (c.d.fields.rowOverlap !== undefined && c.d.fields.rowOverlap !== '' ? Number(c.d.fields.rowOverlap) : DEFAULT_OVERLAP)
/** Bloque "logo vs logo" o marcador. */
export function versus(cx: number, y: number, size: number, center: 'vs' | 'score'): Layer[] {
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

export function footer(c: Ctx, align: Align = 'center'): Layer[] {
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
export function mainTexts(c: Ctx, x: number, w: number, align: Align, scale = 1): (TextLayer | number | null)[] {
  const { u, d } = c
  const s = (n: number) => n * u * scale
  const kick = T('Frase', 'kicker', '', x, 0, w, 'manuscrita', s(6.4), { align, fill: C.ember, lineHeight: 1.5, autoFit: true })
  // VICTORIA: grande (620 px, se achica sola hasta entrar en su caja) y con brillo neón al 90%
  const title =
    d.type === 'resultado' && outcome(d) === 'win'
      ? T('Titular', 'title', '', x, 0, w, 'condensada', 620, { align, autoFit: true, glow: 0.9, lineHeight: 0.95 }, 1)
      : T('Titular', 'title', '', x, 0, w, 'condensada', s(d.type === 'cumple' ? 18 : 17), { align, autoFit: true, glow: 0.35, lineHeight: 1 })
  const sub = T('Contexto', 'sub', '', x, 0, w, 'condensada', s(3.6), { align, fill: C.violetLight, letterSpacing: s(0.35), lineHeight: 1.2 })
  const info = T('Detalle', 'info', '', x, 0, w, 'manuscrita', s(3.6), { align, fill: C.white, opacity: 0.9, lineHeight: 1.25 })
  const body = T('Texto', 'body', '', x, 0, w, 'fuerza', s(3.4), { align, weight: '500', lineHeight: 1.35, fill: C.white })
  const list = T('Lista', 'list', '', x, 0, w, 'condensada', s(d.type === 'roster' ? 3.3 : 4.6), { align, lineHeight: 1.35, letterSpacing: s(0.15) })
  switch (d.type) {
    case 'cumple':
      return [T('Frase', 'kicker', '', x, 0, w, 'condensada', s(7), { align, fill: C.ember, letterSpacing: s(0.3) }), title, T('Nombre', 'sub', '', x + (align === 'left' ? w * 0.35 : 0), 0, w * (align === 'left' ? 0.65 : 1), 'manuscrita', s(9), { align, fill: C.lilac, autoFit: true, rotation: -6, lineHeight: 1.1 }), s(1), c.v.info ? info : null]
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
      return [kick, title, s(1.5), sub, s(0.8), info, s(0.6), T('Dónde verlo', 'foot', '', x, 0, w, 'condensada', s(4.2), { align, fill: C.lilac, letterSpacing: s(0.2) })]
    case 'resultado':
    case 'torneo':
    default:
      return [kick, title, s(1.5), sub, s(0.8), c.v.info ? info : null]
  }
}

export function panelFooter(c: Ctx, out: Layer[], rowY: number, dateBind = 'panelDate') {
  const { W, u } = c
  const m = u * 7
  out.push(T('Fecha', dateBind, '', m, rowY, W * 0.45, 'condensada', u * 5.4, { align: 'left', letterSpacing: u * 0.1 }))
  out.push(T('Fase', 'panelRight', '', W * 0.4, rowY, W * 0.6 - m, 'condensada', u * 5.4, { align: 'right', fill: C.lilac, letterSpacing: u * 0.1, autoFit: true }))
  out.push(S('Divisor', 'line', m, rowY - u * 3, W - 2 * m, 0, { stroke: 'rgba(199,155,255,0.3)', strokeWidth: 2 }))
}
export function panelVs(c: Ctx, out: Layer[], vy: number) {
  const { W, u, d } = c
  const m = u * 7
  if (d.type !== 'matchday' && d.type !== 'resultado') return
  out.push(T('VS', undefined, 'vs', m, vy + u * 0.4, u * 8, 'manuscrita', u * 6, { align: 'left', fill: C.ember }))
  out.push(I('Logo rival', 'logo:rival', '', m + u * 8.5, vy - u * 0.6, u * 8, u * 8, {}))
  out.push(T('Rival', 'rivalUpper', '', m + u * (d.fields.rivalLogo ? 18 : 9), vy + u * 0.8, W * 0.5, 'condensada', u * 6.4, { align: 'left', letterSpacing: u * 0.1 }))
}

