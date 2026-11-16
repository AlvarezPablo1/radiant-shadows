import Konva from 'konva'
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react'
import { Group, Image as KImage, Layer as KLayer, Line, Rect, RegularPolygon, Stage, Text, Transformer } from 'react-konva'
import { C } from '../brand'
import { useBackground } from '../lib/background'
import { processImage } from '../lib/filters'
import { fontFamily, fontWeight, useFontsVersion } from '../lib/fonts'
import { useImage } from '../lib/images'
import type { BgRecipe, ImageLayer, Layer, ShapeLayer, TextLayer } from '../types'

interface Props {
  width: number
  height: number
  scale: number
  bg: BgRecipe
  layers: Layer[]
  values: Record<string, string>
  imageFor: (l: ImageLayer) => string | undefined
  selection: string[]
  /** additive = Shift/⌘ presionado */
  onSelect: (id: string | null, additive?: boolean) => void
  onSelectMany?: (ids: string[]) => void
  onChange: (id: string, patch: Partial<Layer>) => void
  onChangeMany?: (patches: { id: string; patch: Partial<Layer> }[]) => void
  onTextEdit?: (l: TextLayer) => void
  safeZone?: boolean
  /** configuración de guías (el imantado funciona aunque no se muestren) */
  guides?: Guides | null
  showGuides?: boolean
  interactive?: boolean
}

interface DragCtx {
  /** posiciones iniciales de los otros seleccionados (mover en bloque) */
  others: { node: Konva.Node; x: number; y: number }[]
  x: number
  y: number
  setSnap: (s: { x?: number; y?: number } | null) => void
}

export interface Guides {
  /** margen como % del lado corto */
  margin: number
  rows: number
  cols: number
  center: boolean
  snap: boolean
}

/** líneas de guía (en coordenadas del diseño) */
export function guideLines(g: Guides, w: number, h: number) {
  const m = (Math.min(w, h) * g.margin) / 100
  const xs = [m, w - m]
  const ys = [m, h - m]
  if (g.center) {
    xs.push(w / 2)
    ys.push(h / 2)
  }
  for (let i = 1; i < g.cols; i++) xs.push(m + ((w - 2 * m) * i) / g.cols)
  for (let i = 1; i < g.rows; i++) ys.push(m + ((h - 2 * m) * i) / g.rows)
  return { xs, ys, m }
}

export const CanvasStage = forwardRef<Konva.Stage, Props>(function CanvasStage(p, ref) {
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
      onMouseUp={(e) => {
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
        const add = e.evt.shiftKey || e.evt.metaKey || e.evt.ctrlKey
        p.onSelectMany?.(add ? [...new Set([...p.selection, ...hits])] : hits)
      }}
      onTouchStart={(e) => {
        if (isBg(e)) p.onSelect(null)
      }}
    >
      <KLayer>
        <Rect name="bg" width={p.width} height={p.height} fill={C.black} />
        {bg && <KImage name="bg" image={bg} width={p.width} height={p.height} />}
        {p.layers.map((l) =>
          !l.visible ? null : l.type === 'text' ? (
            <TextNode key={l.id} l={l} value={l.bind ? (p.values[l.bind] ?? l.text) : l.text} {...p} interactive={interactive} fontsV={fontsV} drag={drag.current} />
          ) : l.type === 'image' ? (
            <ImageNode key={l.id} l={l} src={l.bind ? p.imageFor(l) : l.src} {...p} interactive={interactive} drag={drag.current} />
          ) : (
            <ShapeNode key={l.id} l={l} {...p} interactive={interactive} drag={drag.current} />
          ),
        )}
        {p.guides && p.showGuides && <GuidesOverlay g={p.guides} w={p.width} h={p.height} scale={p.scale} />}
        {snap && (
          <Group listening={false} name="overlay">
            {snap.x !== undefined && <Line points={[snap.x, 0, snap.x, p.height]} stroke="#FF4FD8" strokeWidth={1.5 / p.scale} dash={[6 / p.scale, 4 / p.scale]} />}
            {snap.y !== undefined && <Line points={[0, snap.y, p.width, snap.y]} stroke="#FF4FD8" strokeWidth={1.5 / p.scale} dash={[6 / p.scale, 4 / p.scale]} />}
          </Group>
        )}
        {band && (
          <Rect
            name="overlay"
            listening={false}
            x={Math.min(band.x0, band.x1)}
            y={Math.min(band.y0, band.y1)}
            width={Math.abs(band.x1 - band.x0)}
            height={Math.abs(band.y1 - band.y0)}
            fill="rgba(142,68,255,0.12)"
            stroke={C.violetLight}
            strokeWidth={1 / p.scale}
          />
        )}
        {p.safeZone && (
          <Group listening={false} name="overlay">
            <Rect width={p.width} height={210} fill="rgba(255,60,90,0.12)" />
            <Rect y={p.height - 250} width={p.width} height={250} fill="rgba(255,60,90,0.12)" />
            <Text text="Zona de la interfaz de IG (evitar texto)" x={20} y={90} fontSize={30} fill="rgba(255,200,210,0.8)" fontFamily="Sora" />
            <Text text="Zona de respuesta (evitar texto)" x={20} y={p.height - 140} fontSize={30} fill="rgba(255,200,210,0.8)" fontFamily="Sora" />
          </Group>
        )}
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

type NodeProps<L> = Props & { l: L; interactive: boolean; drag: DragCtx }

function common(l: Layer, p: Props & { interactive: boolean; drag: DragCtx }) {
  const select = (e: Konva.KonvaEventObject<MouseEvent | TouchEvent>) => {
    const ev = e.evt as MouseEvent
    const additive = !!(ev.shiftKey || ev.metaKey || ev.ctrlKey)
    // clic sobre un elemento ya seleccionado (en grupo) no rompe la selección
    if (!additive && p.selection.includes(l.id) && p.selection.length > 1) return
    p.onSelect(l.id, additive)
  }
  return {
    id: l.id,
    x: l.x,
    y: l.y,
    rotation: l.rotation,
    opacity: l.opacity,
    draggable: p.interactive && !l.locked,
    listening: p.interactive,
    onMouseDown: select,
    onTouchStart: select,
    onDragStart: (e: Konva.KonvaEventObject<DragEvent>) => {
      const n = e.target
      const st = n.getStage()!
      p.drag.x = n.x()
      p.drag.y = n.y()
      p.drag.others = p.selection.includes(l.id)
        ? (p.selection
            .filter((id) => id !== l.id && !p.layers.find((x) => x.id === id)?.locked)
            .map((id) => st.findOne('#' + id))
            .filter(Boolean)
            .map((node) => ({ node: node!, x: node!.x(), y: node!.y() })) as DragCtx['others'])
        : []
    },
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => {
      const n = e.target
      // imantado (siempre activo salvo que se desactive en Guías)
      let sx: number | undefined, sy: number | undefined
      if (p.guides?.snap !== false) {
        const g = p.guides ?? { margin: 7, rows: 0, cols: 0, center: true, snap: true }
        const r = n.getClientRect({ relativeTo: n.getLayer()! })
        const { xs, ys } = guideLines(g, p.width, p.height)
        const th = 8 / p.scale
        const best = (vals: number[], lines: number[]) => {
          let d = Infinity,
            at = 0
          for (const v of vals)
            for (const ln of lines)
              if (Math.abs(ln - v) < Math.abs(d)) {
                d = ln - v
                at = ln
              }
          return Math.abs(d) <= th ? { d, at } : null
        }
        const bx = best([r.x, r.x + r.width / 2, r.x + r.width], xs)
        const by = best([r.y, r.y + r.height / 2, r.y + r.height], ys)
        if (bx || by) n.position({ x: n.x() + (bx?.d ?? 0), y: n.y() + (by?.d ?? 0) })
        sx = bx?.at
        sy = by?.at
      }
      p.drag.setSnap(sx !== undefined || sy !== undefined ? { x: sx, y: sy } : null)
      // mover en bloque
      const dx = n.x() - p.drag.x,
        dy = n.y() - p.drag.y
      for (const o of p.drag.others) o.node.position({ x: o.x + dx, y: o.y + dy })
    },
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      p.drag.setSnap(null)
      const patches = [{ id: l.id, patch: { x: e.target.x(), y: e.target.y() } }, ...p.drag.others.map((o) => ({ id: o.node.id(), patch: { x: o.node.x(), y: o.node.y() } }))]
      p.drag.others = []
      if (patches.length > 1 && p.onChangeMany) p.onChangeMany(patches)
      else p.onChange(l.id, patches[0].patch)
    },
  }
}

function GuidesOverlay({ g, w, h, scale }: { g: Guides; w: number; h: number; scale: number }) {
  const { xs, ys, m } = guideLines(g, w, h)
  const sw = 1 / scale
  const center = (v: number, total: number) => g.center && Math.abs(v - total / 2) < 0.5
  return (
    <Group listening={false} name="overlay">
      <Rect x={m} y={m} width={w - 2 * m} height={h - 2 * m} stroke="#00E5FF" strokeWidth={sw * 1.5} dash={[8 * sw, 6 * sw]} />
      {xs.slice(2).map((x, i) => (
        <Line key={'x' + i} points={[x, 0, x, h]} stroke={center(x, w) ? '#FF4FD8' : '#00E5FF'} opacity={center(x, w) ? 0.9 : 0.45} strokeWidth={sw} />
      ))}
      {ys.slice(2).map((y, i) => (
        <Line key={'y' + i} points={[0, y, w, y]} stroke={center(y, h) ? '#FF4FD8' : '#00E5FF'} opacity={center(y, h) ? 0.9 : 0.45} strokeWidth={sw} />
      ))}
    </Group>
  )
}

const measureCtx = document.createElement('canvas').getContext('2d')!

function TextNode({ l, value, fontsV, ...p }: NodeProps<TextLayer> & { value: string; fontsV: number }) {
  const text = l.uppercase ? value.toUpperCase() : value
  const family = fontFamily(l.font)
  const weight = l.weight ?? fontWeight(l.font)
  const style = `${l.italic ? 'italic ' : ''}${weight}`
  const size = useMemo(() => {
    if (!l.autoFit) return l.fontSize
    measureCtx.font = `${style} ${l.fontSize}px ${family}`
    const widest = Math.max(1, ...text.split('\n').map((line) => measureCtx.measureText(line).width + line.length * l.letterSpacing))
    return widest > l.width ? Math.max(8, l.fontSize * (l.width / widest) * 0.98) : l.fontSize
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [l.autoFit, l.fontSize, l.width, l.letterSpacing, text, family, style, fontsV])
  const ref = useRef<Konva.Text>(null)
  const gref = useRef<Konva.Group>(null)
  const shadow = l.extrude
    ? { shadowColor: C.violet, shadowBlur: 0, shadowOffsetX: l.extrude, shadowOffsetY: l.extrude, shadowOpacity: 1, shadowEnabled: true }
    : { shadowColor: l.glowColor ?? C.violetLight, shadowBlur: l.glow * 40, shadowOpacity: l.glow ? Math.min(1, 0.4 + l.glow) : 0, shadowEnabled: l.glow > 0 }
  if (l.background) {
    // etiqueta con fondo (ej. badge "MVP")
    const pad = size * 0.35
    measureCtx.font = `${style} ${size}px ${family}`
    const tw = Math.min(l.width, measureCtx.measureText(text).width + text.length * l.letterSpacing)
    const bw = tw + pad * 2
    return (
      <Group
        ref={gref}
        {...common(l, p)}
        onTransformEnd={() => {
          const n = gref.current!
          const sy = n.scaleY()
          n.scaleX(1)
          n.scaleY(1)
          p.onChange(l.id, { x: n.x(), y: n.y(), rotation: n.rotation(), fontSize: Math.max(6, l.fontSize * sy), width: l.width * sy } as Partial<TextLayer>)
        }}
      >
        <Rect width={bw} height={size * l.lineHeight + pad * 0.9} fill={l.background} cornerRadius={2} />
        <Text text={text} x={pad} y={pad * 0.45} width={tw + 2} fontFamily={family} fontStyle={style} fontSize={size} fill={l.fill} letterSpacing={l.letterSpacing} lineHeight={l.lineHeight} listening={false} />
      </Group>
    )
  }
  // la caja de selección ocupa sólo lo que mide el texto (no todo el ancho de su caja), corrida según la alineación
  measureCtx.font = `${style} ${size}px ${family}`
  const lines = text.split('\n')
  const widest = Math.max(1, ...lines.map((line) => measureCtx.measureText(line).width + line.length * l.letterSpacing))
  const tight = widest <= l.width + 1
  // margen de medio carácter: Konva mide algún píxel más que el canvas y cortaría la última letra
  const w = tight ? Math.min(l.width, Math.ceil(widest + size * 0.5 + Math.abs(l.letterSpacing) * 2)) : l.width
  const dx = !tight ? 0 : l.align === 'center' ? (l.width - w) / 2 : l.align === 'right' ? l.width - w : 0
  return (
    <Text
      ref={ref}
      {...common(l, p)}
      offsetX={-dx}
      text={text}
      width={w}
      // si ya entra en su caja no se corta nunca (la medida de Konva puede diferir en algún píxel)
      wrap={tight ? 'none' : 'word'}
      fontFamily={family}
      fontStyle={style}
      fontSize={size}
      fill={l.fill}
      align={l.align}
      letterSpacing={l.letterSpacing}
      lineHeight={l.lineHeight}
      stroke={l.stroke}
      strokeWidth={l.strokeWidth ?? 0}
      fillAfterStrokeEnabled
      {...shadow}
      onDblClick={() => p.onTextEdit?.(l)}
      onDblTap={() => p.onTextEdit?.(l)}
      onTransformEnd={() => {
        const n = ref.current!
        const sx = n.scaleX(),
          sy = n.scaleY()
        n.scaleX(1)
        n.scaleY(1)
        const uniform = Math.abs(sx - sy) < 0.01
        p.onChange(l.id, {
          x: n.x(),
          y: n.y(),
          rotation: n.rotation(),
          // la caja se escala con lo que se agrandó o achicó el texto (la caja visible es la del texto)
          width: Math.max(20, l.width * sx),
          fontSize: uniform ? Math.max(6, l.fontSize * sy) : l.fontSize,
        } as Partial<TextLayer>)
      }}
    />
  )
}

function ImageNode({ l, src, ...p }: NodeProps<ImageLayer> & { src?: string }) {
  const img = useImage(src)
  const processed = useMemo(() => (img ? processImage(img, l.filter, l.fadeBottom, l.blur ?? 0) : undefined), [img, l.filter, l.fadeBottom, l.blur])
  const ref = useRef<Konva.Group>(null)
  if (!src) return null
  // ajuste "contain" anclado abajo-centro, o "cover" (rellenar caja) que recorta desde el centro de arriba
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

function ShapeNode({ l, ...p }: NodeProps<ShapeLayer>) {
  const ref = useRef<any>(null) // eslint-disable-line @typescript-eslint/no-explicit-any
  const glow = { shadowColor: l.glowColor ?? C.violetLight, shadowBlur: l.glow * 30, shadowEnabled: l.glow > 0, shadowOpacity: 0.9 }
  const props = {
    ...common(l, p),
    ...glow,
    ref,
    stroke: l.stroke,
    strokeWidth: l.strokeWidth,
    fill: l.fill,
    hitStrokeWidth: 24,
    onTransformEnd: () => {
      const n = ref.current!
      const sx = n.scaleX(),
        sy = n.scaleY()
      n.scaleX(1)
      n.scaleY(1)
      p.onChange(l.id, { x: n.x(), y: n.y(), rotation: n.rotation(), width: Math.max(4, l.width * sx), height: Math.max(0, l.height * sy) } as Partial<ShapeLayer>)
    },
  }
  const { width: w, height: h } = l
  switch (l.shape) {
    case 'rect':
      if (l.gradient)
        return (
          <Rect
            {...props}
            fill={undefined}
            width={w}
            height={h}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: h }}
            fillLinearGradientColorStops={[0, 'rgba(0,0,16,0)', 1, 'rgba(0,0,16,0.95)']}
          />
        )
      return <Rect {...props} width={w} height={h} cornerRadius={l.cornerRadius} />
    case 'line':
      return <Line {...props} points={[0, 0, w, 0]} lineCap="round" />
    case 'corner':
      return <Line {...props} fill={undefined} points={[0, h, w * 0.78, h, w * 0.78 + h, 0]} lineCap="round" lineJoin="round" />
    case 'hex':
      return <RegularPolygon {...props} sides={6} radius={w / 2} offsetX={-w / 2} offsetY={-w / 2} />
    case 'slash':
      return <Line {...props} closed points={[0, Math.min(h * 0.18, 90), w, 0, w, h, 0, h]} />
    case 'frame': {
      const a = Math.min(w, h) * 0.1
      return (
        <Group {...common(l, p)} ref={ref} onTransformEnd={props.onTransformEnd}>
          <Rect width={w} height={h} fill="rgba(0,0,0,0.001)" />
          {[
            [0, a, 0, 0, a, 0],
            [w - a, 0, w, 0, w, a],
            [0, h - a, 0, h, a, h],
            [w - a, h, w, h, w, h - a],
          ].map((pts, i) => (
            <Line key={i} points={pts} stroke={l.stroke} strokeWidth={l.strokeWidth} lineCap="square" listening={false} {...glow} />
          ))}
        </Group>
      )
    }
  }
}
