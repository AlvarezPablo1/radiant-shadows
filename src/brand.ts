// Identidad visual oficial (Manual de marca cap. 07 / 08 / 09)
export const C = {
  violet: '#7A28E2', // Violeta Radiant: acento / energía / fuego
  black: '#000010', // Negro profundo: territorio
  dark: '#151C24', // Gris oscuro: superficies
  shadow: '#2E2636', // Púrpura sombra: apoyo / transiciones
  white: '#EAEAEA', // Blanco: texto
  violetDeep: '#4C1D95',
  violetMid: '#5E2CA5',
  violetLight: '#8E44FF',
  lilac: '#C79BFF',
  ember: '#FFB347', // brasas / datos destacados (fecha y hora en las placas actuales)
}

export const PALETTE = [C.white, C.violet, C.lilac, C.violetLight, C.black, C.dark, C.shadow, C.ember]

/**
 * Roles tipográficos. Cooper BT y Proxima Nova son fuentes con licencia (Canva):
 * por defecto se usan sustitutos de Google Fonts y el staff puede subir las
 * fuentes reales desde "Marca → Tipografías" para que reemplacen al sustituto.
 */
export type FontRole = 'fuerza' | 'alma' | 'condensada' | 'manuscrita'
export const FONT_ROLES: Record<FontRole, { label: string; use: string; official: string; officialName: string; fallback: string; weight: string; sample: string }> = {
  fuerza: { label: 'Textos', use: 'Párrafos y textos largos (comunicados, educativos)', official: 'RS Proxima Nova', officialName: 'Proxima Nova Bold', fallback: 'Montserrat', weight: '800', sample: 'Texto' },
  alma: { label: 'Frases', use: 'Frases cortas, firmas, detalles', official: 'RS Cooper BT', officialName: 'Cooper BT', fallback: 'Young Serif', weight: '400', sample: 'Frase' },
  condensada: { label: 'Títulos', use: 'Titulares, datos, nombres y etiquetas', official: 'RS Condensada', officialName: 'Condensada', fallback: 'Bebas Neue', weight: '400', sample: 'GAME DAY' },
  manuscrita: { label: 'Manuscrita', use: 'Acentos escritos a mano ("hoy", "del partido")', official: 'RS Manuscrita', officialName: 'Manuscrita', fallback: 'Rock Salt', weight: '400', sample: 'hoy' },
}

export const HASHTAGS = ['#SomosDRAGONES', '#ElFuegoSigue', '#VamosDRAGONES', '#QueArdaRadiant', '#SomosDRAGONAS']
export const DEFAULT_HASHTAGS = ['#SomosDRAGONES', '#ElFuegoSigue', '#VamosDRAGONES']

export const LOGOS = {
  main: { positive: '/brand/logos/rs-positive.png', negative: '/brand/logos/rs-negative.png' },
  gc: { positive: '/brand/logos/gc-positive.png', negative: '/brand/logos/gc-negative.png' },
}

export type MascotAsset = { id: string; label: string; src: string; who: 'kael' | 'nyra' | 'duo' }
export const MASCOTS: MascotAsset[] = [
  { id: 'kael-frente', label: 'Kael · frente', src: '/brand/mascots/kael-frente.png', who: 'kael' },
  { id: 'kael-34', label: 'Kael · 3/4', src: '/brand/mascots/kael-34.png', who: 'kael' },
  { id: 'kael-lateral', label: 'Kael · perfil', src: '/brand/mascots/kael-lateral.png', who: 'kael' },
  { id: 'kael-espalda', label: 'Kael · espalda', src: '/brand/mascots/kael-espalda.png', who: 'kael' },
  { id: 'kael-dragon', label: 'Kael · dragón', src: '/brand/mascots/kael-dragon.png', who: 'kael' },
  { id: 'kael-alas', label: 'Alas', src: '/brand/mascots/kael-alas.png', who: 'kael' },
  { id: 'nyra-frente', label: 'Nyra · frente', src: '/brand/mascots/nyra-frente.png', who: 'nyra' },
  { id: 'nyra-victoria', label: 'Nyra · victoria', src: '/brand/mascots/nyra-victoria.png', who: 'nyra' },
  { id: 'nyra-apoyo', label: 'Nyra · ¡Vamos Radiant!', src: '/brand/mascots/nyra-apoyo.png', who: 'nyra' },
  { id: 'nyra-gamer', label: 'Nyra · gamer', src: '/brand/mascots/nyra-gamer.png', who: 'nyra' },
  { id: 'nyra-estudiando', label: 'Nyra · estudiando', src: '/brand/mascots/nyra-estudiando.png', who: 'nyra' },
  { id: 'duo-frente', label: 'Kael y Nyra', src: '/brand/mascots/duo-frente.png', who: 'duo' },
  { id: 'duo-victoria', label: 'Kael y Nyra · victoria', src: '/brand/mascots/duo-victoria.png', who: 'duo' },
]
export const mascot = (id: string) => MASCOTS.find((m) => m.id === id)?.src ?? MASCOTS[0].src

/** Fotos oficiales del roster MAIN (con camiseta, recortadas) */
export const PLAYER_PHOTOS: Record<string, string> = {
  Aku: '/brand/players/aku.png',
  Gabzera: '/brand/players/gabzera.png',
  Reko: '/brand/players/reko.png',
  Skull: '/brand/players/skull.png',
  Splotza: '/brand/players/splotza.png',
}
