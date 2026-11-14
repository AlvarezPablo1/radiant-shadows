import type { FontRole } from './brand'

export type FormatId = 'story' | 'feed' | 'x'
export const FORMATS: Record<FormatId, { w: number; h: number; label: string; short: string; network: 'ig' | 'x' }> = {
  story: { w: 1080, h: 1920, label: 'Historia IG', short: '9:16', network: 'ig' },
  feed: { w: 1080, h: 1350, label: 'Feed IG', short: '4:5', network: 'ig' },
  x: { w: 1600, h: 900, label: 'Post X', short: '16:9', network: 'x' },
}
export const FORMAT_IDS: FormatId[] = ['story', 'feed', 'x']

export type RosterId = 'main' | 'gc'
export type Visual = 'players' | 'mascots' | 'none'

export type FilterId = 'none' | 'oscuro' | 'violeta' | 'sombra' | 'calido' | 'noche' | 'neon' | 'mate' | 'fuego'

export interface LayerBase {
  id: string
  name: string
  x: number
  y: number
  rotation: number
  opacity: number
  visible: boolean
  locked: boolean
  /** Si está enlazado, el contenido sale de los datos de la publicación (doc.fields / roster). */
  bind?: string
  /** identifica "el mismo elemento" en los 3 formatos (para sincronizar estilos) */
  key?: string
  /** pertenece a una fila de jugadores que se reacomoda sola */
  row?: RowInfo
}

export interface RowInfo {
  /** stage = recortes superpuestos (el del medio adelante) · panels = columnas */
  kind: 'stage' | 'panels'
  x: number
  y: number
  w: number
  h: number
  /** une la foto con su panel de fondo */
  slot: number
  role?: 'photo' | 'panel' | 'filler'
  /** cuánto se superponen los jugadores (0 = separados, 0.45 = muy juntos) */
  overlap?: number
  /** filas anchas y bajas (X): los jugadores se superponen más para verse más grandes */
  dense?: boolean
  /** grilla fija de columnas (ej. 3 en historias); si no, una columna por jugador */
  cols?: number
  /** tamaño elegido a mano para este jugador (1 = el de la fila); se respeta al reacomodar */
  scale?: number
  /** zona de la foto dentro de la columna (si difiere del panel) */
  py?: number
  ph?: number
}

export interface TextLayer extends LayerBase {
  type: 'text'
  text: string
  font: FontRole | string
  fontSize: number
  italic: boolean
  fill: string
  align: 'left' | 'center' | 'right'
  width: number
  letterSpacing: number
  lineHeight: number
  uppercase: boolean
  glow: number
  stroke?: string
  strokeWidth?: number
  /** achica la fuente para que cada línea entre en el ancho */
  autoFit?: boolean
  weight?: string
  /** sombra sólida desplazada (efecto volumen) */
  extrude?: number
  /** color de fondo tipo etiqueta (ej. badge "MVP") */
  background?: string
}

export interface ImageLayer extends LayerBase {
  type: 'image'
  src: string
  /** caja donde se ajusta la imagen (contain, anclada abajo-centro) o cover */
  width: number
  height: number
  fit: 'contain' | 'cover'
  filter: FilterId
  flipX: boolean
  glow: number
  /** desvanecer la parte inferior (fundido al fondo) */
  fadeBottom: number
  /** en modo "rellenar caja": qué parte vertical se ve (0 = arriba, 0.5 = centro) */
  cropY?: number
}

export interface ShapeLayer extends LayerBase {
  type: 'shape'
  shape: 'rect' | 'line' | 'corner' | 'hex' | 'slash' | 'frame'
  width: number
  height: number
  fill: string
  stroke: string
  strokeWidth: number
  cornerRadius: number
  glow: number
  /** relleno con degradado hacia el negro (de transparente arriba a opaco abajo) */
  gradient?: boolean
}

export type Layer = TextLayer | ImageLayer | ShapeLayer

export interface BgRecipe {
  preset: string
  seed: number
  tone: 'deep' | 'violet' | 'shadow' | 'ember'
  smoke: number
  fire: number
  hex: number
  scales: number
  particles: number
  sparkles: number
  shadows: number
  lines: boolean
  /** líneas de neón diagonales (estilo placas actuales) */
  neon?: number
  /** esquinas tipo visor en los 4 bordes */
  corners?: boolean
  silhouette: 'none' | 'rs' | 'gc'
  silhouetteOpacity: number
  image?: string
  imageDim: number
  imageFilter: FilterId
}

export interface Person {
  id: string
  name: string
  realName?: string
  role: string
  ig: string
  x: string
  photo?: string
  active: boolean
}

export interface Roster {
  id: RosterId
  label: string
  players: Person[]
  staff: Person[]
}

export interface PostDoc {
  type: string
  roster: RosterId
  visual: Visual
  variant: number
  mascot: string
  fields: Record<string, string>
  /** ids de jugadores elegidos (bienvenida, cumple, etc.) */
  people: string[]
  bg: BgRecipe
  layers: Partial<Record<FormatId, Layer[]>>
}
