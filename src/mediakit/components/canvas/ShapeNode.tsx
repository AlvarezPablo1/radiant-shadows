import Konva from 'konva'
import { useRef } from 'react'
import { Group, Line, Rect, RegularPolygon } from 'react-konva'
import { C } from '../../brand'
import type { ShapeLayer } from '../../types'
import { common, type NodeProps } from './common'

/** formas: rectángulo (o fundido), línea, esquina, hexágono, corte diagonal y marco de esquinas */
export function ShapeNode({ l, ...p }: NodeProps<ShapeLayer>) {
  const ref = useRef<Konva.Node | null>(null)
  const setRef = (n: Konva.Node | null) => {
    ref.current = n
  }
  const glow = { shadowColor: l.glowColor ?? C.violetLight, shadowBlur: l.glow * 30, shadowEnabled: l.glow > 0, shadowOpacity: 0.9 }
  const onTransformEnd = () => {
    const n = ref.current!
    const sx = n.scaleX(),
      sy = n.scaleY()
    n.scaleX(1)
    n.scaleY(1)
    p.onChange(l.id, { x: n.x(), y: n.y(), rotation: n.rotation(), width: Math.max(4, l.width * sx), height: Math.max(0, l.height * sy) } as Partial<ShapeLayer>)
  }
  const base = common(l, p)
  const props = { ...base, ...glow, stroke: l.stroke, strokeWidth: l.strokeWidth, fill: l.fill, hitStrokeWidth: 24, onTransformEnd }
  const { width: w, height: h } = l
  switch (l.shape) {
    case 'rect':
      if (l.gradient)
        return (
          <Rect
            ref={setRef}
            {...props}
            fill={undefined}
            width={w}
            height={h}
            fillLinearGradientStartPoint={{ x: 0, y: 0 }}
            fillLinearGradientEndPoint={{ x: 0, y: h }}
            fillLinearGradientColorStops={[0, 'rgba(0,0,16,0)', 1, 'rgba(0,0,16,0.95)']}
          />
        )
      return <Rect ref={setRef} {...props} width={w} height={h} cornerRadius={l.cornerRadius} />
    case 'line':
      return <Line ref={setRef} {...props} points={[0, 0, w, 0]} lineCap="round" />
    case 'corner':
      return <Line ref={setRef} {...props} fill={undefined} points={[0, h, w * 0.78, h, w * 0.78 + h, 0]} lineCap="round" lineJoin="round" />
    case 'hex':
      return <RegularPolygon ref={setRef} {...props} sides={6} radius={w / 2} offsetX={-w / 2} offsetY={-w / 2} />
    case 'slash':
      return <Line ref={setRef} {...props} closed points={[0, Math.min(h * 0.18, 90), w, 0, w, h, 0, h]} />
    case 'frame': {
      const a = Math.min(w, h) * 0.1
      return (
        <Group ref={setRef} {...base} onTransformEnd={onTransformEnd}>
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
