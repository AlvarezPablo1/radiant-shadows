import type { FieldDef } from '../admin/schemas'
import type { CalendarItem, TypeStyles } from '../shared/calendar/types'

/** Un evento de la agenda de contenido (es sólo del staff: no se comparte con la web) */
export type AgendaEvent = CalendarItem & { id: string }

/** Tipos de la agenda, con su color en el calendario */
export const AGENDA_TYPES: TypeStyles = {
  publicacion: { label: 'Publicación', color: '#8e44ff' },
  video: { label: 'Video / Reel', color: '#3dd6c6' },
  stream: { label: 'Stream', color: '#4fa3ff' },
  partido: { label: 'Partido', color: '#ffb347' },
  reunion: { label: 'Reunión', color: '#ff6fb5' },
  tryouts: { label: 'Tryouts', color: '#D42300' },
  otro: { label: 'Otro', color: '#ffffff' },
}

/** Campos del formulario (los mismos componentes que usa el admin) */
export const AGENDA_FIELDS: FieldDef[] = [
  { key: 'title', label: 'Título', type: 'text', required: true, placeholder: 'Post de Matchday vs …' },
  { key: 'type', label: 'Tipo', type: 'select', required: true, options: Object.entries(AGENDA_TYPES).map(([value, t]) => ({ value, label: t.label })) },
  { key: 'date', label: 'Día', type: 'date', required: true },
  { key: 'time', label: 'Hora', type: 'time' },
  { key: 'team', label: 'Equipo', type: 'select', options: [{ value: 'Masculino', label: 'Masculino' }, { value: 'Game Changers', label: 'Game Changers' }] },
  { key: 'description', label: 'Notas', type: 'textarea', placeholder: 'Qué hay que preparar, quién lo hace…' },
  { key: 'link', label: 'Link (opcional)', type: 'url', placeholder: 'Drive, Canva, borrador…' },
]
