import Konva from 'konva'
import { useEffect, useRef } from 'react'
import type { BgRecipe, FormatId, ImageLayer, Layer } from '../../types'
import { FORMATS } from '../../types'
import { fitX, NEWS_SIZES, type NewsSize } from '../../data/newsSizes'
import { CanvasStage } from '../CanvasStage'

interface Props {
  fmt: FormatId
  layers: Layer[]
  mime: string
  bg: BgRecipe
  values: Record<string, string>
  imageFor: (l: ImageLayer) => string | undefined
  onDone: (url: string) => void
  /** tamaño de noticia de la web: el diseño de X entero y centrado, con el fondo al tamaño completo */
  size?: NewsSize
}

/** lienzo oculto a tamaño real: cuando termina de pintar devuelve la imagen (sin guías ni selección); también arma los tamaños de noticia */
export function ExportStage(p: Props) {
  const ref = useRef<Konva.Stage>(null)
  const { w, h } = p.size ? NEWS_SIZES[p.size] : FORMATS[p.fmt]
  useEffect(() => {
    // los assets ya están cargados y en caché: esperamos a que React/Konva pinten
    const id = setTimeout(() => {
      const st = ref.current!
      st.find('.overlay').forEach((n) => n.hide())
      p.onDone(st.toDataURL({ pixelRatio: 1, mimeType: p.mime, quality: 0.95 }))
    }, 450)
    return () => clearTimeout(id)
    // se monta una vez por exportación
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <CanvasStage ref={ref} width={w} height={h} scale={1} bg={p.bg} layers={p.layers} values={p.values} imageFor={p.imageFor} selection={[]} onSelect={() => {}} onChange={() => {}} interactive={false} content={p.size ? fitX(w, h) : undefined} />
}
