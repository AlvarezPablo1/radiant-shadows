import type { CollectionKey } from './collections'
import { ACHIEVEMENTS, type Achievement } from './achievements'
import { EVENTS, type CalendarEvent } from './events'
import { NEWS, type NewsItem } from './news'
import { CREATORS, STAFF, type Person } from './people'
import { MAIN_PLAYERS, MAIN_STAFF, type Member } from './rosters'

/** Todo el contenido editable desde /admin, una lista por sección */
export interface Content extends Record<CollectionKey, unknown[]> {
  news: NewsItem[]
  players: Member[]
  coaches: Member[]
  staff: Person[]
  creators: Person[]
  achievements: Achievement[]
  events: CalendarEvent[]
}

/** Contenido inicial (el que está en el código). Se usa hasta que se guarda algo desde /admin, y mientras carga. */
export const DEFAULT_CONTENT: Content = {
  news: NEWS,
  players: MAIN_PLAYERS,
  coaches: MAIN_STAFF,
  staff: STAFF,
  creators: CREATORS,
  achievements: ACHIEVEMENTS,
  events: EVENTS,
}
