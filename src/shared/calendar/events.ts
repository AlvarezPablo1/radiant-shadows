import { MATCH_TYPES, type CalendarEvent } from '../content/events'
import { todayKey } from './dates'

/** por fecha y después por hora */
export const sortByDate = <T extends { date: string; time?: string }>(events: T[]) =>
  [...events].sort((a, b) => a.date.localeCompare(b.date) || (a.time ?? '').localeCompare(b.time ?? ''))

/** eventos de hoy en adelante */
export const upcomingEvents = (events: CalendarEvent[], limit: number) => sortByDate(events.filter((e) => e.date >= todayKey())).slice(0, limit)

/** partidos y torneos de hoy en adelante */
export const upcomingMatches = (events: CalendarEvent[], limit: number) =>
  sortByDate(events.filter((e) => e.date >= todayKey() && MATCH_TYPES.includes(e.type))).slice(0, limit)

/** momento exacto en que empieza (los horarios están en hora argentina, UTC−3); sin hora, el inicio del día */
export const eventStart = (e: CalendarEvent) => new Date(`${e.date}T${e.time ?? '00:00'}:00-03:00`)
