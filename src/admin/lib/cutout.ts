import { useEffect, useState } from 'react'

/*
 * Quitar el fondo de una foto, en el navegador (sin servidor): misma herramienta y modelo que usa el mediakit.
 * El modelo pesa unos MB: se descarga en segundo plano al entrar al admin y queda en la caché del navegador.
 */

export type CutoutStatus = 'idle' | 'loading' | 'ready' | 'error'

let status: CutoutStatus = 'idle'
let listeners: ((s: CutoutStatus) => void)[] = []
const setStatus = (s: CutoutStatus) => {
  status = s
  listeners.forEach((l) => l(s))
}

/** Estado de la herramienta (para mostrar "preparando…") */
export function useCutoutStatus() {
  const [s, setS] = useState(status)
  useEffect(() => {
    listeners.push(setS)
    return () => {
      listeners = listeners.filter((l) => l !== setS)
    }
  }, [])
  return s
}

const config = () => ({
  model: 'isnet_fp16' as const,
  device: ('gpu' in navigator ? 'gpu' : 'cpu') as 'gpu' | 'cpu',
  output: { format: 'image/png' as const },
})

let preloading: Promise<void> | null = null

/** Descarga el modelo en segundo plano (se llama al entrar al admin) */
export function preloadCutout() {
  if (!preloading) {
    setStatus('loading')
    preloading = import('@imgly/background-removal')
      .then(({ preload }) => preload(config()))
      .then(() => setStatus('ready'))
      .catch((e) => {
        console.warn('No se pudo preparar la herramienta para quitar fondos', e)
        setStatus('error')
        preloading = null
      })
  }
  return preloading
}

/** Achica la foto (no hace falta más de 1600 px) para que el recorte sea rápido */
async function shrink(blob: Blob, max = 1600): Promise<Blob> {
  const img = await createImageBitmap(blob)
  const scale = Math.min(1, max / Math.max(img.width, img.height))
  if (scale === 1) return blob
  const c = new OffscreenCanvas(Math.round(img.width * scale), Math.round(img.height * scale))
  c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
  return c.convertToBlob({ type: 'image/png' })
}

/** Recorta los bordes transparentes que quedan alrededor de la persona */
async function trim(blob: Blob): Promise<Blob> {
  const img = await createImageBitmap(blob)
  const c = new OffscreenCanvas(img.width, img.height)
  const ctx = c.getContext('2d')!
  ctx.drawImage(img, 0, 0)
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height)
  let [x0, y0, x1, y1] = [width, height, -1, -1]
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 10) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  if (x1 < 0) return blob
  const out = new OffscreenCanvas(x1 - x0 + 1, y1 - y0 + 1)
  out.getContext('2d')!.drawImage(c, -x0, -y0)
  return out.convertToBlob({ type: 'image/png' })
}

/** Devuelve la foto sin fondo, como PNG transparente recortado a la persona */
export async function removeBackground(source: Blob, name: string, onProgress?: (text: string) => void): Promise<File> {
  const { removeBackground: rb } = await import('@imgly/background-removal')
  if (status === 'loading') {
    onProgress?.('Terminando de preparar la herramienta…')
    await preloading
  }
  onProgress?.('Quitando el fondo…')
  const out = await rb(await shrink(source), {
    ...config(),
    progress: (key: string, cur: number, total: number) =>
      onProgress?.(key.startsWith('fetch') ? `Descargando la herramienta… ${total ? Math.round((cur / total) * 100) : 0}%` : 'Quitando el fondo…'),
  })
  setStatus('ready')
  const base = name.replace(/\.[a-z0-9]+$/i, '')
  return new File([await trim(out)], `${base}-sin-fondo.png`, { type: 'image/png' })
}
