import { useEffect, useState } from 'react'
import { LOGOS } from '../brand'
import type { BgRecipe } from '../types'
import { applyFilter } from './filters'
import { loadImage } from './images'

/** Fondos procedurales según el Manual de Recursos Visuales (cap. 09):
 *  fondo oscuro + textura sutil + una energía + líneas de orden + personaje cuando corresponda. */

export const BG_PRESETS: Record<string, { label: string; recipe: Omit<BgRecipe, 'preset' | 'seed' | 'image' | 'imageDim' | 'imageFilter'> }> = {
  competitivo: { label: 'Competitivo', recipe: { tone: 'deep', smoke: 0.5, fire: 0, hex: 0.45, scales: 0, particles: 0.35, sparkles: 0, shadows: 0.3, lines: true, silhouette: 'rs', silhouetteOpacity: 0.07 } },
  victoria: { label: 'Victoria', recipe: { tone: 'violet', smoke: 0.7, fire: 0, hex: 0.3, scales: 0, particles: 0.6, sparkles: 0, shadows: 0.2, lines: true, silhouette: 'rs', silhouetteOpacity: 0.1 } },
  derrota: { label: 'Sombras', recipe: { tone: 'shadow', smoke: 0.35, fire: 0, hex: 0.25, scales: 0, particles: 0.15, sparkles: 0, shadows: 0.85, lines: true, silhouette: 'rs', silhouetteOpacity: 0.05 } },
  institucional: { label: 'Institucional', recipe: { tone: 'deep', smoke: 0.3, fire: 0, hex: 0.22, scales: 0, particles: 0, sparkles: 0, shadows: 0.3, lines: true, silhouette: 'none', silhouetteOpacity: 0.06 } },
  celebracion: { label: 'Celebración', recipe: { tone: 'ember', smoke: 0.7, fire: 0, hex: 0, scales: 0, particles: 0.7, sparkles: 0, shadows: 0.2, lines: false, silhouette: 'gc', silhouetteOpacity: 0.06 } },
  escamas: { label: 'Escamas', recipe: { tone: 'deep', smoke: 0.4, fire: 0, hex: 0, scales: 0.55, particles: 0.25, sparkles: 0, shadows: 0.4, lines: true, silhouette: 'rs', silhouetteOpacity: 0.08 } },
  humo: { label: 'Humo (stream)', recipe: { tone: 'violet', smoke: 1, fire: 0, hex: 0, scales: 0, particles: 0.6, sparkles: 0, shadows: 0.4, lines: false, silhouette: 'rs', silhouetteOpacity: 0.14 } },
  neon: { label: 'Neón', recipe: { tone: 'deep', smoke: 0.35, fire: 0, hex: 0, scales: 0, particles: 0, sparkles: 0, shadows: 0.55, lines: false, neon: 0.85, corners: true, silhouette: 'none', silhouetteOpacity: 0.06 } },
  sobrio: { label: 'Sobrio', recipe: { tone: 'deep', smoke: 0.3, fire: 0, hex: 0, scales: 0, particles: 0, sparkles: 0, shadows: 0.6, lines: false, corners: false, silhouette: 'none', silhouetteOpacity: 0.06 } },
  nocturno: { label: 'Nocturno', recipe: { tone: 'shadow', smoke: 0.45, fire: 0, hex: 0, scales: 0.25, particles: 0.2, sparkles: 0, shadows: 0.5, lines: false, silhouette: 'none', silhouetteOpacity: 0.06 } },
}

/**
 * Textura de fondo de cada equipo: escamas en MAIN y hexágonos en GC (con la misma intensidad que traiga el estilo,
 * o una suave si el estilo no tenía textura).
 */
export function forTeam<R extends { hex: number; scales: number }>(r: R, roster: string): R {
  const amount = Math.max(r.hex, r.scales) || 0.3
  return roster === 'gc' ? { ...r, hex: amount, scales: 0 } : { ...r, hex: 0, scales: amount }
}

export function makeRecipe(preset: string, seed = Math.floor(Math.random() * 1e6)): BgRecipe {
  return { preset, seed, neon: 0, corners: false, ...BG_PRESETS[preset].recipe, imageDim: 0.45, imageFilter: 'none' }
}

function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

const TONES = {
  deep: { base: '#000010', glow: 'rgba(76,29,149,', glow2: 'rgba(116,21,193,' },
  violet: { base: '#05001a', glow: 'rgba(116,21,193,', glow2: 'rgba(142,68,255,' },
  shadow: { base: '#07060c', glow: 'rgba(46,38,54,', glow2: 'rgba(76,29,149,' },
  ember: { base: '#06000f', glow: 'rgba(116,21,193,', glow2: 'rgba(255,179,71,' },
}

export async function renderBackground(r: BgRecipe, w: number, h: number): Promise<HTMLCanvasElement> {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const ctx = c.getContext('2d')!
  const rand = rng(r.seed)
  const T = TONES[r.tone]
  const S = Math.max(w, h)

  ctx.fillStyle = T.base
  ctx.fillRect(0, 0, w, h)

  // Glow base: dos focos de luz violeta (esquinas opuestas, posición según seed)
  const corner = rand() > 0.5
  radial(ctx, corner ? w * 0.85 : w * 0.15, h * 0.12, S * 0.75, T.glow + '0.42)', T.glow + '0)')
  radial(ctx, corner ? w * 0.1 : w * 0.9, h * 0.92, S * 0.6, T.glow + '0.3)', T.glow + '0)')

  // Imagen de fondo propia (foto de la página actual, captura, etc.)
  if (r.image) {
    try {
      const img = await loadImage(r.image)
      const k = Math.max(w / img.naturalWidth, h / img.naturalHeight)
      const iw = img.naturalWidth * k,
        ih = img.naturalHeight * k
      const tmp = document.createElement('canvas')
      tmp.width = w
      tmp.height = h
      const t = tmp.getContext('2d', { willReadFrequently: true })!
      t.drawImage(img, (w - iw) / 2, (h - ih) / 2, iw, ih)
      if (r.imageFilter !== 'none') {
        const d = t.getImageData(0, 0, w, h)
        applyFilter(d.data, r.imageFilter)
        t.putImageData(d, 0, 0)
      }
      ctx.drawImage(tmp, 0, 0)
      ctx.fillStyle = `rgba(0,0,16,${r.imageDim})`
      ctx.fillRect(0, 0, w, h)
    } catch {
      /* imagen no disponible: se sigue con el fondo procedural */
    }
  }

  // HUMO: manchas difusas grandes
  if (r.smoke > 0) {
    const n = 7
    for (let i = 0; i < n; i++) {
      const x = rand() * w,
        y = rand() * h,
        rad = S * (0.25 + rand() * 0.35)
      const pale = rand() < 0.22
      const a = r.smoke * (pale ? 0.13 : 0.32) * (0.5 + rand() * 0.5)
      const col = pale ? 'rgba(200,190,230,' : rand() > 0.5 ? T.glow2 : T.glow
      radial(ctx, x, y, rad, col + a + ')', col + '0)')
    }
  }

  // SOMBRAS: masas oscuras
  if (r.shadows > 0) {
    for (let i = 0; i < 4; i++) {
      const x = rand() * w,
        y = rand() * h,
        rad = S * (0.3 + rand() * 0.3)
      radial(ctx, x, y, rad, `rgba(0,0,8,${0.55 * r.shadows})`, 'rgba(0,0,8,0)')
    }
    // viñeta
    const g = ctx.createRadialGradient(w / 2, h / 2, S * 0.3, w / 2, h / 2, S * 0.8)
    g.addColorStop(0, 'rgba(0,0,10,0)')
    g.addColorStop(1, `rgba(0,0,10,${0.7 * r.shadows})`)
    ctx.fillStyle = g
    ctx.fillRect(0, 0, w, h)
  }

  // SILUETA de dragón / isotipo grande, parcialmente oculta y con bajo contraste
  if (r.silhouette !== 'none' && r.silhouetteOpacity > 0) {
    const src = r.silhouette === 'gc' ? LOGOS.gc.negative : LOGOS.main.negative
    try {
      const img = await loadImage(src)
      const size = S * 0.85
      const k = size / Math.max(img.naturalWidth, img.naturalHeight)
      const iw = img.naturalWidth * k,
        ih = img.naturalHeight * k
      const tint = document.createElement('canvas')
      tint.width = iw
      tint.height = ih
      const t = tint.getContext('2d')!
      t.drawImage(img, 0, 0, iw, ih)
      t.globalCompositeOperation = 'source-in'
      t.fillStyle = '#8E44FF'
      t.fillRect(0, 0, iw, ih)
      ctx.save()
      ctx.globalAlpha = r.silhouetteOpacity
      const side = rand() > 0.5
      const cx = r.preset === 'humo' ? w / 2 : side ? w * 0.78 : w * 0.22
      const cy = r.preset === 'humo' ? h / 2 : h * (0.4 + rand() * 0.25)
      ctx.drawImage(tint, cx - iw / 2, cy - ih / 2)
      ctx.restore()
    } catch {
      /* ignore */
    }
  }

  // HEX: patrón hexagonal (trama de las camisetas) con fundido radial
  if (r.hex > 0) pattern(ctx, w, h, r.hex, 'hex', rand)
  if (r.scales > 0) pattern(ctx, w, h, r.scales, 'scales', rand)

  // FUEGO abstracto: curvas suaves con glow controlado
  if (r.fire > 0) {
    const curves = r.fire > 0.75 ? 2 : 1
    for (let i = 0; i < curves; i++) {
      const fromLeft = (rand() > 0.5) !== (i === 1)
      const p0 = { x: fromLeft ? w * (0.1 + rand() * 0.25) : w * (0.6 + rand() * 0.3), y: h * 1.02 }
      const p3 = { x: fromLeft ? w * 1.02 : -w * 0.02, y: h * (0.08 + rand() * 0.3) }
      const c1 = { x: lerp(p0.x, p3.x, 0.35) + w * 0.12 * (fromLeft ? 1 : -1), y: lerp(p0.y, p3.y, 0.2) }
      const c2 = { x: lerp(p0.x, p3.x, 0.55), y: lerp(p0.y, p3.y, 0.75) + h * 0.08 }
      ctx.save()
      ctx.lineCap = 'round'
      for (const [lw, a, blur] of [
        [S * 0.03, 0.12 * r.fire, S * 0.05],
        [S * 0.009, 0.55 * r.fire, S * 0.02],
        [S * 0.003, 0.6 * r.fire, S * 0.005],
      ]) {
        ctx.strokeStyle = i === 1 ? `rgba(142,68,255,${a * 0.7})` : `rgba(116,21,193,${a})`
        if (lw < S * 0.005) ctx.strokeStyle = `rgba(214,190,255,${a * 0.6})`
        ctx.lineWidth = lw
        ctx.shadowColor = '#7415C1'
        ctx.shadowBlur = blur
        ctx.beginPath()
        ctx.moveTo(p0.x, p0.y)
        ctx.bezierCurveTo(c1.x, c1.y, c2.x, c2.y, p3.x, p3.y)
        ctx.stroke()
      }
      ctx.restore()
    }
  }

  // PARTÍCULAS: trazos cortos (brasas violetas y algunas doradas)
  if (r.particles > 0) {
    const n = Math.round(160 * r.particles * (S / 1600))
    ctx.save()
    ctx.lineCap = 'round'
    for (let i = 0; i < n; i++) {
      const x = rand() * w,
        y = rand() * h
      const len = S * (0.004 + rand() * 0.012)
      const ang = -Math.PI / 4 + (rand() - 0.5) * 0.9
      const ember = r.tone === 'ember' || r.preset === 'humo' ? rand() < 0.35 : rand() < 0.1
      ctx.strokeStyle = ember ? `rgba(255,200,90,${0.35 + rand() * 0.5})` : `rgba(160,100,255,${0.25 + rand() * 0.55})`
      ctx.shadowColor = ember ? '#FFB347' : '#8E44FF'
      ctx.shadowBlur = 6
      ctx.lineWidth = 1.2 + rand() * 2.2
      ctx.beginPath()
      ctx.moveTo(x, y)
      ctx.lineTo(x + Math.cos(ang) * len, y + Math.sin(ang) * len)
      ctx.stroke()
    }
    ctx.restore()
  }

  // BRILLOS violetas: destellos de 4 puntas
  if (r.sparkles > 0) {
    const n = Math.round(40 * r.sparkles)
    ctx.save()
    for (let i = 0; i < n; i++) {
      const x = rand() * w,
        y = rand() * h
      const s = S * (0.004 + rand() * rand() * 0.016)
      ctx.strokeStyle = `rgba(199,155,255,${0.4 + rand() * 0.5})`
      ctx.fillStyle = 'rgba(230,215,255,0.9)'
      ctx.shadowColor = '#8E44FF'
      ctx.shadowBlur = 10
      ctx.lineWidth = 1.2
      ctx.beginPath()
      ctx.moveTo(x - s * 2, y)
      ctx.lineTo(x + s * 2, y)
      ctx.moveTo(x, y - s * 2)
      ctx.lineTo(x, y + s * 2)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(x, y, s * 0.35, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.restore()
  }

  // LÍNEAS y marcos abiertos: cortes angulares en esquinas opuestas
  if (r.lines) {
    const m = Math.min(w, h) * 0.06
    const L = Math.min(w, h) * 0.2
    ctx.save()
    ctx.lineWidth = Math.max(2, S * 0.0018)
    ctx.strokeStyle = 'rgba(116,21,193,0.9)'
    ctx.beginPath()
    ctx.moveTo(m, m * 1.25)
    ctx.lineTo(m + L, m * 1.25)
    ctx.lineTo(m + L + m * 0.6, m * 0.65)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(w - m, h - m * 1.25)
    ctx.lineTo(w - m - L, h - m * 1.25)
    ctx.lineTo(w - m - L - m * 0.6, h - m * 0.65)
    ctx.stroke()
    ctx.strokeStyle = 'rgba(234,234,234,0.55)'
    ctx.lineWidth = Math.max(1.5, S * 0.0012)
    ctx.beginPath()
    ctx.moveTo(w - m - L * 0.45, m * 1.6)
    ctx.lineTo(w - m, m * 1.6)
    ctx.moveTo(m, h - m * 1.6)
    ctx.lineTo(m + L * 0.45, h - m * 1.6)
    ctx.stroke()
    ctx.restore()
  }

  // NEÓN: dos líneas diagonales luminosas que cruzan la pieza
  if (r.neon) {
    const k = r.neon
    const ys = [h * (0.3 + rand() * 0.12), h * (0.62 + rand() * 0.1)]
    const tilt = -h * 0.07 * (w / Math.max(w, h)) * 1.4
    ctx.save()
    ctx.lineCap = 'round'
    for (const y of ys) {
      for (const [lw, col, blur] of [
        [S * 0.03, `rgba(116,21,193,${0.35 * k})`, S * 0.04],
        [S * 0.008, `rgba(170,110,255,${0.9 * k})`, S * 0.02],
        [S * 0.0025, `rgba(245,235,255,${k})`, S * 0.004],
      ] as [number, string, number][]) {
        ctx.strokeStyle = col
        ctx.lineWidth = lw
        ctx.shadowColor = '#8E44FF'
        ctx.shadowBlur = blur
        ctx.beginPath()
        ctx.moveTo(-w * 0.05, y - tilt / 2)
        ctx.lineTo(w * 1.05, y + tilt / 2)
        ctx.stroke()
      }
    }
    ctx.restore()
  }

  // ESQUINAS tipo visor
  if (r.corners) {
    const m = Math.min(w, h) * 0.022
    const L = Math.min(w, h) * 0.045
    ctx.save()
    ctx.strokeStyle = 'rgba(142,68,255,0.7)'
    ctx.lineWidth = Math.max(2, S * 0.0014)
    for (const [x, y, sx, sy] of [
      [m, m, 1, 1],
      [w - m, m, -1, 1],
      [m, h - m, 1, -1],
      [w - m, h - m, -1, -1],
    ]) {
      ctx.beginPath()
      ctx.moveTo(x, y + L * sy)
      ctx.lineTo(x, y)
      ctx.lineTo(x + L * sx, y)
      ctx.stroke()
    }
    ctx.restore()
  }

  // grano sutil para evitar fondos planos / banding
  grain(ctx, w, h, rand)
  return c
}

const lerp = (a: number, b: number, t: number) => a + (b - a) * t

function radial(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c0: string, c1: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, c0)
  g.addColorStop(1, c1)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

function pattern(ctx: CanvasRenderingContext2D, w: number, h: number, k: number, kind: 'hex' | 'scales', rand: () => number) {
  const layer = document.createElement('canvas')
  layer.width = w
  layer.height = h
  const p = layer.getContext('2d')!
  const S = Math.max(w, h)
  p.strokeStyle = 'rgba(142,68,255,1)'
  p.lineWidth = Math.max(1.2, S * 0.0011)
  if (kind === 'hex') {
    const r = S * 0.022
    const dx = r * Math.sqrt(3) * 1.15,
      dy = r * 1.5 * 1.15
    for (let row = -1, y = 0; y < h + dy; row++, y = row * dy) {
      for (let x = row % 2 ? dx / 2 : 0; x < w + dx; x += dx) {
        p.beginPath()
        for (let i = 0; i < 6; i++) {
          const a = (Math.PI / 3) * i + Math.PI / 6
          const px = x + Math.cos(a) * r,
            py = y + Math.sin(a) * r
          if (i) p.lineTo(px, py)
          else p.moveTo(px, py)
        }
        p.closePath()
        p.stroke()
      }
    }
  } else {
    const r = S * 0.028
    for (let row = 0, y = 0; y < h + r; row++, y = row * r * 0.75) {
      for (let x = row % 2 ? r : 0; x < w + r * 2; x += r * 2) {
        p.beginPath()
        p.arc(x, y, r, Math.PI * 0.05, Math.PI * 0.95)
        p.stroke()
      }
    }
  }
  // máscara radial: más visible en una zona, desaparece hacia el resto
  p.globalCompositeOperation = 'destination-in'
  const cx = w * (0.3 + rand() * 0.4),
    cy = h * (0.3 + rand() * 0.4)
  const g = p.createRadialGradient(cx, cy, 0, cx, cy, S * 0.75)
  g.addColorStop(0, 'rgba(0,0,0,1)')
  g.addColorStop(1, 'rgba(0,0,0,0.15)')
  p.fillStyle = g
  p.fillRect(0, 0, w, h)
  ctx.save()
  ctx.globalAlpha = 0.22 * k
  ctx.drawImage(layer, 0, 0)
  ctx.restore()
}

function grain(ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) {
  const n = document.createElement('canvas')
  n.width = n.height = 256
  const t = n.getContext('2d')!
  const d = t.createImageData(256, 256)
  for (let i = 0; i < d.data.length; i += 4) {
    const v = rand() * 255
    d.data[i] = d.data[i + 1] = d.data[i + 2] = v
    d.data[i + 3] = 14
  }
  t.putImageData(d, 0, 0)
  ctx.save()
  ctx.fillStyle = ctx.createPattern(n, 'repeat')!
  ctx.globalCompositeOperation = 'overlay'
  ctx.fillRect(0, 0, w, h)
  ctx.restore()
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
