import { loadImage, storeBlob } from './images'

/**
 * Quita el fondo de un logo (fondo liso: blanco, negro o de color) sin IA: toma el color de los bordes y borra
 * todo lo de ese color (lo conectado con el borde y los huecos encerrados, como el de una R), con los bordes suavizados y sin halo. Para logos funciona mucho mejor
 * que el recorte con IA (que está pensado para personas y a veces se come partes del logo).
 * Si el logo ya tiene transparencia, no lo toca.
 */
export async function removeFlatBackground(src: string): Promise<string> {
  const img = await loadImage(src)
  const c = document.createElement('canvas')
  c.width = img.naturalWidth
  c.height = img.naturalHeight
  const ctx = c.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(img, 0, 0)
  const { width: W, height: H } = c
  const d = ctx.getImageData(0, 0, W, H)
  const px = d.data

  // ¿ya es transparente? (algún borde con alfa bajo)
  let clear = 0
  for (let x = 0; x < W; x += 4) if (px[x * 4 + 3] < 200) clear++
  if (clear > W / 16) return src

  // color de fondo: el más común en el borde
  const counts = new Map<string, { n: number; rgb: number[] }>()
  const sample = (x: number, y: number) => {
    const i = (y * W + x) * 4
    const rgb = [px[i] & 0xf8, px[i + 1] & 0xf8, px[i + 2] & 0xf8]
    const k = rgb.join(',')
    const e = counts.get(k) ?? { n: 0, rgb: [px[i], px[i + 1], px[i + 2]] }
    e.n++
    counts.set(k, e)
  }
  for (let x = 0; x < W; x += 2) (sample(x, 0), sample(x, H - 1))
  for (let y = 0; y < H; y += 2) (sample(0, y), sample(W - 1, y))
  const bg = [...counts.values()].sort((a, b) => b.n - a.n)[0].rgb
  const dist = (i: number) => Math.max(Math.abs(px[i] - bg[0]), Math.abs(px[i + 1] - bg[1]), Math.abs(px[i + 2] - bg[2]))

  // zonas del color del fondo: las conectadas con el borde y también las encerradas por el logo
  // (el hueco de una R, una O, una A…) si no son un puntito suelto
  const HARD = 28,
    SOFT = 70
  const minHole = Math.max(12, Math.round(W * H * 0.00004))
  const comp = new Int32Array(W * H).fill(-1)
  const isBg = new Uint8Array(W * H)
  const queue: number[] = []
  for (let start = 0; start < W * H; start++) {
    if (comp[start] >= 0 || dist(start * 4) > HARD) continue
    // una zona: todos los píxeles parecidos al fondo conectados entre sí
    const members: number[] = []
    let edge = false
    comp[start] = start
    queue.push(start)
    while (queue.length) {
      const p = queue.pop()!
      members.push(p)
      const x = p % W,
        y = (p / W) | 0
      if (x === 0 || y === 0 || x === W - 1 || y === H - 1) edge = true
      const next = [x > 0 ? p - 1 : -1, x < W - 1 ? p + 1 : -1, y > 0 ? p - W : -1, y < H - 1 ? p + W : -1]
      for (const q of next)
        if (q >= 0 && comp[q] < 0 && dist(q * 4) <= HARD) {
          comp[q] = start
          queue.push(q)
        }
    }
    if (edge || members.length >= minHole) for (const p of members) isBg[p] = 1
  }

  // fondo → transparente; el contorno del logo (entre HARD y SOFT) queda semitransparente
  // y se le saca el tinte del fondo, para que no quede un halo blanco
  const edgeAlpha = new Float32Array(W * H)
  for (let p = 0; p < W * H; p++) {
    if (isBg[p]) continue
    const x = p % W,
      y = (p / W) | 0
    const touches = (x > 0 && isBg[p - 1]) || (x < W - 1 && isBg[p + 1]) || (y > 0 && isBg[p - W]) || (y < H - 1 && isBg[p + W])
    const dd = dist(p * 4)
    if (touches && dd <= SOFT) edgeAlpha[p] = (dd - HARD) / (SOFT - HARD)
    else edgeAlpha[p] = 1
  }
  for (let p = 0; p < W * H; p++) {
    const i = p * 4
    if (isBg[p]) {
      px[i + 3] = 0
      continue
    }
    const a = edgeAlpha[p]
    if (a >= 1) continue
    for (let k = 0; k < 3; k++) px[i + k] = Math.max(0, Math.min(255, Math.round((px[i + k] - bg[k] * (1 - a)) / Math.max(a, 0.05))))
    px[i + 3] = Math.round(a * px[i + 3])
  }
  ctx.putImageData(d, 0, 0)
  const blob = await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'))
  return storeBlob(blob, 'logo')
}
