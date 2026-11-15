// Identidad visual oficial (Manual de marca cap. 07 / 08 / 09)
export const C = {
  violet: '#7415C1', // Violeta Radiant: acento / energía / fuego
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

export type Mascot = 'dragon' | 'dragona'
export type MascotAsset = { id: string; label: string; src: string; who: Mascot; shirt: boolean }
/** Expresiones de las mascotas (mismo nombre para el dragón y la dragona; "/a" se adapta a cada uno) */
const LABELS: Record<string, string> = {
  victoria: 'Victoria (alas abiertas)',
  sentada: 'Sentada',
  rugiendo: 'Rugiendo',
  burlon: 'Burlón/a',
  picaro: 'Pícaro/a',
  confiado: 'Confiado/a',
  orgulloso: 'Orgulloso/a',
  senalando: 'Señalando',
  desafiante: 'Desafiante',
  serio: 'Serio/a',
  enojado: 'Enojado/a',
  sorprendido: 'Sorprendido/a',
  pensando: 'Pensando',
  indiferente: 'Indiferente',
  silencio: 'Silencio',
}
const ALL = ['victoria', 'rugiendo', 'burlon', 'picaro', 'confiado', 'orgulloso', 'senalando', 'desafiante', 'serio', 'enojado', 'sorprendido', 'pensando', 'indiferente', 'silencio']
/** qué expresiones hay de cada personaje, sin y con la camiseta del equipo */
const SETS: Record<Mascot, Record<'sin' | 'con', string[]>> = {
  dragon: { sin: ALL, con: ALL },
  dragona: { sin: ALL, con: ['sentada', 'rugiendo', 'burlon', 'picaro', 'confiado', 'orgulloso', 'desafiante', 'serio', 'enojado', 'sorprendido', 'indiferente'] },
}
const sticker = (who: Mascot, shirt: boolean, id: string): MascotAsset => ({
  id: `${who}${shirt ? '-camiseta' : ''}-${id}`,
  label: `${who === 'dragon' ? 'Dragón' : 'Dragona'} · ${LABELS[id].replace('o/a', who === 'dragon' ? 'o' : 'a')}${shirt ? ' · con camiseta' : ''}`,
  src: `/brand/mascots/${who}${shirt ? '-camiseta' : ''}/${id}.webp`,
  who,
  shirt,
})
export const MASCOTS: MascotAsset[] = (['dragon', 'dragona'] as Mascot[]).flatMap((who) => [
  ...SETS[who].sin.map((id) => sticker(who, false, id)),
  ...SETS[who].con.map((id) => sticker(who, true, id)),
])
/** el personaje de cada equipo: el dragón en MAIN, la dragona en GC */
export const mascotOf = (roster: string): Mascot => (roster === 'gc' ? 'dragona' : 'dragon')
const expressionOf = (id: string) => id.replace(/^dragona?-(camiseta-)?/, '')
export const hasShirt = (id: string) => /^dragona?-camiseta-/.test(id)
/** la mascota de un equipo con una expresión; si esa expresión no existe con/sin camiseta, la más parecida que haya */
export const mascotFor = (roster: string, expression: string, shirt = false) => {
  const who = mascotOf(roster)
  const pick = (sh: boolean, ex: string) => MASCOTS.find((m) => m.who === who && m.shirt === sh && expressionOf(m.id) === ex)?.id
  return pick(shirt, expression) ?? pick(shirt, expression === 'victoria' ? 'sentada' : 'confiado') ?? pick(!shirt, expression) ?? MASCOTS[0].id
}
/** al cambiar de equipo, la misma expresión (y camiseta) con el personaje del otro equipo */
export const swapMascot = (id: string, roster: string) => mascotFor(roster, expressionOf(id), hasShirt(id))
/** la misma expresión, con o sin camiseta */
export const withShirt = (id: string, roster: string, shirt: boolean) => mascotFor(roster, expressionOf(id), shirt)
export const mascot = (id: string) => MASCOTS.find((m) => m.id === id)?.src ?? MASCOTS[0].src
