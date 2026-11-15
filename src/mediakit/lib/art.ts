/**
 * Arte generado para "Sin fotos": cuatro teclas R · S · W · P con brillo violeta
 * (basado en las placas Match Day actuales del equipo). Se dibuja una vez y queda en caché.
 */
let cache: string | undefined

export function keycapsArt(): string {
  if (cache) return cache
  const S = 1100
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!

  // resplandor violeta central
  const g = ctx.createRadialGradient(S * 0.5, S * 0.56, 0, S * 0.5, S * 0.56, S * 0.42)
  g.addColorStop(0, 'rgba(116,21,193,0.55)')
  g.addColorStop(0.5, 'rgba(76,29,149,0.2)')
  g.addColorStop(1, 'rgba(76,29,149,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)

  const keys: [string, number, number, number][] = [
    ['R', 0.27, 0.27, -12],
    ['S', 0.72, 0.22, 9],
    ['W', 0.3, 0.72, 10],
    ['P', 0.72, 0.7, -9],
  ]
  for (const [letter, kx, ky, rot] of keys) drawKey(ctx, letter, kx * S, ky * S, S * 0.3, (rot * Math.PI) / 180)
  cache = c.toDataURL('image/png')
  return cache
}

/** una sola tecla (para distribuirlas por la placa), con su resplandor */
const single = new Map<string, string>()
export function keyArt(letter: string, rotDeg = 0): string {
  const k = letter + rotDeg
  const hit = single.get(k)
  if (hit) return hit
  const S = 600
  const c = document.createElement('canvas')
  c.width = S
  c.height = S
  const ctx = c.getContext('2d')!
  const g = ctx.createRadialGradient(S / 2, S * 0.56, 0, S / 2, S * 0.56, S * 0.48)
  g.addColorStop(0, 'rgba(116,21,193,0.45)')
  g.addColorStop(1, 'rgba(76,29,149,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, S, S)
  drawKey(ctx, letter, S / 2, S / 2, S * 0.56, (rotDeg * Math.PI) / 180)
  const url = c.toDataURL('image/png')
  single.set(k, url)
  return url
}

function rr(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + w, y, x + w, y + h, r)
  ctx.arcTo(x + w, y + h, x, y + h, r)
  ctx.arcTo(x, y + h, x, y, r)
  ctx.arcTo(x, y, x + w, y, r)
  ctx.closePath()
}

function drawKey(ctx: CanvasRenderingContext2D, letter: string, cx: number, cy: number, size: number, rot: number) {
  const r = size * 0.16
  const depth = size * 0.07
  ctx.save()
  ctx.translate(cx, cy)
  ctx.rotate(rot)
  const x = -size / 2,
    y = -size / 2

  // sombra proyectada
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.75)'
  ctx.shadowBlur = size * 0.18
  ctx.shadowOffsetY = size * 0.1
  rr(ctx, x, y + depth, size, size, r)
  ctx.fillStyle = '#07040d'
  ctx.fill()
  ctx.restore()

  // base (canto de la tecla)
  rr(ctx, x, y + depth, size, size, r)
  ctx.fillStyle = '#140b22'
  ctx.fill()
  ctx.strokeStyle = 'rgba(116,21,193,0.35)'
  ctx.lineWidth = 2
  ctx.stroke()

  // cara superior
  rr(ctx, x, y, size, size, r)
  const face = ctx.createLinearGradient(x, y, x + size, y + size)
  face.addColorStop(0, '#2c1a45')
  face.addColorStop(0.55, '#1a0f2c')
  face.addColorStop(1, '#100820')
  ctx.fillStyle = face
  ctx.fill()
  // borde con glow
  ctx.save()
  ctx.shadowColor = '#8E44FF'
  ctx.shadowBlur = size * 0.1
  ctx.strokeStyle = 'rgba(160,100,255,0.8)'
  ctx.lineWidth = 2.5
  ctx.stroke()
  ctx.restore()
  // brillo interno superior
  rr(ctx, x + size * 0.06, y + size * 0.05, size * 0.88, size * 0.5, r * 0.8)
  const hi = ctx.createLinearGradient(0, y, 0, y + size * 0.55)
  hi.addColorStop(0, 'rgba(255,255,255,0.06)')
  hi.addColorStop(1, 'rgba(255,255,255,0)')
  ctx.fillStyle = hi
  ctx.fill()

  // letra
  ctx.save()
  ctx.font = `400 ${size * 0.34}px "Bebas Neue", "Montserrat", sans-serif`
  ctx.textBaseline = 'top'
  ctx.shadowColor = '#A970FF'
  ctx.shadowBlur = size * 0.09
  ctx.fillStyle = '#E3D2FF'
  ctx.fillText(letter, x + size * 0.17, y + size * 0.15)
  ctx.restore()
  ctx.restore()
}
