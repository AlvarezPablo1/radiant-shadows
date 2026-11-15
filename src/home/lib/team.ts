import type { CalendarEvent } from '../../shared/content/events'
import type { Team } from '../data/teams'
import type { Page } from '../types'
import { upcomingMatches } from '../../shared/calendar/events'

/**
 * Qué equipo "manda" en la pantalla (logo del nav y mascota del héroe):
 * - en la sección de Game Changers, GC;
 * - en la home, el equipo del próximo partido (si no hay partidos, el principal);
 * - en el resto, el principal.
 */
export function activeTeam(page: Page, isHome: boolean, events: CalendarEvent[]): Team {
  if (page.path.startsWith('/equipo/game-changers')) return 'gc'
  if (isHome) return upcomingMatches(events, 1)[0]?.team === 'Game Changers' ? 'gc' : 'main'
  return 'main'
}
