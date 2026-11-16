import Konva from 'konva'
import { useMemo, useRef } from 'react'
import { Group, Rect, Text } from 'react-konva'
import { C } from '../../brand'
import { fontFamily, fontWeight } from '../../lib/fonts'
import type { TextLayer } from '../../types'
import { common, type NodeProps } from './common'

const measureCtx = document.createElement('canvas').getContext('2d')!

/** texto: con "ajustar al ancho" se achica solo; la caja de selección mide lo que ocupa el texto */
export function TextNode({ l, value, fontsV, ...p }: NodeProps<TextLayer> & { value: string; fontsV: number }) {
  const text = l.uppercase ? value.toUpperCase() : value
  const family = fontFamily(l.font)
  const weight = l.weight ?? fontWeight(l.font)
  const style = `${l.italic ? 'italic ' : ''}${weight}`
  const size = useMemo(() => {
    if (!l.autoFit) return l.fontSize
    measureCtx.font = `${style} ${l.fontSize}px ${family}`
    const widest = Math.max(1, ...text.split('\n').map((line) => measureCtx.measureText(line).width + line.length * l.letterSpacing))
    return widest > l.width ? Math.max(8, l.fontSize * (l.width / widest) * 0.98) : l.fontSize
    // fontsV: se vuelve a medir cuando terminan de cargar las fuentes
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
