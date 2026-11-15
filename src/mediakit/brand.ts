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

export type MascotAsset = { id: string; label: string; src: string }
/** Mascota: la dragona en stickers, uno por emoción (cada uno ya trae su palabra, si tiene) */
const sticker = (id: string, label: string): MascotAsset => ({ id: `dragona-${id}`, label, src: `/brand/mascots/dragona/${id}.png` })
export const MASCOTS: MascotAsset[] = [
  sticker('gg', 'GG'),
  sticker('nt', 'NT'),
  sticker('celebrando', 'Celebrando'),
  sticker('felicidades', 'Felicidades'),
  sticker('feliz', 'Feliz'),
  sticker('saludando', 'Saludando'),
  sticker('uwu', 'UwU'),
  sticker('sonrojada', 'Sonrojada'),
  sticker('avergonzada', 'Avergonzada'),
  sticker('triste', 'Triste'),
  sticker('llorando', 'Llorando'),
  sticker('enojada', 'Enojada'),
]
export const mascot = (id: string) => MASCOTS.find((m) => m.id === id)?.src ?? MASCOTS[0].src
