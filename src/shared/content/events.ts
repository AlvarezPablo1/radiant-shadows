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

/** Eventos del calendario. Para agregar uno, sumá una línea acá. */
export const EVENTS: CalendarEvent[] = [
  { date: '2026-12-05', title: 'Cierre de tryouts · Roster masculino', type: 'evento', description: 'Último día para anotarse en los tryouts.', link: 'https://docs.google.com/forms/d/e/1FAIpQLSc20k3rxQAPz-ZAH98pqGfIzGil9HjlLDfc4M-AIq5Vc5jRNg/viewform' },
]
