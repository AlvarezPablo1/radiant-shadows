import type { PostDoc, Visual } from '../../types'

export interface FieldDef {
  key: string
  label: string
  kind: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'image' | 'toggle'
  placeholder?: string
  options?: { value: string; label: string }[]
  hint?: string
  /** texto fijo delante del campo (p. ej. "twitch.tv/"): sólo se escribe lo que sigue */
  prefix?: string
}

export type HeroKind = 'person' | 'people' | 'auto'

export interface PostType {
  id: string
  label: string
  group: 'Competitivo' | 'Roster' | 'Comunidad'
  fields: FieldDef[]
  /** quién aparece: una persona elegida, el roster entero o según el modo visual */
  people: 'one' | 'many' | 'none'
  defaultVisual: Visual
  /** emoción de la mascota por defecto (el personaje sale del equipo: dragón en MAIN, dragona en GC) */
  defaultMascot: string
  bgPreset: (d: PostDoc) => string
  /** ¿se puede publicar en Feed IG? */
  feed: (d: PostDoc) => boolean
  /** ¿se puede publicar en Historia IG? (por defecto sí) */
  story?: (d: PostDoc) => boolean
  checklist: string[]
}
