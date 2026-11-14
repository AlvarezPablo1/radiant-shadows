/**
 * Secciones editables desde /admin. Sin imports a propósito: también lo usan las funciones
 * del servidor (api/), que no pueden importar el resto de los datos de la web.
 */
export const COLLECTION_KEYS = ['news', 'players', 'coaches', 'staff', 'creators', 'achievements', 'events'] as const

export type CollectionKey = (typeof COLLECTION_KEYS)[number]

export const isCollectionKey = (key: unknown): key is CollectionKey => COLLECTION_KEYS.includes(key as CollectionKey)
