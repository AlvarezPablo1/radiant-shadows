import Konva from 'konva'
import { useMemo, useRef } from 'react'
import { Group, Image as KImage, Rect } from 'react-konva'
import { C } from '../../brand'
import { processImage } from '../../lib/filters'
import { useImage } from '../../lib/images'
import type { ImageLayer } from '../../types'
import { common, type NodeProps } from './common'

/** imagen: "contain" anclada abajo-centro, o "cover" (rellenar caja) que recorta desde el centro de arriba */
export function ImageNode({ l, src, ...p }: NodeProps<ImageLayer> & { src?: string }) {
  const img = useImage(src)
  const processed = useMemo(() => (img ? processImage(img, l.filter, l.fadeBottom, l.blur ?? 0) : undefined), [img, l.filter, l.fadeBottom, l.blur])
  const ref = useRef<Konva.Group>(null)
  if (!src) return null
  let iw = l.width,
    ih = l.height,
    ix = 0,
    iy = 0
  let crop: { x: number; y: number; width: number; height: number } | undefined
  if (img) {
    const nw = img.naturalWidth,
      nh = img.naturalHeight
    if (l.fit === 'contain') {
      const k = Math.min(l.width / nw, l.height / nh)
      iw = nw * k
      ih = nh * k
      ix = (l.width - iw) / 2
      iy = l.height - ih
    } else {
      const k = Math.max(l.width / nw, l.height / nh)
      const cw = l.width / k,
        ch = l.height / k
      const pw = processed instanceof HTMLCanvasElement ? processed.width / nw : 1
      crop = { x: ((nw - cw) / 2) * pw, y: (nh - ch) * (l.cropY ?? 0) * pw, width: cw * pw, height: ch * pw }
    }
  }
  return (
    <Group
      ref={ref}
      {...common(l, p)}
      onTransformEnd={() => {
        const n = ref.current!
        const sx = n.scaleX(),
          sy = n.scaleY()
        n.scaleX(1)
        n.scaleY(1)
        p.onChange(l.id, { x: n.x(), y: n.y(), rotation: n.rotation(), width: Math.max(10, l.width * sx), height: Math.max(10, l.height * sy) } as Partial<ImageLayer>)
      }}
    >
      {/* área de selección = la imagen dibujada (así se puede agarrar cada jugador aunque las cajas se superpongan) */}
      <Rect x={ix} y={iy} width={iw} height={ih} fill="rgba(0,0,0,0.001)" />
      {processed && (
        <KImage
          image={processed}
          x={l.flipX ? ix + iw : ix}
          y={iy}
          width={iw}
          height={ih}
          scaleX={l.flipX ? -1 : 1}
          crop={crop}
          shadowColor={l.glowColor ?? C.violet}
          shadowBlur={l.glow * 70}
          shadowOpacity={Math.min(1, l.glow * 1.6)}
          shadowEnabled={l.glow > 0}
          perfectDrawEnabled={false}
        />
      )}
    </Group>
  )
}
