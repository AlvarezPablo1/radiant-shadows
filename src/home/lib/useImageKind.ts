import { useEffect, useState } from 'react'

/** 'cutout': recorte sin fondo (bordes transparentes) · 'photo': imagen con fondo */
export type ImageKind = 'cutout' | 'photo'

const cache = new Map<string, Promise<ImageKind>>()

/** mira los bordes de la imagen en chico: si alguno es transparente, es un recorte */
function detect(src: string): Promise<ImageKind> {
  return new Promise((resolve) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      try {
        const n = 24
        const c = document.createElement('canvas')
        c.width = c.height = n
        const ctx = c.getContext('2d', { willReadFrequently: true })!
        ctx.drawImage(img, 0, 0, n, n)
        const d = ctx.getImageData(0, 0, n, n).data
        const alpha = (x: number, y: number) => d[(y * n + x) * 4 + 3]
        let clear = 0
        for (let i = 0; i < n; i++) for (const [x, y] of [[i, 0], [i, n - 1], [0, i], [n - 1, i]]) if (alpha(x, y) < 200) clear++
        resolve(clear > n / 2 ? 'cutout' : 'photo')
      } catch {
        resolve('cutout') // sin permiso para leerla: se muestra como hasta ahora
      }
    }
    img.onerror = () => resolve('cutout')
    img.src = src
  })
}

/** si la imagen es un recorte o tiene fondo (undefined mientras se averigua) */
export function useImageKind(src?: string): ImageKind | undefined {
  const [found, setFound] = useState<{ src: string; kind: ImageKind }>()
  useEffect(() => {
    if (!src) return
    let alive = true
    let p = cache.get(src)
    if (!p) {
      p = detect(src)
      cache.set(src, p)
    }
    p.then((kind) => alive && setFound({ src, kind }))
    return () => {
      alive = false
    }
  }, [src])
  return src && found?.src === src ? found.kind : undefined
}
