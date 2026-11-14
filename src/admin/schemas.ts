import type { CollectionKey } from '../home/data/collections'
import { COUNTRIES } from '../home/data/countries'
import { EVENT_TYPES } from '../home/data/events'
import { NEWS_CATEGORIES } from '../home/data/news'
import { RANKS } from '../home/data/ranks'
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
  { key: 'name', label: 'Nombre (nick)', type: 'text', required: true },
  role,
  rank,
  nationality,
  age,
  photo,
  photoScale,
  tracker,
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
    description: 'La primera de la lista sale destacada. Las de tryouts aparecen también en la home mientras estén vigentes.',
    fields: [
      { key: 'category', label: 'Categoría', type: 'select', required: true, options: Object.entries(NEWS_CATEGORIES).map(([value, c]) => ({ value, label: c.label })) },
      { key: 'title', label: 'Título', type: 'text', required: true },
      { key: 'summary', label: 'Bajada', type: 'textarea', required: true },
      { key: 'date', label: 'Fecha a mostrar', type: 'text', placeholder: 'Noviembre 2026' },
      { key: 'image', label: 'Imagen', type: 'image', help: 'Opcional. Sin imagen se muestra el logo sobre el color de la categoría' },
      { key: 'showRoster', label: 'Usar la foto grupal del roster masculino actual', type: 'checkbox' },
      { key: 'until', label: 'Vigente hasta', type: 'date', help: 'Opcional. Después de esa fecha deja de mostrarse en la home' },
      { key: 'action.href', label: 'Botón: a dónde lleva', type: 'link', help: 'Elegí una sección del sitio, el formulario de contacto o un link externo (se abre en otra pestaña)' },
      { key: 'action.label', label: 'Botón: texto', type: 'text', placeholder: 'Ver más' },
    ],
    title: (i) => str(i.title),
    subtitle: (i) => join(NEWS_CATEGORIES[i.category as keyof typeof NEWS_CATEGORIES]?.label, i.date),
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
    description: 'Roster masculino, en el orden en que aparecen en la fila.',
    fields: memberFields({ key: 'role', label: 'Rol', type: 'select', required: true, options: PLAYER_ROLES }),
    title: (i) => str(i.name),
    subtitle: (i) => join(i.role, i.rank, i.nationality, i.age && `${str(i.age)} años`),
    image: (i) => str(i.photo) || undefined,
    blank: () => ({}),
  },
  {
    key: 'coaches',
    label: 'Cuerpo técnico',
    singular: 'un integrante',
    description: 'Coach y assistant coach del roster masculino (debajo de los jugadores).',
    fields: memberFields({ key: 'role', label: 'Puesto', type: 'text', required: true, placeholder: 'Coach, Assistant coach…' }),
    title: (i) => str(i.name),
    subtitle: (i) => join(i.role, i.rank, i.age && `${str(i.age)} años`),
    image: (i) => str(i.photo) || undefined,
    blank: () => ({}),
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
