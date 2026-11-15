import type { CollectionKey } from '../shared/content/collections'
import { COUNTRIES } from '../shared/content/countries'
import { EVENT_TYPES } from '../shared/content/events'
import { NEWS_CATEGORIES } from '../shared/content/news'
import { RANKS } from '../shared/content/ranks'
import type { Item } from './lib/item'

export interface FieldDef {
  key: string
  label: string
  type: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'url' | 'image' | 'checkbox' | 'link'
  options?: { value: string; label: string }[]
  required?: boolean
  placeholder?: string
  help?: string
  step?: number
  /** imágenes de personas: ofrecer quitar el fondo al subir */
  cutout?: boolean
}

export interface CollectionSchema {
  key: CollectionKey
  /** nombre de la sección en el menú */
  label: string
  /** "una noticia", "un jugador"… para los botones */
  singular: string
  description: string
  fields: FieldDef[]
  title: (item: Item) => string
  subtitle: (item: Item) => string
  image?: (item: Item) => string | undefined
  /** elemento nuevo con valores por defecto */
  blank: () => Item
}

const opts = (values: string[]) => values.map((v) => ({ value: v, label: v }))
const str = (v: unknown) => (typeof v === 'string' ? v : v == null ? '' : String(v))
const join = (...parts: unknown[]) => parts.map(str).filter(Boolean).join(' · ')
/** fecha de hoy AAAA-MM-DD (hora local) */
const today = () => new Date().toLocaleDateString('sv')
/** en la lista del admin: avisa si la noticia ya cerró (no se ve en el sitio) o hasta cuándo sigue */
const closedLabel = (until: unknown) => (typeof until !== 'string' || !until ? '' : until < today() ? 'Cerrada: ya no se ve en el sitio' : `Hasta el ${until.split('-').reverse().join('/')}`)

const TEAMS = opts(['Masculino', 'Game Changers'])
const PLAYER_ROLES = opts(['Duelista', 'Iniciador', 'Controlador', 'Centinela', 'Flex'])
const nationality: FieldDef = { key: 'nationality', label: 'Nacionalidad', type: 'select', options: opts(COUNTRIES.map((c) => c.name)) }
const rank: FieldDef = { key: 'rank', label: 'Rango', type: 'select', options: opts([...RANKS].reverse()), help: 'Según su tracker' }
const age: FieldDef = { key: 'age', label: 'Edad', type: 'number' }
const photo: FieldDef = { key: 'photo', label: 'Foto', type: 'image', cutout: true, help: 'Se le quita el fondo automáticamente al subirla, para que quede como las demás' }
const tracker: FieldDef = { key: 'tracker', label: 'Tracker (tracker.gg)', type: 'url', placeholder: 'https://tracker.gg/valorant/profile/…' }
const photoScale: FieldDef = {
  key: 'photoScale',
  label: 'Escala de la foto',
  type: 'number',
  step: 0.01,
  placeholder: '1',
  help: 'Si en la fila se ve más grande que las demás, achicala: 0.9 = 10% más chica',
}

/** Jugadores y cuerpo técnico del roster masculino comparten forma */
const memberFields = (role: FieldDef): FieldDef[] => [
  { key: 'team', label: 'Equipo', type: 'select', required: true, options: TEAMS, help: 'Define en qué página aparece: Masculino o Game Changers' },
  { key: 'name', label: 'Nombre (nick)', type: 'text', required: true },
  { key: 'realName', label: 'Nombre y apellido', type: 'text', help: 'Opcional. Se usa en las placas de MVP del mediakit' },
  role,
  rank,
  nationality,
  age,
  photo,
  photoScale,
  tracker,
  { key: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://www.instagram.com/…', help: 'Opcional. El mediakit lo usa para arrobar en los copys' },
  { key: 'x', label: 'X (Twitter)', type: 'url', placeholder: 'https://x.com/…' },
]

/** Staff y creadores comparten forma */
const personFields: FieldDef[] = [
  { key: 'role', label: 'Cargo', type: 'text', required: true, placeholder: 'CEO, Community Manager…' },
  { key: 'nick', label: 'Apodo', type: 'text', required: true },
  { key: 'name', label: 'Nombre y apellido', type: 'text', required: true },
  age,
  photo,
  { key: 'instagram', label: 'Instagram', type: 'url', placeholder: 'https://www.instagram.com/…' },
  { key: 'x', label: 'X (Twitter)', type: 'url', placeholder: 'https://x.com/…' },
  { key: 'twitch', label: 'Twitch', type: 'url', placeholder: 'https://www.twitch.tv/…' },
]

export const SCHEMAS: CollectionSchema[] = [
  {
    key: 'news',
    label: 'Noticias',
    singular: 'una noticia',
    description: 'La primera de la lista sale destacada. Las que tienen fecha de cierre se quitan solas del sitio pasado ese día. Las de tryouts aparecen también en la home.',
    fields: [
      { key: 'category', label: 'Categoría', type: 'select', required: true, options: Object.entries(NEWS_CATEGORIES).map(([value, c]) => ({ value, label: c.label })) },
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'summary', label: 'Bajada', type: 'textarea', required: true },
      { key: 'date', label: 'Fecha a mostrar', type: 'text', placeholder: 'Noviembre 2026' },
      { key: 'image', label: 'Foto de la persona', type: 'image', cutout: true, help: 'Opcional. Si la noticia es de alguien, su foto: se arma la placa con su nombre grande. Sin foto se usa la imagen por defecto' },
      { key: 'person', label: 'Nombre en la placa', type: 'text', placeholder: 'Skull', help: 'Opcional. Si se deja vacío, se usa el nombre del jugador de la foto' },
      { key: 'showRoster', label: 'Usar la foto grupal del roster masculino actual', type: 'checkbox' },
      { key: 'until', label: 'Fecha de cierre', type: 'date', help: 'Opcional. Pasado ese día la noticia se quita sola del sitio' },
      { key: 'action.href', label: 'Botón: a dónde lleva', type: 'link', help: 'Elegí una sección del sitio, el formulario de contacto o un link externo (se abre en otra pestaña)' },
      { key: 'action.label', label: 'Botón: texto', type: 'text', placeholder: 'Ver más' },
    ],
    title: (i) => str(i.title),
    subtitle: (i) => join(NEWS_CATEGORIES[i.category as keyof typeof NEWS_CATEGORIES]?.label, i.date, closedLabel(i.until)),
    image: (i) => str(i.image) || undefined,
    blank: () => ({ id: Date.now().toString(36), category: 'competencia' }),
  },
  {
    key: 'events',
    label: 'Calendario',
    singular: 'un evento',
    description: 'Los partidos y torneos futuros aparecen en "Próximos partidos" y en la home con cuenta regresiva.',
    fields: [
      { key: 'date', label: 'Día', type: 'date', required: true },
      { key: 'time', label: 'Hora (Argentina)', type: 'time' },
      { key: 'title', label: 'Título', type: 'text', required: true, placeholder: 'Premier · Fecha 3' },
      { key: 'type', label: 'Tipo', type: 'select', required: true, options: Object.entries(EVENT_TYPES).map(([value, t]) => ({ value, label: t.label })) },
      { key: 'team', label: 'Equipo', type: 'select', options: TEAMS },
      { key: 'opponent', label: 'Rival', type: 'text', help: 'Si se completa, se muestra "RS vs Rival"' },
      { key: 'description', label: 'Descripción', type: 'textarea' },
      { key: 'link', label: 'Link (stream, bracket…)', type: 'url' },
    ],
    title: (i) => (i.opponent ? `RS vs ${str(i.opponent)}` : str(i.title)),
    subtitle: (i) => join(i.date, i.time && `${str(i.time)} hs`, EVENT_TYPES[i.type as keyof typeof EVENT_TYPES]?.label, i.team),
    blank: () => ({ type: 'partido' }),
  },
  {
    key: 'achievements',
    label: 'Logros',
    singular: 'un logro',
    description: 'El puesto define el color: 1° oro, 2° plata, 3° bronce. En la home se muestran los dos mejores.',
    fields: [
      { key: 'place', label: 'Puesto', type: 'number', required: true },
      { key: 'result', label: 'Resultado', type: 'text', required: true, placeholder: 'Campeones, Subcampeones, 4to puesto…' },
      { key: 'tournament', label: 'Torneo', type: 'text', required: true },
      { key: 'organizer', label: 'Organizador', type: 'text' },
      { key: 'team', label: 'Equipo', type: 'select', required: true, options: TEAMS },
      { key: 'when', label: 'Cuándo', type: 'text', placeholder: 'Octubre 2026' },
    ],
    title: (i) => `${str(i.place)}° · ${str(i.tournament)}`,
    subtitle: (i) => join(i.result, i.team, i.organizer),
    blank: () => ({ team: 'Masculino' }),
  },
  {
    key: 'players',
    label: 'Jugadores',
    singular: 'un jugador',
    description: 'Jugadores de los dos equipos (Masculino y Game Changers), en el orden en que aparecen en la fila de cada uno.',
    fields: memberFields({ key: 'role', label: 'Rol', type: 'select', required: true, options: PLAYER_ROLES }),
    title: (i) => str(i.name),
    subtitle: (i) => join(i.team || 'Masculino', i.role, i.rank, i.age && `${str(i.age)} años`),
    image: (i) => str(i.photo) || undefined,
    blank: () => ({ team: 'Masculino' }),
  },
  {
    key: 'coaches',
    label: 'Cuerpo técnico',
    singular: 'un integrante',
    description: 'Coaches y assistant coaches de cada equipo (aparecen debajo de sus jugadores).',
    fields: memberFields({ key: 'role', label: 'Puesto', type: 'text', required: true, placeholder: 'Coach, Assistant coach…' }),
    title: (i) => str(i.name),
    subtitle: (i) => join(i.team || 'Masculino', i.role, i.rank, i.age && `${str(i.age)} años`),
    image: (i) => str(i.photo) || undefined,
    blank: () => ({ team: 'Masculino' }),
  },
  {
    key: 'staff',
    label: 'Staff',
    singular: 'una persona',
    description: 'Staff de la organización, en el orden en que se muestra.',
    fields: personFields,
    title: (i) => str(i.nick),
    subtitle: (i) => join(i.role, i.name),
    image: (i) => str(i.photo) || undefined,
    blank: () => ({}),
  },
  {
    key: 'creators',
    label: 'Creadores',
    singular: 'un creador',
    description: 'Creadores de contenido de la organización.',
    fields: personFields,
    title: (i) => str(i.nick),
    subtitle: (i) => join(i.role, i.name),
    image: (i) => str(i.photo) || undefined,
    blank: () => ({ role: 'Creadora de contenido' }),
  },
]
