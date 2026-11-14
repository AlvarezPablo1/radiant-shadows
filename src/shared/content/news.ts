export type NewsCategory = 'competencia' | 'logro' | 'tryouts' | 'jugadores' | 'despedida' | 'incorporacion'

export interface NewsItem {
  id: string
  category: NewsCategory
  title: string
  /** bajada corta debajo del título */
  summary: string
  /** fecha para mostrar, p. ej. "Noviembre 2026" (opcional) */
  date?: string
  /** último día en que sigue vigente (AAAA-MM-DD): después deja de mostrarse en la home */
  until?: string
  /** foto recortada; si falta se usa el fondo del color de la categoría */
  image?: string
  /** nombre grande en la placa cuando la imagen es de una persona (si falta, se toma del jugador de la foto) */
  person?: string
  /** mostrar como imagen la foto grupal del roster masculino actual (en lugar de `image`) */
  showRoster?: boolean
  /** botón: texto y destino (una sección como "/logros", un link externo, o "contacto" para abrir el formulario) */
  action?: { label?: string; href: string }
}

export const NEWS_CATEGORIES: Record<NewsCategory, { label: string; color: string }> = {
  competencia: { label: 'Competencia', color: '#8e44ff' },
  logro: { label: 'Logro', color: '#ffd27a' },
  tryouts: { label: 'Tryouts', color: '#ff6fb5' },
  jugadores: { label: 'Jugadores', color: '#3dd6c6' },
  despedida: { label: 'Despedida', color: '#c79bff' },
  incorporacion: { label: 'Incorporación', color: '#7ee2a8' },
}

/** Noticias, de la más nueva a la más vieja: la primera se muestra destacada */
export const NEWS: NewsItem[] = [
  {
    id: 'skull-assistant-coach',
    category: 'incorporacion',
    title: 'Se suma como nuestro nuevo assistant coach: Skull',
    summary: '¡Bienvenido al cuerpo técnico del roster masculino!',
    image: '/brand/players/skull.webp',
    action: { label: 'Ver equipo', href: '/equipo/masculino' },
  },
  {
    id: 'tryouts-masculino',
    category: 'tryouts',
    title: 'Abrimos tryouts para el roster masculino',
    summary: '¿Querés competir con los dragones? Anotate en el formulario: la inscripción cierra el 5 de diciembre.',
    until: '2026-12-05',
    showRoster: true,
    action: { label: 'Anotarme', href: 'https://docs.google.com/forms/d/e/1FAIpQLSc20k3rxQAPz-ZAH98pqGfIzGil9HjlLDfc4M-AIq5Vc5jRNg/viewform' },
  },
  {
    id: 'vct-americas-oq',
    category: 'competencia',
    title: 'Participamos en VCT Americas: OQ1 y OQ2',
    summary: 'Fuimos parte de las Open Qualifiers 1 y 2 del circuito VCT Americas.',
    action: { label: 'Ver calendario', href: '/calendario' },
  },
  {
    id: 'splotza-oq1',
    category: 'jugadores',
    title: 'Splotza, tercera mejor performance de la primera fase de OQ1',
    summary: 'Nuestro controlador terminó entre los tres mejores rendimientos de la primera fase.',
    image: '/brand/players/splotza.webp',
    action: { label: 'Ver roster', href: '/equipo/masculino' },
  },
  {
    id: 'subcampeones-all-in-series',
    category: 'logro',
    title: 'Subcampeones del All In Series de Moonfly',
    summary: 'El roster masculino llegó a la final y se quedó con el segundo puesto.',
    action: { label: 'Ver logros', href: '/logros' },
  },
  {
    id: 'despedida-gabzera',
    category: 'despedida',
    title: 'Despedimos a nuestro gran jugador: Gabzera',
    summary: 'Gracias por todo lo que diste con estos colores. ¡Éxitos en lo que viene!',
    image: '/brand/players/gabzera.webp',
  },
  {
    id: 'despedida-kisa',
    category: 'despedida',
    title: 'Despedimos a nuestra gran jugadora: Kisa',
    summary: 'Gracias por todo lo que diste con estos colores. ¡Éxitos en lo que viene!',
  },
  {
    id: 'despedida-santi',
    category: 'despedida',
    title: 'Despedimos a nuestro assistant coach: Santi',
    summary: 'Gracias por todo lo que aportaste al equipo. ¡Éxitos en lo que viene!',
  },
]
