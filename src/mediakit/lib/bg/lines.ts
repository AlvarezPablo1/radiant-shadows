import type { Draw } from './tools'

/** LÍNEAS: cortes angulares en esquinas opuestas */
export function cornerLines({ ctx, w, h, S }: Draw) {
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

/** NEÓN: dos líneas diagonales luminosas que cruzan la pieza */
export function neonLines({ ctx, r, w, h, S, rand }: Draw) {
  const k = r.neon ?? 0
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

/** ESQUINAS tipo visor */
export function viewfinder({ ctx, w, h, S }: Draw) {
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
