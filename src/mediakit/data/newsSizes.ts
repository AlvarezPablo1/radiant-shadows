import { FORMATS, type Layer } from '../types'

/** tamaños de las imágenes de las noticias de la web (se descargan a partir del diseño de X) */
export type NewsSize = 'newsCard' | 'newsMain'

export const NEWS_SIZES: Record<NewsSize, { label: string; file: string; w: number; h: number }> = {
  newsCard: { label: 'Noticia · tarjeta', file: 'Noticia-tarjeta', w: 1600, h: 800 },
  newsMain: { label: 'Noticia principal', file: 'Noticia-principal', w: 1800, h: 600 },
}
export const NEWS_SIZE_IDS = Object.keys(NEWS_SIZES) as NewsSize[]

/** el diseño de X entero y centrado dentro de otro tamaño (el fondo se dibuja aparte, al tamaño completo) */
export function fitX(w: number, h: number) {
  const { w: xw, h: xh } = FORMATS.x
  const scale = Math.min(w / xw, h / xh)
  return { scale, x: (w - xw * scale) / 2, y: (h - xh * scale) / 2 }
}

/**
 * Lo que en X va de borde a borde (el fundido, una franja) se estira hasta los bordes del tamaño nuevo,
 * así no se le notan los cortes a los costados (o arriba y abajo).
 */
export function bleed(layers: Layer[], w: number, h: number): Layer[] {
  const { w: xw, h: xh } = FORMATS.x
  const f = fitX(w, h)
  return layers.map((l) => {
    // sólo formas (el fundido, franjas) e imágenes que rellenan su caja (el agente de fondo): las fotos no se deforman
    if (!(l.type === 'shape' || (l.type === 'image' && l.fit === 'cover'))) return l
    const out = { ...l } as Layer & { width: number; height: number }
    if (l.x <= 1 && l.x + l.width >= xw - 1) {
      out.x = -f.x / f.scale
      out.width = w / f.scale
    }
    if (l.y <= 1 && l.y + l.height >= xh - 1) {
      out.y = -f.y / f.scale
      out.height = h / f.scale
    }
    return out
  })
}
