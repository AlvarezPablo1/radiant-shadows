import { useEffect, useState } from 'react'
import type { BgRecipe } from '../types'
import { fire, particles, photo, shadows, silhouette, smoke, sparkles } from './bg/layers'
import { cornerLines, neonLines, viewfinder } from './bg/lines'
import { grain, pattern, radial, rng, TONES, type Draw } from './bg/tools'

export { BG_PRESETS, forTeam, makeRecipe } from './bg/presets'

/**
 * Dibuja el fondo procedural: base oscura con dos focos de luz y, encima, cada capa activa de la receta.
 * El orden de las capas no se cambia: todas sacan números de la misma semilla y así un fondo guardado se ve igual.
 */
export async function renderBackground(r: BgRecipe, w: number, h: number): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const rand = rng(r.seed)
  const T = TONES[r.tone]
  const S = Math.max(w, h)
  const d: Draw = { ctx, r, w, h, S, T, rand }

  ctx.fillStyle = T.base
  ctx.fillRect(0, 0, w, h)
  // dos focos de luz violeta (esquinas opuestas, según la semilla)
  const corner = rand() > 0.5
  radial(ctx, corner ? w * 0.85 : w * 0.15, h * 0.12, S * 0.75, T.glow + '0.42)', T.glow + '0)')
  radial(ctx, corner ? w * 0.1 : w * 0.9, h * 0.92, S * 0.6, T.glow + '0.3)', T.glow + '0)')

  if (r.image) await photo(d)
  if (r.smoke > 0) smoke(d)
  if (r.shadows > 0) shadows(d)
  if (r.silhouette !== 'none' && r.silhouetteOpacity > 0) await silhouette(d)
  // texturas: hexágonos (trama de las camisetas) y escamas
  if (r.hex > 0) pattern(ctx, w, h, r.hex, 'hex', rand)
  if (r.scales > 0) pattern(ctx, w, h, r.scales, 'scales', rand)
  if (r.fire > 0) fire(d)
  if (r.particles > 0) particles(d)
  if (r.sparkles > 0) sparkles(d)
  if (r.lines) cornerLines(d)
  if (r.neon) neonLines(d)
  if (r.corners) viewfinder(d)
  // grano sutil para evitar fondos planos / banding
  grain(ctx, w, h, rand)
  return c
}

const bgCache = new Map<string, Promise<HTMLCanvasElement>>()
export function getBackground(r: BgRecipe, w: number, h: number) {
  const key = JSON.stringify(r) + w + 'x' + h
  let p = bgCache.get(key)
  if (!p) {
    p = renderBackground(r, w, h)
    if (bgCache.size > 30) bgCache.clear()
    bgCache.set(key, p)
  }
  return p
}

export function useBackground(r: BgRecipe, w: number, h: number) {
  const [c, setC] = useState<HTMLCanvasElement>()
  const key = JSON.stringify(r) + w + 'x' + h
  useEffect(() => {
    let alive = true
    getBackground(r, w, h).then((cv) => alive && setC(cv))
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
  return c
}
