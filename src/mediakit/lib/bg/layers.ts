import { LOGOS } from '../../brand'
import { applyFilter } from '../filters'
import { loadImage } from '../images'
import { lerp, radial, type Draw } from './tools'

/** imagen de fondo propia (foto, captura…), oscurecida */
export async function photo({ ctx, r, w, h }: Draw) {
  if (!r.image) return
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

/** HUMO: manchas difusas grandes */
export function smoke({ ctx, r, w, h, S, T, rand }: Draw) {
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

/** SOMBRAS: masas oscuras y viñeta */
export function shadows({ ctx, r, w, h, S, rand }: Draw) {
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

/** SILUETA del dragón / isotipo grande, tenue y teñida de violeta */
export async function silhouette({ ctx, r, w, h, S, rand }: Draw) {
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

/** FUEGO abstracto: curvas suaves con brillo */
export function fire({ ctx, r, w, h, S, rand }: Draw) {
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

/** PARTÍCULAS: brasas cortas violetas y algunas doradas */
export function particles({ ctx, r, w, h, S, rand }: Draw) {
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

/** BRILLOS: destellos violetas de 4 puntas */
export function sparkles({ ctx, r, w, h, S, rand }: Draw) {
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
