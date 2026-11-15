import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { I, S, T, textHeight, type Ctx } from './core'
import { hero, heroKind } from './parts'

/**
 * NEÓN — basado en las placas actuales del equipo (Match Day / Game Day):
 * logo chico + "VALORANT" arriba, texto vertical al costado, isotipo gigante con glow
 * (o la foto), titular condensado en dos líneas (blanco / violeta), divisor y fila
 * inferior con rival a la izquierda y fecha/dato destacado en ámbar a la derecha.
 */
export function neon(c: Ctx): Layer[] {
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
  if (!bigLogo) out.push(I('Logo chico', 'logo:team', '', m, top, u * 9, u * 9, { glow: 0.2 }))
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
  const size = land ? u * 19 : u * 23
  const tw = land ? W * 0.56 : W * 0.78
  const titleLayers: TextLayer[] = []
  let titleTop: number
  const withKicker = d.type !== 'matchday' && d.type !== 'resultado' && (c.v.title || '').trim().split(/\s+/).length < 2 && !!c.v.kicker
  if (withKicker) {
    const t1 = T('Titular', 'title', '', m, titleBottom - size * 0.92, tw, cond, size, { align: 'left', autoFit: true, fill: C.white, lineHeight: 0.9, extrude: u * 0.5 })
    const k1 = T('Frase', 'kicker', '', m, t1.y - u * (land ? 10 : 12), tw, 'manuscrita', u * (land ? 9 : 10), { align: 'left', fill: C.ember, rotation: -4, lineHeight: 1.3, autoFit: true })
    titleLayers.push(k1, t1)
    titleTop = k1.y
  } else if (land) {
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
    } else if (k === 'mascot') heroLayers.push(...hero(c, W * 0.08, areaTop - u * 4, W * 0.84, titleTop - areaTop))
    else heroLayers.push(...hero(c, -u * 6, areaTop - u * 6, W + u * 12, areaH + u * 14))
  }
  out.unshift(...heroLayers)
  out.push(...titleLayers)
  return out
}

