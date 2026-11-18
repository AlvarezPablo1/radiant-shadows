import Konva from 'konva'
import { forwardRef, useEffect, useRef, useState } from 'react'
import { Group, Image as KImage, Layer as KLayer, Rect, Stage, Transformer } from 'react-konva'
import { C } from '../brand'
import { useBackground } from '../lib/background'
import { useFontsVersion } from '../lib/fonts'
import type { DragCtx, StageProps } from './canvas/common'
import { ImageNode } from './canvas/ImageNode'
import { BandOverlay, GuidesOverlay, SafeZoneOverlay, SnapOverlay } from './canvas/Overlays'
import { ShapeNode } from './canvas/ShapeNode'
import { TextNode } from './canvas/TextNode'

export type { Guides } from './canvas/guides'

/** el lienzo de la placa: fondo, elementos, selección (clic, Shift o recuadro), guías e imantado */
export const CanvasStage = forwardRef<Konva.Stage, StageProps>(function CanvasStage(p, ref) {
  const fontsV = useFontsVersion()
  const bg = useBackground(p.bg, p.width, p.height)
  const tr = useRef<Konva.Transformer>(null)
  const stageRef = useRef<Konva.Stage | null>(null)
  const [snap, setSnap] = useState<{ x?: number; y?: number } | null>(null)
  const [band, setBand] = useState<{ x0: number; y0: number; x1: number; y1: number } | null>(null)
  const drag = useRef<DragCtx>({ others: [], x: 0, y: 0, setSnap })

  useEffect(() => {
    const t = tr.current
    const st = stageRef.current
    if (!t || !st) return
    const nodes = p.selection
      .filter((id) => !p.layers.find((l) => l.id === id)?.locked)
      .map((id) => st.findOne('#' + id))
      .filter(Boolean) as Konva.Node[]
    t.nodes(nodes)
    t.getLayer()?.batchDraw()
  }, [p.selection, p.layers, fontsV])

  const interactive = p.interactive !== false
  const toDesign = () => {
    const pos = stageRef.current!.getPointerPosition()!
    return { x: pos.x / p.scale, y: pos.y / p.scale }
  }
  const isBg = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => e.target === e.target.getStage() || e.target.name() === 'bg'
  // recuadro de selección: elige los elementos que toca
  const finishBand = (add: boolean) => {
    if (!band) return
    const x = Math.min(band.x0, band.x1),
      y = Math.min(band.y0, band.y1),
      w = Math.abs(band.x1 - band.x0),
      h = Math.abs(band.y1 - band.y0)
    setBand(null)
    if (w < 6 && h < 6) return
    const st = stageRef.current!
    const layer = st.getLayers()[0]
    const hits = p.layers
      .filter((l) => l.visible && !l.locked)
      .filter((l) => {
        const n = st.findOne('#' + l.id)
        if (!n) return false
        const r = n.getClientRect({ relativeTo: layer })
        return r.x < x + w && r.x + r.width > x && r.y < y + h && r.y + r.height > y
      })
      .map((l) => l.id)
    p.onSelectMany?.(add ? [...new Set([...p.selection, ...hits])] : hits)
  }
  const node = { ...p, interactive, drag }

  return (
    <Stage
      ref={(s) => {
        stageRef.current = s
        if (typeof ref === 'function') ref(s)
        else if (ref) ref.current = s
      }}
      width={p.width * p.scale}
      height={p.height * p.scale}
      scaleX={p.scale}
      scaleY={p.scale}
      onMouseDown={(e) => {
        if (!interactive || !isBg(e)) return
        if (!e.evt.shiftKey && !e.evt.metaKey && !e.evt.ctrlKey) p.onSelect(null)
        const d = toDesign()
        setBand({ x0: d.x, y0: d.y, x1: d.x, y1: d.y })
      }}
      onMouseMove={() => {
        if (!band) return
        const d = toDesign()
        setBand({ ...band, x1: d.x, y1: d.y })
      }}
      onMouseUp={(e) => finishBand(e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey)}
      onTouchStart={(e) => {
        if (isBg(e)) p.onSelect(null)
      }}
    >
      <KLayer>
        <Rect name="bg" width={p.width} height={p.height} fill={C.black} />
        {bg && <KImage name="bg" image={bg} width={p.width} height={p.height} />}
        <Group x={p.content?.x ?? 0} y={p.content?.y ?? 0} scaleX={p.content?.scale ?? 1} scaleY={p.content?.scale ?? 1}>
          {p.layers.map((l) =>
            !l.visible ? null : l.type === 'text' ? (
              <TextNode key={l.id} l={l} value={l.bind ? (p.values[l.bind] ?? l.text) : l.text} {...node} fontsV={fontsV} />
            ) : l.type === 'image' ? (
              <ImageNode key={l.id} l={l} src={l.bind ? p.imageFor(l) : l.src} {...node} />
            ) : (
              <ShapeNode key={l.id} l={l} {...node} />
            ),
          )}
        </Group>
        {p.guides && p.showGuides && <GuidesOverlay g={p.guides} w={p.width} h={p.height} scale={p.scale} />}
        {snap && <SnapOverlay snap={snap} w={p.width} h={p.height} scale={p.scale} />}
        {band && <BandOverlay band={band} scale={p.scale} />}
        {p.safeZone && <SafeZoneOverlay w={p.width} h={p.height} />}
        {interactive && (
          <Transformer
            ref={tr}
            name="overlay"
            rotateEnabled
            rotationSnaps={[0, 90, 180, 270]}
            anchorSize={10}
            anchorStroke={C.violet}
            anchorFill="#fff"
            borderStroke={C.violetLight}
            borderDash={[6, 4]}
            keepRatio
            boundBoxFunc={(o, n) => (n.width < 10 || n.height < 10 ? o : n)}
          />
        )}
      </KLayer>
    </Stage>
  )
})
