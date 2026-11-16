import { useEffect, useState } from 'react'
import { idbGet, idbPut } from './idb'

/** src puede ser una URL pública (/brand/...), dataURL o "idb:<clave>" (imagen subida). */
const urlCache = new Map<string, Promise<string>>()
const imgCache = new Map<string, Promise<HTMLImageElement>>()

export function resolveSrc(src: string): Promise<string> {
  if (!src.startsWith('idb:')) return Promise.resolve(src)
  let p = urlCache.get(src)
  if (!p) {
    p = idbGet<Blob>(src.slice(4)).then((b) => (b ? URL.createObjectURL(b) : ''))
    urlCache.set(src, p)
  }
  return p
}

export function loadImage(src: string): Promise<HTMLImageElement> {
  let p = imgCache.get(src)
  if (!p) {
    p = resolveSrc(src).then(
      (url) =>
        new Promise<HTMLImageElement>((res, rej) => {
          const im = new Image()
          im.crossOrigin = 'anonymous'
          im.onload = () => res(im)
          im.onerror = () => rej(new Error('No se pudo cargar ' + src))
          im.src = url
        }),
    )
    p.catch(() => imgCache.delete(src))
    imgCache.set(src, p)
  }
  return p
}

export function useImage(src?: string): HTMLImageElement | undefined {
  // se guarda junto con su src: si cambia la imagen, la anterior deja de mostrarse sin esperar a un efecto
  const [loaded, setLoaded] = useState<{ src: string; img?: HTMLImageElement }>()
  useEffect(() => {
    if (!src) return
    let alive = true
    loadImage(src)
      .then((img) => alive && setLoaded({ src, img }))
      .catch(() => alive && setLoaded({ src }))
    return () => {
      alive = false
    }
  }, [src])
  return src && loaded?.src === src ? loaded.img : undefined
}

const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36)

/** Guarda un Blob en IndexedDB y devuelve su referencia "idb:..." */
export async function storeBlob(blob: Blob, prefix = 'img'): Promise<string> {
  const key = `${prefix}-${uid()}`
  await idbPut(key, blob)
  return 'idb:' + key
}

/** Reduce imágenes enormes (fotos de cámara) para que el editor siga fluido. */
export async function normalizeImage(file: Blob, max = 2200): Promise<Blob> {
  const url = URL.createObjectURL(file)
  try {
    const im = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image()
      i.onload = () => res(i)
      i.onerror = rej
      i.src = url
    })
    const k = Math.min(1, max / Math.max(im.naturalWidth, im.naturalHeight))
    if (k === 1 && file.type === 'image/png') return file
    const c = document.createElement('canvas')
    c.width = Math.round(im.naturalWidth * k)
    c.height = Math.round(im.naturalHeight * k)
    c.getContext('2d')!.drawImage(im, 0, 0, c.width, c.height)
    return await new Promise<Blob>((res) => c.toBlob((b) => res(b!), 'image/png'))
  } finally {
    URL.revokeObjectURL(url)
  }
}

/* ---------- recorte de fondo (IA en el navegador) ---------- */

type ModelStatus = 'idle' | 'loading' | 'ready' | 'error'
let modelStatus: ModelStatus = 'idle'
let modelListeners: ((s: ModelStatus) => void)[] = []
const setModelStatus = (st: ModelStatus) => {
  modelStatus = st
  modelListeners.forEach((l) => l(st))
}
export function useCutoutModelStatus() {
  const [st, setSt] = useState(modelStatus)
  useEffect(() => {
    modelListeners.push(setSt)
    return () => {
      modelListeners = modelListeners.filter((l) => l !== setSt)
    }
  }, [])
  return st
}

const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator
function cutoutConfig() {
  return {
    model: 'isnet_fp16' as const,
    device: (hasWebGPU ? 'gpu' : 'cpu') as 'gpu' | 'cpu',
    output: { format: 'image/png' as const },
  }
}

let preloading: Promise<void> | null = null
/** Descarga el modelo en segundo plano (queda en la caché del navegador). */
export function preloadCutoutModel(): Promise<void> {
  if (!preloading) {
    setModelStatus('loading')
    preloading = import('@imgly/background-removal')
      .then(({ preload }) => preload(cutoutConfig()))
      .then(() => setModelStatus('ready'))
      .catch((e) => {
        console.warn('No se pudo precargar el modelo de recorte', e)
        setModelStatus('error')
        preloading = null
      })
  }
  return preloading
}

/** Convierte una foto en PNG sin fondo. Si el modelo ya se precargó, sólo procesa. */
export async function removeBackground(src: string, onProgress?: (p: number, label: string) => void): Promise<string> {
  const { removeBackground: rb } = await import('@imgly/background-removal')
  if (modelStatus === 'loading') {
    onProgress?.(0, 'Terminando de preparar el recorte…')
    await preloading
  }
  const url = await resolveSrc(src)
  // la foto nunca se usa a resolución completa en una placa: se achica antes de recortar
  const blob = await normalizeImage(await (await fetch(url)).blob(), 1600)
  const out = await rb(blob, {
    ...cutoutConfig(),
    progress: (key: string, cur: number, total: number) => {
      onProgress?.(total ? cur / total : 0, key.startsWith('fetch') ? 'Descargando modelo de recorte…' : 'Recortando…')
    },
  })
  setModelStatus('ready')
  return storeBlob(await trimTransparent(out), 'cut')
}

/** Recorta los bordes transparentes de un PNG. */
async function trimTransparent(blob: Blob): Promise<Blob> {
  const bmp = await createImageBitmap(blob)
  const c = document.createElement('canvas')
  c.width = bmp.width
  c.height = bmp.height
  const ctx = c.getContext('2d')!
  ctx.drawImage(bmp, 0, 0)
  const d = ctx.getImageData(0, 0, c.width, c.height).data
  let x0 = c.width,
    y0 = c.height,
    x1 = 0,
    y1 = 0
  for (let y = 0; y < c.height; y++)
    for (let x = 0; x < c.width; x++)
      if (d[(y * c.width + x) * 4 + 3] > 12) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
  if (x1 <= x0 || y1 <= y0) return blob
  const o = document.createElement('canvas')
  o.width = x1 - x0 + 1
  o.height = y1 - y0 + 1
  o.getContext('2d')!.drawImage(c, -x0, -y0)
  return new Promise((res) => o.toBlob((b) => res(b!), 'image/png'))
}

export function pickFile(accept = 'image/*'): Promise<File | undefined> {
  return new Promise((res) => {
    const i = document.createElement('input')
    i.type = 'file'
    i.accept = accept
    i.onchange = () => res(i.files?.[0])
    i.click()
  })
}
