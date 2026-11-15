import { C } from '../../brand'
import type { Layer } from '../../types'
import { I, S, T, type Ctx } from './core'
import { hero, heroKind, overlapOf, panelFooter, panelVs } from './parts'
import { reflowRow } from './rows'
import { selectedPeople } from '../postTypes'
/**
 * TIPOGRÁFICO — el titular repetido como patrón de fondo (filas oscuras y una resaltada en violeta),
 * los jugadores al centro, dato gigante en ámbar (hora / marcador) y acento manuscrito.
 */
export function typo(c: Ctx): Layer[] {
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
    const people = selectedPeople(d, c.r).slice(0, land ? 5 : 3)
    const row = { kind: 'stage' as const, x: hx, y: heroTop, w: hw, h: heroBottom - heroTop, overlap: land ? 0.08 : overlapOf(c), dense: false }
    out.push(...reflowRow(people.map((_, i) => I(`Jugador ${i + 1}`, `person:${i}`, '', 0, 0, 1, 1, { fadeBottom: 0.3, row: { ...row, slot: i, role: 'photo' } }))))
  } else out.push(...hero(c, hx, heroTop, hw, heroBottom - heroTop))
  out.push(S('Fundido', 'rect', 0, heroBottom - u * 22, W, H - heroBottom + u * 22, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true }))

  // cabecera
  out.push(I('Logo chico', 'logo:team', '', m, top + u * 3.9, u * (land ? 8 : 11), u * (land ? 8 : 11), { glow: 0.2 }))
  out.push(T('Juego', undefined, 'VALORANT', W / 2, top + u * 5, W / 2 - m, cond, u * 5.4, { align: 'right', fill: C.lilac, letterSpacing: u * 0.1 }))

  // pie
  const rowY = bottom - m - u * 4
  // la hora ya va grande: abajo sólo el día
  panelFooter(c, out, rowY, c.v.bigData && d.type === 'matchday' ? 'panelDay' : 'panelDate')
  const bigSize = land ? u * 16 : u * 19
  const bigY = rowY - u * 5 - bigSize * 0.9
  if (c.v.bigData) {
    // marcador en ámbar; en las derrotas, en lila
    out.push(T('Dato grande', 'bigData', '', m, bigY, land ? W * 0.3 : W * 0.6, cond, bigSize, { align: 'left', fill: c.v.title === 'DERROTA' ? C.violetLight : C.ember, lineHeight: 0.9, autoFit: true }))
    out.push(T('Unidad', 'bigUnit', '', m + bigSize * 1.85, bigY + bigSize * 0.48, u * 14, cond, u * 7, { align: 'left', fill: C.white }))
  } else {
    out.push(T('Titular', 'panelTitle', '', m, bigY, land ? W * 0.45 : W - 2 * m, cond, bigSize, { align: 'left', lineHeight: 0.9, autoFit: true }))
  }
  if (d.type === 'matchday' || d.type === 'resultado') panelVs(c, out, bigY - u * 10)
  else out.push(T('Contexto', 'sub', '', m, bigY - u * 8, W * 0.6, cond, u * 6, { align: 'left', fill: C.lilac, letterSpacing: u * 0.1, autoFit: true }))
  return out
}

