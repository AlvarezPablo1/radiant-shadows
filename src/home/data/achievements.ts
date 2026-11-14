export interface Achievement {
  /** puesto final: 1, 2, 3, 4… */
  place: number
  /** cómo se nombra el resultado, p. ej. "Subcampeones" o "4to puesto" */
  result: string
  tournament: string
  /** quién organizó el torneo */
  organizer?: string
  team: string
  /** fecha o temporada, si se quiere mostrar */
  when?: string
}

/** Logros del club, del más destacado al menos */
export const ACHIEVEMENTS: Achievement[] = [
  { place: 2, result: 'Subcampeones', tournament: 'All In Series', organizer: 'Moonfly', team: 'Masculino' },
  { place: 4, result: '4to puesto', tournament: 'Nuvy Ignite', team: 'Game Changers' },
]

/** color de cada puesto: oro, plata y bronce; del 4to en adelante, violeta */
export const placeColor = (place: number) => ({ 1: '#ffd27a', 2: '#dfe3ee', 3: '#e0a173' })[place] ?? '#c79bff'
