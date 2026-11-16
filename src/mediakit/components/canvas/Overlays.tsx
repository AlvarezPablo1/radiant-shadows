import { Group, Line, Rect, Text } from 'react-konva'
import { C } from '../../brand'
import { guideLines, type Guides } from './guides'

/** guías: margen, centro y grilla de filas/columnas */
export function GuidesOverlay({ g, w, h, scale }: { g: Guides; w: number; h: number; scale: number }) {
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

/** línea rosa punteada mientras un elemento se imanta a una guía */
export function SnapOverlay({ snap, w, h, scale }: { snap: { x?: number; y?: number }; w: number; h: number; scale: number }) {
  const dash = [6 / scale, 4 / scale]
  return (
    <Group listening={false} name="overlay">
      {snap.x !== undefined && <Line points={[snap.x, 0, snap.x, h]} stroke="#FF4FD8" strokeWidth={1.5 / scale} dash={dash} />}
      {snap.y !== undefined && <Line points={[0, snap.y, w, snap.y]} stroke="#FF4FD8" strokeWidth={1.5 / scale} dash={dash} />}
    </Group>
  )
}

/** recuadro de selección al arrastrar sobre el fondo */
export function BandOverlay({ band, scale }: { band: { x0: number; y0: number; x1: number; y1: number }; scale: number }) {
  return (
    <Rect
      name="overlay"
      listening={false}
      x={Math.min(band.x0, band.x1)}
      y={Math.min(band.y0, band.y1)}
      width={Math.abs(band.x1 - band.x0)}
      height={Math.abs(band.y1 - band.y0)}
      fill="rgba(142,68,255,0.12)"
      stroke={C.violetLight}
      strokeWidth={1 / scale}
    />
  )
}

/** zonas de la historia que tapa Instagram */
export function SafeZoneOverlay({ w, h }: { w: number; h: number }) {
  return (
    <Group listening={false} name="overlay">
      <Rect width={w} height={210} fill="rgba(255,60,90,0.12)" />
      <Rect y={h - 250} width={w} height={250} fill="rgba(255,60,90,0.12)" />
      <Text text="Zona de la interfaz de IG (evitar texto)" x={20} y={90} fontSize={30} fill="rgba(255,200,210,0.8)" fontFamily="Sora" />
      <Text text="Zona de respuesta (evitar texto)" x={20} y={h - 140} fontSize={30} fill="rgba(255,200,210,0.8)" fontFamily="Sora" />
    </Group>
  )
}
