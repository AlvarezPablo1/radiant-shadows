export type EventType = 'partido' | 'torneo' | 'stream' | 'evento'

export interface CalendarEvent {
  /** día en formato AAAA-MM-DD */
  date: string
  /** hora de Argentina, "HH:MM" (opcional) */
  time?: string
  title: string
  type: EventType
  /** equipo que juega, si aplica: "Masculino", "Game Changers"… */
  team?: string
  /** rival, para mostrar "RS vs …" en los próximos partidos */
  opponent?: string
  description?: string
  /** link para verlo o inscribirse (Twitch, bracket, etc.) */
  link?: string
}

/** tipos que cuentan como partido en "Próximos partidos" */
export const MATCH_TYPES: EventType[] = ['partido', 'torneo']

/** Nombre y color de cada tipo de evento (punto, etiqueta y borde) */
export const EVENT_TYPES: Record<EventType, { label: string; color: string }> = {
  partido: { label: 'Partido', color: '#8e44ff' },
  torneo: { label: 'Torneo', color: '#ffb347' },
  stream: { label: 'Stream', color: '#3dd6c6' },
  evento: { label: 'Evento', color: '#ff6fb5' },
}

/**
 * Eventos del calendario. Para agregar uno, sumá una línea acá.
 * EJEMPLOS para ver el diseño (todos menos el cierre de tryouts, que es real): reemplazar antes de publicar.
 */
export const EVENTS: CalendarEvent[] = [
  { date: '2026-11-18', time: '20:00', title: 'Premier · Fecha 3', type: 'partido', team: 'Masculino', opponent: 'Rival de ejemplo', description: 'Partido de Premier LAS.' },
  { date: '2026-11-21', time: '19:00', title: 'Stream con la comunidad', type: 'stream', link: 'https://twitch.tv/radiant_shadowss' },
  { date: '2026-11-25', time: '21:00', title: 'Copa de ejemplo · Cuartos', type: 'torneo', team: 'Game Changers' },
  { date: '2026-11-25', time: '22:30', title: 'Premier · Fecha 4', type: 'partido', team: 'Masculino' },
  { date: '2026-12-05', title: 'Cierre de tryouts · Roster masculino', type: 'evento', description: 'Último día para anotarse en los tryouts.', link: 'https://docs.google.com/forms/d/e/1FAIpQLSc20k3rxQAPz-ZAH98pqGfIzGil9HjlLDfc4M-AIq5Vc5jRNg/viewform' },
]
