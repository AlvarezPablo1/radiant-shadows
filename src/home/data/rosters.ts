export interface Member {
  name: string
  /** foto recortada sin fondo; si falta se muestra una silueta */
  photo?: string
  /** achica la foto si viene recortada más cerca que las demás (1 = alto completo) */
  photoScale?: number
  /** Duelista, Iniciador, Controlador, Centinela, Flex · o el puesto en el staff */
  role?: string
  /** rango de Valorant según tracker.gg, p. ej. "Inmortal 3" o "Radiante" */
  rank?: string
  nationality?: string
  /** bandera en emoji, p. ej. "🇦🇷" */
  flag?: string
  age?: number
  /** perfil en tracker.gg para ver sus stats */
  tracker?: string
}

/** Roster masculino (MAIN). Los datos que falten se muestran como "—" */
export const MAIN_PLAYERS: Member[] = [
  { name: 'Aku', photo: '/brand/players/aku.webp', photoScale: 0.86, role: 'Duelista', rank: 'Radiante', nationality: 'Argentina', flag: '🇦🇷', age: 19,
    tracker: 'https://tracker.gg/valorant/profile/riot/akuzera%23sfb/overview?platform=pc&playlist=competitive&season=d816f426-48ea-f052-117f-9697a155b319' },
  { name: 'Reko', photo: '/brand/players/reko.webp', role: 'Iniciador', rank: 'Inmortal 1', nationality: 'Uruguay', flag: '🇺🇾', age: 18,
    tracker: 'https://tracker.gg/valorant/profile/riot/Reko%2318y/overview?platform=pc&playlist=competitive&season=d816f426-48ea-f052-117f-9697a155b319' },
  { name: 'Splotza', photo: '/brand/players/splotza.webp', role: 'Controlador', rank: 'Inmortal 3', nationality: 'Argentina', flag: '🇦🇷', age: 18,
    tracker: 'https://tracker.gg/valorant/profile/riot/NEVER%20GIVE%20UP%23Was/overview?playlist=premier&platform=pc' },
]

/** Cuerpo técnico del roster masculino */
export const MAIN_STAFF: Member[] = [
  { name: 'Wasi', role: 'Coach', rank: 'Inmortal 3', nationality: 'Argentina', flag: '🇦🇷', age: 22,
    tracker: 'https://tracker.gg/valorant/profile/riot/NEVER%20GIVE%20UP%23Was/overview?playlist=premier&platform=pc' },
  { name: 'Skull', role: 'Assistant coach', photo: '/brand/players/skull.webp', rank: 'Inmortal 2', nationality: 'Argentina', flag: '🇦🇷', age: 19,
    tracker: 'https://tracker.gg/valorant/profile/riot/Skull%23UNDER/overview?playlist=premier&platform=pc' },
]
