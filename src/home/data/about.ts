export interface Pillar {
  id: 'compete' | 'people' | 'grow'
  title: string
  text: string
}

/** Los tres pilares, en columnas */
export const ABOUT_PILLARS: Pillar[] = [
  {
    id: 'compete',
    title: 'Competir',
    text: 'Hay victorias para celebrar y derrotas de las que aprender, pero seguimos adelante.',
  },
  {
    id: 'people',
    title: 'Las personas',
    text: 'Jugadores, staff, creadores y comunidad: cada uno aporta algo único y hace que Radiant Shadows sea lo que es.',
  },
  {
    id: 'grow',
    title: 'Crecer',
    text: 'No queremos solo armar equipos: queremos un lugar donde el talento tenga espacio y cada uno sienta orgullo de llevar estos colores.',
  },
]

/** Cierre, antes de "El fuego sigue" */
export const ABOUT_CLOSING =
  'Tenemos ambición, identidad y mucho por construir, y queremos hacerlo con quienes comparten esta pasión.'
