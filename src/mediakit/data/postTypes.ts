import { AGENTS, agentImage, findAgent } from './agents'
import { LOGOS, mascot } from '../brand'
import type { PostDoc, Roster, Person, Visual } from '../types'
import { allPeople, handle } from './roster'
import { keyArt, keycapsArt } from '../lib/art'

export interface FieldDef {
  key: string
  label: string
  kind: 'text' | 'textarea' | 'number' | 'date' | 'time' | 'select' | 'image' | 'toggle'
  placeholder?: string
  options?: { value: string; label: string }[]
  hint?: string
  /** texto fijo delante del campo (p. ej. "twitch.tv/"): sólo se escribe lo que sigue */
  prefix?: string
}

export type HeroKind = 'person' | 'people' | 'auto'

export interface PostType {
  id: string
  label: string
  group: 'Competitivo' | 'Roster' | 'Comunidad'
  fields: FieldDef[]
  /** quién aparece: una persona elegida, el roster entero o según el modo visual */
  people: 'one' | 'many' | 'none'
  defaultVisual: Visual
  /** emoción de la mascota por defecto (el personaje sale del equipo: dragón en MAIN, dragona en GC) */
  defaultMascot: string
  bgPreset: (d: PostDoc) => string
  /** ¿se puede publicar en Feed IG? */
  feed: (d: PostDoc) => boolean
  /** ¿se puede publicar en Historia IG? (por defecto sí) */
  story?: (d: PostDoc) => boolean
  checklist: string[]
}

const year = () => String(new Date().getFullYear())
/** fecha de hoy (YYYY-MM-DD, hora local) */
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** "twitch.tv/canal" a partir de lo escrito (el canal solo, o la dirección completa si la pegaron) */
export const twitchUrl = (v = '') => 'twitch.tv/' + v.trim().replace(/^(https?:\/\/)?(www\.)?twitch\.tv\//i, '').replace(/^@/, '')
const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
const dayName = (s?: string) => (s ? DAYS[new Date(s + 'T12:00').getDay()] : '')
const at = (p?: Person) => (p ? handle(p.ig) : '')
const fmtDate = (s?: string) => {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return y && m && d ? `${d}/${m}` : s
}

/** palabras para el titular del día de partido (en vez de "Matchday"); la primera es la que va por defecto */
export const MATCH_WORDS = ['DÍA DE BATALLA', 'MATCHDAY', 'GAMEDAY', 'A JUGAR', 'HOY JUGAMOS', 'EN BATALLA', 'SALEN LOS DRAGONES', 'LLEGÓ EL DÍA']

export const POST_TYPES: PostType[] = [
  {
    id: 'matchday',
    label: 'Día de partido',
    group: 'Competitivo',
    people: 'many',
    defaultVisual: 'players',
    defaultMascot: 'victoria',
    fields: [
      { key: 'word', label: 'Titular', kind: 'select', options: MATCH_WORDS.map((w) => ({ value: w, label: w })) },
      { key: 'tournament', label: 'Torneo', kind: 'text', placeholder: 'Ej: Liga Dragones Split 2' },
      { key: 'phase', label: 'Fase / instancia', kind: 'text', placeholder: 'Ej: Fecha 3 · Bo3' },
      { key: 'rival', label: 'Rival', kind: 'text', placeholder: 'Nombre del equipo rival' },
      { key: 'rivalLogo', label: 'Logo rival (opcional)', kind: 'image' },
      { key: 'date', label: 'Fecha', kind: 'date' },
      { key: 'time', label: 'Hora', kind: 'time' },
      { key: 'where', label: 'Canal de Twitch (opcional)', kind: 'text', prefix: 'twitch.tv/', placeholder: 'radiant_shadowss' },
    ],
    bgPreset: () => 'competitivo',
    feed: () => false,
    checklist: ['Revisar rival', 'Revisar horario', 'Revisar torneo', 'Revisar nombres', 'Revisar @ de jugadores', 'Verificar que no falte ningún integrante relevante', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'resultado',
    label: 'Resultado de partido',
    group: 'Competitivo',
    people: 'many',
    defaultVisual: 'players',
    defaultMascot: 'victoria',
    fields: [
      {
        key: 'outcome',
        label: 'Resultado',
        kind: 'select',
        options: [
          { value: 'win', label: 'Victoria' },
          { value: 'loss', label: 'Derrota' },
          { value: 'draw', label: 'Empate' },
        ],
      },
      { key: 'scoreUs', label: 'Nuestro marcador', kind: 'number', placeholder: '13' },
      { key: 'scoreThem', label: 'Marcador rival', kind: 'number', placeholder: '9' },
      { key: 'rival', label: 'Rival', kind: 'text' },
      { key: 'rivalLogo', label: 'Logo rival (opcional)', kind: 'image' },
      { key: 'tournament', label: 'Torneo', kind: 'text' },
      { key: 'map', label: 'Mapa(s)', kind: 'text', placeholder: 'Ascent · Lotus' },
    ],
    bgPreset: (d) => (outcome(d) === 'loss' ? 'derrota' : outcome(d) === 'draw' ? 'competitivo' : 'victoria'),
    feed: () => false,
    checklist: ['Revisar rival', 'Revisar torneo', 'Revisar resultado', 'Revisar nombres', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'torneo',
    label: 'Posición final de torneo',
    group: 'Competitivo',
    people: 'many',
    defaultVisual: 'players',
    defaultMascot: 'confiado',
    fields: [
      {
        key: 'place',
        label: 'Puesto',
        kind: 'select',
        options: [
          { value: '1', label: '1° · Campeones' },
          { value: '2', label: '2° · Subcampeones' },
          { value: '3', label: '3° puesto' },
          { value: '4', label: '4° puesto' },
          { value: '5', label: 'Top 8 / 5° o menos' },
          { value: '6', label: 'Participación' },
        ],
      },
      { key: 'tournament', label: 'Torneo', kind: 'text' },
      { key: 'prize', label: 'Dato extra (opcional)', kind: 'text', placeholder: 'Ej: Invictos en la fase de grupos' },
    ],
    bgPreset: (d) => (Number(d.fields.place || 1) <= 2 ? 'celebracion' : 'competitivo'),
    feed: (d) => Number(d.fields.place || 1) <= 3,
    checklist: ['Revisar torneo', 'Revisar nombres', 'Revisar @ de jugadores', 'Verificar que no falte ningún integrante relevante', 'Foto/material aprobado', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'bienvenida',
    label: 'Bienvenida',
    group: 'Roster',
    people: 'one',
    defaultVisual: 'players',
    defaultMascot: 'senalando',
    fields: [
      { key: 'joinDate', label: 'Fecha de incorporación', kind: 'date' },
      { key: 'phrase', label: 'Frase (opcional)', kind: 'text', placeholder: 'Ej: Un dragón más en la familia' },
    ],
    bgPreset: () => 'competitivo',
    feed: () => true,
    story: () => false,
    checklist: ['Nombre correcto', 'Rol correcto', '@ correcto', 'Foto/material aprobado', 'Fecha de incorporación confirmada', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'despedida',
    label: 'Despedida',
    group: 'Roster',
    people: 'one',
    defaultVisual: 'players',
    defaultMascot: 'silencio',
    fields: [{ key: 'phrase', label: 'Frase (opcional)', kind: 'text', placeholder: 'Ej: Gracias por cada ronda' }],
    bgPreset: () => 'derrota',
    feed: () => true,
    story: () => false,
    checklist: ['Nombre correcto', 'Rol correcto', '@ correcto', 'Foto/material aprobado', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'cumple',
    label: 'Cumpleaños',
    group: 'Roster',
    people: 'one',
    defaultVisual: 'players',
    defaultMascot: 'picaro',
    fields: [{ key: 'phrase', label: 'Frase (opcional)', kind: 'text', placeholder: 'Que este año arda más que nunca' }],
    bgPreset: () => 'celebracion',
    feed: () => true,
    checklist: ['Nombre correcto', '@ correcto', 'Foto/material aprobado', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'tryouts',
    label: 'Tryouts / Buscamos',
    group: 'Roster',
    people: 'none',
    defaultVisual: 'mascots',
    defaultMascot: 'senalando',
    fields: [
      { key: 'title', label: 'Titular', kind: 'text', placeholder: 'TRYOUTS' },
      { key: 'roles', label: 'Qué buscamos (uno por línea)', kind: 'textarea', placeholder: 'Duelista\nControlador\nCoach' },
      { key: 'reqs', label: 'Requisitos', kind: 'text', placeholder: 'Ascendente+ · +16 · Disponibilidad nocturna' },
      { key: 'deadline', label: 'Fecha límite', kind: 'date' },
      { key: 'cta', label: 'Llamado a la acción', kind: 'text', placeholder: 'Escribinos por DM' },
    ],
    bgPreset: () => 'escamas',
    feed: () => true,
    checklist: ['Revisar roles buscados', 'Revisar horario', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'roster',
    label: 'Roster oficial',
    group: 'Roster',
    people: 'many',
    defaultVisual: 'players',
    defaultMascot: 'victoria',
    fields: [{ key: 'season', label: 'Temporada / torneo', kind: 'text', placeholder: `Temporada ${new Date().getFullYear()}` }],
    bgPreset: () => 'competitivo',
    feed: () => true,
    checklist: ['Nombre correcto', 'Rol correcto', '@ correcto', 'Foto/material aprobado', 'Verificar que no falte ningún integrante relevante', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'comunicado',
    label: 'Comunicado',
    group: 'Comunidad',
    people: 'none',
    defaultVisual: 'none',
    defaultMascot: 'senalando',
    fields: [
      { key: 'title', label: 'Titular', kind: 'text', placeholder: 'COMUNICADO OFICIAL' },
      { key: 'body', label: 'Texto', kind: 'textarea', placeholder: 'Escribí el comunicado…' },
    ],
    bgPreset: () => 'institucional',
    // los comunicados van al Feed y a X, no a historias
    feed: () => true,
    story: () => false,
    checklist: ['Revisar nombres', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'comunidad',
    label: 'Comunidad / Educativo',
    group: 'Comunidad',
    people: 'none',
    defaultVisual: 'mascots',
    defaultMascot: 'pensando',
    fields: [
      { key: 'kicker', label: 'Etiqueta', kind: 'text', placeholder: 'Tip del día' },
      { key: 'title', label: 'Titular', kind: 'text', placeholder: 'CROSSHAIR PLACEMENT' },
      { key: 'body', label: 'Texto', kind: 'textarea', placeholder: 'Mantené la mira a la altura de la cabeza…' },
    ],
    bgPreset: () => 'nocturno',
    feed: () => false,
    checklist: ['Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'stream',
    label: 'Stream ON',
    group: 'Comunidad',
    people: 'none',
    defaultVisual: 'none',
    defaultMascot: 'senalando',
    fields: [
      { key: 'title', label: 'Titular', kind: 'text', placeholder: 'STREAM ON' },
      { key: 'channel', label: 'Canal de Twitch', kind: 'text', prefix: 'twitch.tv/', placeholder: 'radiant_shadowss' },
      { key: 'time', label: 'Hora', kind: 'time' },
    ],
    bgPreset: () => 'humo',
    feed: () => false,
    checklist: ['Revisar horario', 'Copy revisado', 'Revisar etiquetas'],
  },
  {
    id: 'mvp',
    label: 'MVP',
    group: 'Roster',
    people: 'one',
    defaultVisual: 'players',
    defaultMascot: 'victoria',
    fields: [
      { key: 'mvpScope', label: 'Encabezado', kind: 'select', options: [
        { value: 'partido', label: 'MVP del partido' },
        { value: 'torneo', label: 'MVP del torneo' },
        { value: 'semana', label: 'MVP de la semana' },
      ] },
      { key: 'kills', label: 'Kills', kind: 'number', placeholder: '24' },
      { key: 'deaths', label: 'Deaths', kind: 'number', placeholder: '12' },
      { key: 'assists', label: 'Assists', kind: 'number', placeholder: '6' },
      { key: 'acs', label: 'ACS', kind: 'number', placeholder: '312' },
      { key: 'hs', label: 'HS %', kind: 'number', placeholder: '31' },
      { key: 'agent', label: 'Agente', kind: 'select', hint: 'Su retrato aparece difuminado detrás del jugador', options: [{ value: '', label: '— Elegí el agente —' }, ...AGENTS.map((a) => ({ value: a.name, label: `${a.name} · ${a.role}` }))] },
      { key: 'rival', label: 'Rival (para el copy)', kind: 'text' },
      { key: 'tournament', label: 'Torneo (para el copy)', kind: 'text' },
    ],
    bgPreset: () => 'sobrio',
    feed: () => false,
    checklist: ['Nombre correcto', '@ correcto', 'Revisar estadísticas', 'Foto/material aprobado', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
  {
    id: 'competencia',
    label: 'Anuncio de torneo',
    group: 'Competitivo',
    people: 'many',
    defaultVisual: 'players',
    defaultMascot: 'victoria',
    fields: [
      { key: 'tournament', label: 'Torneo', kind: 'text', placeholder: 'Ej: Liga Dragones Split 2' },
      { key: 'tournamentLogo', label: 'Logo del torneo (opcional)', kind: 'image' },
      { key: 'date', label: 'Arranca el', kind: 'date' },
      { key: 'format', label: 'Formato', kind: 'text', placeholder: 'Ej: Fase de grupos + playoffs Bo3' },
    ],
    bgPreset: () => 'competitivo',
    feed: () => false,
    checklist: ['Revisar torneo', 'Revisar horario', 'Revisar nombres', 'Copy revisado', 'Revisar ortografía', 'Revisar etiquetas'],
  },
]

/* ---------- menú "¿Qué querés publicar?" ---------- */

export interface SubOption {
  label: string
  type: string
  /** valores que fija al elegirlo */
  fields?: Record<string, string>
  /** para saber si está activo */
  match?: (d: PostDoc) => boolean
}
export interface Category {
  id: string
  label: string
  options: SubOption[]
}

export const CATEGORIES: Category[] = [
  { id: 'matchday', label: 'Día de partido', options: [{ label: 'Día de partido', type: 'matchday' }] },
  { id: 'victoria', label: 'Victoria', options: [{ label: 'Victoria', type: 'resultado', fields: { outcome: 'win' }, match: (d) => outcome(d) === 'win' }] },
  { id: 'derrota', label: 'Derrota', options: [{ label: 'Derrota', type: 'resultado', fields: { outcome: 'loss' }, match: (d) => outcome(d) === 'loss' }] },
  { id: 'empate', label: 'Empate', options: [{ label: 'Empate', type: 'resultado', fields: { outcome: 'draw' }, match: (d) => outcome(d) === 'draw' }] },
  {
    id: 'participacion',
    label: 'Participación',
    options: [
      { label: 'Participación', type: 'torneo', fields: { place: '6' }, match: (d) => d.fields.place === '6' },
      { label: '4° puesto', type: 'torneo', fields: { place: '4' }, match: (d) => d.fields.place === '4' },
      { label: 'Top 8', type: 'torneo', fields: { place: '5' }, match: (d) => d.fields.place === '5' },
    ],
  },
  {
    id: 'podio',
    label: 'Podio',
    options: [
      { label: 'Campeones', type: 'torneo', fields: { place: '1' }, match: (d) => (d.fields.place || '1') === '1' },
      { label: 'Subcampeones', type: 'torneo', fields: { place: '2' }, match: (d) => d.fields.place === '2' },
      { label: '3° puesto', type: 'torneo', fields: { place: '3' }, match: (d) => d.fields.place === '3' },
    ],
  },
  {
    id: 'jugadores',
    label: 'Jugadores',
    options: [
      { label: 'MVP', type: 'mvp' },
      { label: 'Bienvenida', type: 'bienvenida' },
      { label: 'Despedida', type: 'despedida' },
      { label: 'Cumpleaños', type: 'cumple' },
      { label: 'Roster oficial', type: 'roster' },
    ],
  },
  {
    id: 'comunidad',
    label: 'Comunidad',
    options: [
      { label: 'Comunicado', type: 'comunicado' },
      { label: 'Educativo', type: 'comunidad' },
      { label: 'Stream ON', type: 'stream' },
    ],
  },
]

export function categoryOf(d: PostDoc): Category {
  return CATEGORIES.find((c) => c.options.some((o) => o.type === d.type && (!o.match || o.match(d)))) ?? CATEGORIES.find((c) => c.options.some((o) => o.type === d.type)) ?? CATEGORIES[0]
}

export const postType = (id: string) => POST_TYPES.find((t) => t.id === id) ?? POST_TYPES[0]

/** resultado del partido: lo elige el usuario (Victoria/Derrota/Empate) o se deduce del marcador */
export function outcome(d: PostDoc): 'win' | 'loss' | 'draw' | undefined {
  if (d.type !== 'resultado') return undefined
  const o = d.fields.outcome
  if (o === 'win' || o === 'loss' || o === 'draw') return o
  const a = Number(d.fields.scoreUs),
    b = Number(d.fields.scoreThem)
  if (!d.fields.scoreUs || isNaN(a) || isNaN(b)) return undefined
  return a > b ? 'win' : a < b ? 'loss' : 'draw'
}

export function isWin(d: PostDoc): boolean | undefined {
  if (d.type === 'torneo') return Number(d.fields.place || 1) <= 3
  const o = outcome(d)
  return o === 'win' ? true : o === 'loss' ? false : undefined
}

export function selectedPeople(d: PostDoc, r: Roster): Person[] {
  const all = allPeople(r)
  const t = postType(d.type)
  if (t.people === 'one') {
    const p = all.find((x) => x.id === d.people[0]) ?? r.players[0]
    return p ? [p] : []
  }
  // los elegidos a mano (si alguno ya no está en el roster, se ignora; si no queda ninguno, van los titulares)
  const chosen = d.people.map((id) => all.find((x) => x.id === id)).filter(Boolean) as Person[]
  return captainInCenter(chosen.length ? chosen : r.players.filter((x) => x.active))
}

/** el capitán va siempre en el lugar del centro de la fila (con un número par, el de la derecha del medio) */
function captainInCenter(list: Person[]): Person[] {
  const i = list.findIndex((p) => p.captain)
  if (i < 0) return list
  const rest = list.filter((_, j) => j !== i)
  const c = Math.floor(list.length / 2)
  return [...rest.slice(0, c), list[i], ...rest.slice(c)]
}

const PLACE = ['', 'CAMPEONES', 'SUBCAMPEONES', '3° PUESTO', '4° PUESTO', 'TOP 8', 'PARTICIPACIÓN']

/** Todos los valores "enlazables" de la publicación: los derivados + lo que el usuario sobreescribió. */
export function computeValues(d: PostDoc, r: Roster): Record<string, string> {
  const people = selectedPeople(d, r)
  const p0 = people[0]
  // las fechas vacías son siempre la de hoy
  const f: Record<string, string> = { ...d.fields, date: d.fields.date || todayISO(), joinDate: d.fields.joinDate || todayISO() }
  const v: Record<string, string> = {
    year: year(),
    signature: `RADIANT SHADOWS • ${year()}`,
    team: r.id === 'gc' ? 'RADIANT SHADOWS GC' : 'RADIANT SHADOWS',
    hashtag: r.id === 'gc' ? '#SomosDRAGONAS' : '#SomosDRAGONES',
    rival: f.rival || 'RIVAL',
    rivalName: f.rivalLogo ? '' : (f.rival || 'RIVAL').toUpperCase(),
    tournament: f.tournament || 'TORNEO',
    name: p0?.name || 'NOMBRE',
    role: p0?.role || '',
    at: handle(p0?.ig || ''),
  }
  switch (d.type) {
    case 'matchday':
      Object.assign(v, {
        kicker: /HOY|DÍA/.test(f.word || MATCH_WORDS[0]) ? 'Se viene' : 'Hoy se juega',
        title: f.word || MATCH_WORDS[0],
        info: [fmtDate(f.date), f.time && f.time + ' HS'].filter(Boolean).join('  •  ') || 'FECHA  •  HORA',
        sub: [f.tournament || 'TORNEO', f.phase].filter(Boolean).join('  •  '),
        foot: f.where ? 'EN VIVO EN ' + twitchUrl(f.where).toUpperCase() : '',
      })
      break
    case 'resultado': {
      const o = outcome(d)
      Object.assign(v, {
        kicker: o === 'loss' ? 'Seguimos de pie' : o === 'draw' ? 'Punto a punto' : 'El fuego sigue',
        title: o === 'loss' ? 'DERROTA' : o === 'win' ? 'VICTORIA' : o === 'draw' ? 'EMPATE' : 'RESULTADO',
        score: `${f.scoreUs || '0'}  -  ${f.scoreThem || '0'}`,
        sub: [f.tournament || 'TORNEO', f.map].filter(Boolean).join('  •  '),
        info: '',
      })
      break
    }
    case 'torneo': {
      const n = Math.min(6, Math.max(1, Number(f.place || 1)))
      Object.assign(v, {
        kicker: n === 1 ? 'Somos' : n <= 3 ? 'Orgullosos' : n === 6 ? 'Somos parte' : 'Terminamos',
        // en participación el titular es el torneo (no se repite abajo)
        title: n === 6 ? (f.tournament || 'TORNEO').toUpperCase() : PLACE[n],
        sub: n === 6 ? '' : f.tournament || 'TORNEO',
        info: f.prize || '',
      })
      break
    }
    case 'bienvenida':
      Object.assign(v, { kicker: 'Bienvenido', title: (p0?.name || 'NOMBRE').toUpperCase(), sub: [(p0?.role || 'ROL').toUpperCase(), f.joinDate && 'DESDE EL ' + fmtDate(f.joinDate)].filter(Boolean).join('  •  '), info: f.phrase || 'Un dragón más en la familia' })
      break
    case 'despedida':
      Object.assign(v, { kicker: 'Gracias', title: (p0?.name || 'NOMBRE').toUpperCase(), sub: (p0?.role || '').toUpperCase(), info: f.phrase || 'Por cada ronda jugada con nuestros colores' })
      break
    case 'cumple':
      Object.assign(v, { kicker: 'FELIZ', title: 'CUMPLEAÑOS', sub: (p0?.name || 'NOMBRE').toUpperCase(), info: f.phrase || '' })
      break
    case 'tryouts':
      Object.assign(v, {
        kicker: 'Buscamos',
        title: (f.title || 'TRYOUTS').toUpperCase(),
        list: (f.roles || 'Duelista\nControlador').split('\n').filter(Boolean).map((x) => '•  ' + x.toUpperCase()).join('\n'),
        sub: f.reqs || 'Requisitos',
        info: [f.cta || 'Escribinos por DM', f.deadline && 'Hasta el ' + fmtDate(f.deadline)].filter(Boolean).join('  •  '),
      })
      break
    case 'roster':
      Object.assign(v, {
        kicker: f.season || `Temporada ${year()}`,
        title: 'ROSTER OFICIAL',
        list: people.map((p) => p.name.toUpperCase()).join('   ·   '),
        sub: r.staff.filter((s) => s.name).map((s) => `${s.role} ${s.name.toUpperCase()}`).join('   ·   '),
      })
      break
    case 'comunicado':
      Object.assign(v, { kicker: 'Radiant Shadows', title: (f.title || 'COMUNICADO OFICIAL').toUpperCase(), body: f.body || 'Texto del comunicado.' })
      break
    case 'comunidad':
      Object.assign(v, { kicker: f.kicker || 'Tip del día', title: (f.title || 'TITULAR').toUpperCase(), body: f.body || 'Texto breve y claro.' })
      break
    case 'stream':
      Object.assign(v, { kicker: 'En vivo', title: (f.title || 'STREAM ON').toUpperCase(), sub: twitchUrl(f.channel || 'radiant_shadowss'), info: f.time ? f.time + ' HS' : '' })
      break
    case 'mvp': {
      const scope = f.mvpScope || 'partido'
      Object.assign(v, {
        kicker: 'MVP',
        title: 'MVP',
        sub: (p0?.name || 'NICKNAME').toUpperCase(),
        info: p0?.realName || '',
        mvpHeader: `MVP ${scope === 'torneo' ? 'DEL TORNEO' : scope === 'semana' ? 'DE LA SEMANA' : 'DEL PARTIDO'}`,
        mvpScript: scope === 'torneo' ? 'del torneo' : scope === 'semana' ? 'de la semana' : 'del partido',
        mvpTop: `VALORANT · ${year()}`,
        kdaLabel: 'K / D / A',
        kda: `${f.kills || '0'} / ${f.deaths || '0'} / ${f.assists || '0'}`,
        acsLabel: 'ACS',
        acs: f.acs || '0',
        hsLabel: 'HS%',
        hs: (f.hs || '0') + '%',
        agentLabel: 'AGENTE',
        agent: (findAgent(f.agent)?.name || f.agent || 'AGENTE').toUpperCase(),
      })
      break
    }
    case 'competencia':
      Object.assign(v, {
        kicker: 'Nueva competencia',
        title: (f.tournament || 'TORNEO').toUpperCase(),
        sub: f.format || '',
        info: 'Arranca el ' + fmtDate(f.date),
      })
      break
  }
  // valores del diseño Neón
  const title = v.title || ''
  const words = title.split(/\s+/).filter(Boolean)
  let n1 = '',
    n2 = ''
  if (d.type === 'resultado') [n1, n2] = [title, v.score.replace(/\s+/g, ' ')]
  else if (words.length >= 2) [n1, n2] = [words[0], words.slice(1).join(' ')]
  else [n1, n2] = [(v.kicker || '').toUpperCase(), title]
  Object.assign(v, {
    neon1: n1,
    neon2: n2,
    neonTitle: d.type === 'matchday' || d.type === 'resultado' ? title : [n1, n2].filter(Boolean).join(' '),
    panelHeader: title,
    panelTitle: title,
    panelDate: [dayName(f.date), fmtDate(f.date).replace('/', '.'), f.time && f.time + ' ART'].filter(Boolean).join(' · '),
    panelDay: [dayName(f.date), fmtDate(f.date).replace('/', '.')].filter(Boolean).join(' '),
    panelRight: (d.type === 'matchday' ? [f.phase, f.tournament].filter(Boolean).join(' · ') || 'TORNEO' : v.sub || v.team).toUpperCase(),
    script: d.type === 'matchday' ? 'hoy' : d.type === 'resultado' && outcome(d) === 'win' ? 'ganamos' : '',
    patternRow: Array(3).fill(title).join(' · ') + ' ·',
    bigData: d.type === 'matchday' ? f.time || '--:--' : d.type === 'resultado' ? `${f.scoreUs || '0'}-${f.scoreThem || '0'}` : '',
    bigUnit: d.type === 'matchday' ? 'ART' : '',
    script2: d.type === 'matchday' ? 'a jugar' : d.type === 'resultado' && outcome(d) === 'win' ? 'ganamos' : d.type === 'torneo' && Number(f.place || 1) === 1 ? 'campeones' : '',
    rivalUpper: (f.rival || 'EQUIPO RIVAL').toUpperCase(),
    sideline: `${v.team} · VALORANT · TEMPORADA ${year()}`,
    neonLeft: (d.type === 'torneo' && !v.sub ? '' : d.type === 'cumple' ? v.sub : d.type === 'bienvenida' || d.type === 'despedida' ? v.sub : v.sub || v.team).toUpperCase(),
    neonRight: (d.type === 'matchday'
      ? [dayName(f.date), fmtDate(f.date).replace('/', '.'), f.time && f.time + ' ART'].filter(Boolean).join(' · ') || 'FECHA · HORA'
      : d.type === 'resultado'
        ? f.tournament || 'TORNEO'
        : d.type === 'bienvenida' && f.joinDate
          ? 'DESDE ' + fmtDate(f.joinDate).replace('/', '.')
          : at(p0) || v.hashtag
    ).toUpperCase(),
  })
  people.forEach((p, i) => {
    v[`personName:${i}`] = p.name.toUpperCase()
    v[`personRole:${i}`] = p.role.toUpperCase()
  })
  // overrides manuales del usuario sobre textos (prefijo "t:")
  for (const [k, val] of Object.entries(f)) if (k.startsWith('t:')) v[k.slice(2)] = val
  return v
}

/** Fuentes de imagen enlazadas. */
export function resolveImageBind(bind: string, d: PostDoc, r: Roster): string | undefined {
  // el logo blanco es sólo para las derrotas; en todo lo demás va el de color (MAIN o GC)
  if (bind === 'logo:team') return LOGOS[r.id][outcome(d) === 'loss' ? 'negative' : 'positive']
  if (bind === 'logo:rival') return d.fields.rivalLogo || undefined
  // en las derrotas, la de victoria pasa a la enojada
  if (bind === 'agent') return agentImage(d.fields.agent)
  if (bind === 'mascot') return mascot(d.type === 'resultado' && d.mascot.endsWith('-victoria') && outcome(d) === 'loss' ? d.mascot.replace(/-victoria$/, '-enojado') : d.mascot)
  if (bind === 'logo:tournament') return d.fields.tournamentLogo || undefined
  if (bind === 'art:keycaps') return keycapsArt()
  if (bind.startsWith('art:key:')) {
    const [, , letter, rot] = bind.split(':')
    return keyArt(letter, Number(rot) || 0)
  }
  if (bind.startsWith('person:')) {
    const p = selectedPeople(d, r)[Number(bind.slice(7))]
    if (!p) return undefined
    return p.photo || '/brand/player-placeholder.png'
  }
  return undefined
}
