import type { PostDoc } from '../../types'
import { outcome } from './outcome'

/* ---------- menú "¿Qué querés publicar?" ---------- */

export interface SubOption {
  label: string
  type: string
  /** valores que fija al elegirlo */
  fields?: Record<string, string>
  /** para saber si está activo */
  match?: (d: PostDoc) => boolean
}
export interface Category {
  id: string
  label: string
  options: SubOption[]
}

export const CATEGORIES: Category[] = [
  { id: 'matchday', label: 'Día de partido', options: [{ label: 'Día de partido', type: 'matchday' }] },
  { id: 'victoria', label: 'Victoria', options: [{ label: 'Victoria', type: 'resultado', fields: { outcome: 'win' }, match: (d) => outcome(d) === 'win' }] },
  { id: 'derrota', label: 'Derrota', options: [{ label: 'Derrota', type: 'resultado', fields: { outcome: 'loss' }, match: (d) => outcome(d) === 'loss' }] },
  { id: 'empate', label: 'Empate', options: [{ label: 'Empate', type: 'resultado', fields: { outcome: 'draw' }, match: (d) => outcome(d) === 'draw' }] },
  {
    id: 'participacion',
    label: 'Participación',
    options: [
      { label: 'Participación', type: 'torneo', fields: { place: '6' }, match: (d) => d.fields.place === '6' },
      { label: '4° puesto', type: 'torneo', fields: { place: '4' }, match: (d) => d.fields.place === '4' },
      { label: 'Top 8', type: 'torneo', fields: { place: '5' }, match: (d) => d.fields.place === '5' },
    ],
  },
  {
    id: 'podio',
    label: 'Podio',
    options: [
      { label: 'Campeones', type: 'torneo', fields: { place: '1' }, match: (d) => (d.fields.place || '1') === '1' },
      { label: 'Subcampeones', type: 'torneo', fields: { place: '2' }, match: (d) => d.fields.place === '2' },
      { label: '3° puesto', type: 'torneo', fields: { place: '3' }, match: (d) => d.fields.place === '3' },
    ],
  },
  {
    id: 'jugadores',
    label: 'Jugadores',
    options: [
      { label: 'MVP', type: 'mvp' },
      { label: 'Bienvenida', type: 'bienvenida' },
      { label: 'Despedida', type: 'despedida' },
      { label: 'Cumpleaños', type: 'cumple' },
      { label: 'Roster oficial', type: 'roster' },
    ],
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    options: [
      { label: 'Comunicado', type: 'comunicado' },
      { label: 'Educativo', type: 'comunidad' },
      { label: 'Stream ON', type: 'stream' },
    ],
  },
]

export function categoryOf(d: PostDoc): Category {
  return CATEGORIES.find((c) => c.options.some((o) => o.type === d.type && (!o.match || o.match(d)))) ?? CATEGORIES.find((c) => c.options.some((o) => o.type === d.type)) ?? CATEGORIES[0]
}
