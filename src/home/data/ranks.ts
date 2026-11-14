/**
 * Ícono de cada rango de Valorant (imágenes oficiales del juego, guardadas en /brand/ranks).
 * "Inmortal" sin número usa el ícono de Inmortal 1.
 */
const RANK_ICONS: Record<string, string> = {
  inmortal: '/brand/ranks/immortal-1.png',
  'inmortal 1': '/brand/ranks/immortal-1.png',
  'inmortal 2': '/brand/ranks/immortal-2.png',
  'inmortal 3': '/brand/ranks/immortal-3.png',
  radiante: '/brand/ranks/radiant.png',
}

export const rankIcon = (rank?: string) => (rank ? RANK_ICONS[rank.trim().toLowerCase()] : undefined)
