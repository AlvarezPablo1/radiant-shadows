import { EVENT_TYPES } from '../content/events'

/** Lo que el calendario necesita de cada evento (lo comparten el calendario de la web y la agenda del admin) */
export interface CalendarItem {
  /** "AAAA-MM-DD" */
  date: string
  time?: string
  title: string
  type: string
  team?: string
  opponent?: string
  description?: string
  link?: string
}

/** nombre y color de cada tipo de evento */
export type TypeStyles = Record<string, { label: string; color: string }>

export const styleOf = (types: TypeStyles, type: string) => types[type] ?? { label: type, color: '#c79bff' }
export const DEFAULT_TYPES: TypeStyles = EVENT_TYPES
