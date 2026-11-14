/**
 * Rangos de Valorant con su ícono (imágenes oficiales del juego, guardadas en /brand/ranks).
 * "Inmortal" sin número usa el ícono de Inmortal 1.
 */
const TIERS: [name: string, file: string][] = [
  ['Hierro', 'iron'],
  ['Bronce', 'bronze'],
  ['Plata', 'silver'],
  ['Oro', 'gold'],
  ['Platino', 'platinum'],
  ['Diamante', 'diamond'],
  ['Ascendente', 'ascendant'],
  ['Inmortal', 'immortal'],
]

/** todos los rangos, de menor a mayor: "Hierro 1" … "Inmortal 3", "Radiante" */
export const RANKS: string[] = [...TIERS.flatMap(([name]) => [1, 2, 3].map((d) => `${name} ${d}`)), 'Radiante']

const ICONS: Record<string, string> = {
  ...Object.fromEntries(TIERS.flatMap(([name, file]) => [1, 2, 3].map((d) => [`${name} ${d}`.toLowerCase(), `/brand/ranks/${file}-${d}.png`]))),
  inmortal: '/brand/ranks/immortal-1.png',
  radiante: '/brand/ranks/radiant.png',
}

export const rankIcon = (rank?: string) => (rank ? ICONS[rank.trim().toLowerCase()] : undefined)
