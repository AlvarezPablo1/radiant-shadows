import { EVENTS, MATCH_TYPES, type CalendarEvent } from '../data/events'
import { todayKey } from './calendar'

/** por fecha y después por hora */
export const sortByDate = (events: CalendarEvent[]) =>
  [...events].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))

/** eventos de hoy en adelante */
export const upcomingEvents = (limit: number) => sortByDate(EVENTS.filter((e) => e.date >= todayKey())).slice(0, limit)

/** partidos y torneos de hoy en adelante */
export const upcomingMatches = (limit: number) =>
  sortByDate(EVENTS.filter((e) => e.date >= todayKey() && MATCH_TYPES.includes(e.type))).slice(0, limit)

/** momento exacto en que empieza (los horarios están en hora argentina, UTC−3); sin hora, el inicio del día */
export const eventStart = (e: CalendarEvent) => new Date(`${e.date}T${e.time ?? '00:00'}:00-03:00`)
