import type { FilterId } from '../types'

export const FILTERS: { id: FilterId; label: string }[] = [
  { id: 'none', label: 'Sin filtro' },
  { id: 'oscuro', label: 'Tratamiento oscuro' },
  { id: 'sombra', label: 'Sombra violeta' },
  { id: 'violeta', label: 'Duotono Radiant' },
  { id: 'noche', label: 'Noche' },
  { id: 'neon', label: 'Neón' },
  { id: 'mate', label: 'Humo mate' },
  { id: 'fuego', label: 'Fuego violeta' },
  { id: 'calido', label: 'Brasa' },
]

const hex = (h: string) => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
const clamp = (v: number) => (v < 0 ? 0 : v > 255 ? 255 : v)

function gradientMap(stops: [number, string][]) {
  const s = stops.map(([p, c]) => [p, ...hex(c)] as [number, number, number, number])
  const lut = new Uint8ClampedArray(256 * 3)
  for (let i = 0; i < 256; i++) {
    const t = i / 255
    let k = 0
    while (k < s.length - 2 && t > s[k + 1][0]) k++
    const [p0, r0, g0, b0] = s[k]
    const [p1, r1, g1, b1] = s[k + 1]
    const u = Math.min(1, Math.max(0, (t - p0) / (p1 - p0 || 1)))
    lut[i * 3] = lerp(r0, r1, u)
    lut[i * 3 + 1] = lerp(g0, g1, u)
    lut[i * 3 + 2] = lerp(b0, b1, u)
  }
  return lut
}
const LUT_VIOLETA = gradientMap([
  [0, '#000010'],
  [0.45, '#4C1D95'],
  [0.75, '#8E44FF'],
  [1, '#F2EAFF'],
])
/** tritono: sombras negro profundo, medios violeta, luces ámbar */
const LUT_FUEGO = gradientMap([
  [0, '#000010'],
  [0.35, '#3A1270'],
  [0.62, '#7415C1'],
  [0.85, '#E58A6A'],
  [1, '#FFE3B0'],
])
const LUT_CALIDO = gradientMap([
  [0, '#000010'],
  [0.4, '#2E2636'],
  [0.7, '#B0603A'],
  [1, '#FFE2B8'],
])

export function applyFilter(data: Uint8ClampedArray, f: FilterId) {
  if (f === 'none') return
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2]
    const l = 0.299 * r + 0.587 * g + 0.114 * b
    if (f === 'oscuro') {
      // fotografía con tratamiento oscuro: baja exposición, más contraste, leve desaturación fría
      const k = 0.82
      const c = (v: number) => clamp(((v * 0.8 + l * 0.2) * k - 128) * 1.15 + 118)
      data[i] = c(r)
      data[i + 1] = c(g)
      data[i + 2] = clamp(c(b) + 6)
    } else if (f === 'sombra') {
      // sombras teñidas de violeta, luces intactas
      const t = 1 - l / 255
      data[i] = clamp(r * 0.88 + 40 * t * 0.6)
      data[i + 1] = clamp(g * 0.8)
      data[i + 2] = clamp(b * 0.92 + 120 * t * 0.5)
    } else if (f === 'noche') {
      // nocturno: negros hundidos, tinte azul-violeta frío, poca saturación
      const sat = 0.55
      const c = (v: number) => clamp((l + (v - l) * sat - 20) * 0.95)
      data[i] = clamp(c(r) * 0.92)
      data[i + 1] = clamp(c(g) * 0.9)
      data[i + 2] = clamp(c(b) * 1.08 + 18)
    } else if (f === 'neon') {
      // split-tone de alto contraste: sombras violeta, luces lila
      const t = l / 255
      const k = clamp((l - 128) * 1.3 + 128) / 255
      const sh = [60, 10, 130],
        hi = [235, 205, 255]
      const mix = (a: number, b: number) => a + (b - a) * k
      data[i] = clamp(lerp(r, mix(sh[0], hi[0]), 0.7) * (0.7 + t * 0.5))
      data[i + 1] = clamp(lerp(g, mix(sh[1], hi[1]), 0.7) * (0.7 + t * 0.5))
      data[i + 2] = clamp(lerp(b, mix(sh[2], hi[2]), 0.7) * (0.7 + t * 0.5))
    } else if (f === 'mate') {
      // mate / humo: negros levantados hacia el púrpura sombra, contraste suave
      const c = (v: number, lift: number) => clamp(lift + v * 0.78)
      data[i] = c(r * 0.9 + l * 0.1, 30)
      data[i + 1] = c(g * 0.9 + l * 0.1, 22)
      data[i + 2] = c(b * 0.9 + l * 0.1, 40)
    } else {
      const lut = f === 'violeta' ? LUT_VIOLETA : f === 'fuego' ? LUT_FUEGO : LUT_CALIDO
      const li = Math.round(l) * 3
      const mix = 0.88
      data[i] = lerp(r, lut[li], mix)
      data[i + 1] = lerp(g, lut[li + 1], mix)
      data[i + 2] = lerp(b, lut[li + 2], mix)
    }
  }
}

/** Devuelve un canvas con la imagen filtrada y (opcional) fundido inferior a transparente. */
/**
 * `blur` (0 a 1): difuminado. Se hace achicando y volviendo a agrandar la imagen (funciona igual en todos los
 * navegadores, también en Safari, que no aplica filtros de desenfoque sobre canvas).
 */
export function processImage(img: HTMLImageElement, f: FilterId, fadeBottom: number, blur = 0, maxSide = 1800): HTMLCanvasElement | HTMLImageElement {
  if (f === 'none' && !fadeBottom && !blur) return img
  const k = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight))
  const c = document.createElement('canvas')
  c.width = Math.round(img.naturalWidth * k)
  c.height = Math.round(img.naturalHeight * k)
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  if (blur > 0) {
    let src: CanvasImageSource = img
    let w = c.width,
      h = c.height
    // varios pasos chicos: el difuminado queda parejo, sin pixelado
    for (const step of [0.5, 0.5, 0.5].slice(0, 1 + Math.round(blur * 2))) {
      w = Math.max(8, Math.round(w * step))
      h = Math.max(8, Math.round(h * step))
      const t = document.createElement('canvas')
      t.width = w
      t.height = h
      const tc = t.getContext('2d')!
      tc.imageSmoothingQuality = 'high'
      tc.drawImage(src, 0, 0, w, h)
      src = t
    }
    // y se vuelve a agrandar también de a pasos, así queda suave (sin escalones)
    while (w * 2 < c.width) {
      w *= 2
      h *= 2
      const t = document.createElement('canvas')
      t.width = w
      t.height = h
      const tc = t.getContext('2d')!
      tc.imageSmoothingQuality = 'high'
      tc.drawImage(src, 0, 0, w, h)
      src = t
    }
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(src, 0, 0, c.width, c.height)
  } else ctx.drawImage(img, 0, 0, c.width, c.height)
  if (f !== 'none') {
    const d = ctx.getImageData(0, 0, c.width, c.height)
    applyFilter(d.data, f)
    ctx.putImageData(d, 0, 0)
  }
  if (fadeBottom > 0) {
    ctx.globalCompositeOperation = 'destination-out'
    const h = c.height * Math.min(0.9, fadeBottom)
    const g = ctx.createLinearGradient(0, c.height - h, 0, c.height)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,1)')
    ctx.fillStyle = g
    ctx.fillRect(0, c.height - h, c.width, h)
    ctx.globalCompositeOperation = 'source-over'
  }
  return c
}
