import { COMPETITIVE_TYPES } from './competitive'
import { TEAM_TYPES } from './team'
import type { PostType } from './types'

/** el orden en que se listan (el primero es el que va por defecto) */
const ORDER = ['matchday', 'resultado', 'torneo', 'bienvenida', 'despedida', 'cumple', 'tryouts', 'roster', 'comunicado', 'comunidad', 'stream', 'mvp', 'competencia']
const ALL = [...COMPETITIVE_TYPES, ...TEAM_TYPES]
export const POST_TYPES: PostType[] = ORDER.map((id) => ALL.find((t) => t.id === id)!)

export const postType = (id: string) => POST_TYPES.find((t) => t.id === id) ?? POST_TYPES[0]
