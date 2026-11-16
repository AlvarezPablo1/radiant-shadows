/* utilidades del dibujo de fondos: azar con semilla, tonos, degradados, patrones y grano */

export function rng(seed: number) {
  let s = seed >>> 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return ((s >>> 0) % 100000) / 100000
  }
}

export const TONES = {
  deep: { base: '#000010', glow: 'rgba(76,29,149,', glow2: 'rgba(116,21,193,' },
  violet: { base: '#05001a', glow: 'rgba(116,21,193,', glow2: 'rgba(142,68,255,' },
  shadow: { base: '#07060c', glow: 'rgba(46,38,54,', glow2: 'rgba(76,29,149,' },
  ember: { base: '#06000f', glow: 'rgba(116,21,193,', glow2: 'rgba(255,179,71,' },
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t

export function radial(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, c0: string, c1: string) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r)
  g.addColorStop(0, c0)
  g.addColorStop(1, c1)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height)
}

export function pattern(ctx: CanvasRenderingContext2D, w: number, h: number, k: number, kind: 'hex' | 'scales', rand: () => number) {
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

export function grain(ctx: CanvasRenderingContext2D, w: number, h: number, rand: () => number) {
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

/** lo que necesita cada capa para dibujarse */
export interface Draw {
  ctx: CanvasRenderingContext2D
  r: import('../../types').BgRecipe
  w: number
  h: number
  /** lado más largo */
  S: number
  T: (typeof TONES)[keyof typeof TONES]
  rand: () => number
}
