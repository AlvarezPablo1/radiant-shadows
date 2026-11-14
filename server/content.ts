import { put } from '@vercel/blob'
import { COLLECTION_KEYS, type CollectionKey } from '../src/home/data/collections.js'

/**
 * Contenido editable guardado en Vercel Blob: un JSON por sección en content/<sección>.json.
 * Se lee por URL directa (no con list/head) para no gastar operaciones del plan.
 */
function storeUrl() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('Falta BLOB_READ_WRITE_TOKEN')
  // el token tiene la forma vercel_blob_rw_<idDelStore>_<secreto>
  return `https://${token.split('_')[3].toLowerCase()}.public.blob.vercel-storage.com`
}

const path = (key: CollectionKey) => `content/${key}.json`

/** Una sección guardada, o null si nunca se guardó desde /admin. `fresh` saltea la caché del CDN. */
export async function readCollection(key: CollectionKey, fresh = false): Promise<unknown[] | null> {
  const url = `${storeUrl()}/${path(key)}${fresh ? `?t=${Date.now()}` : ''}`
  const res = await fetch(url, fresh ? { cache: 'no-store' } : undefined)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(`No se pudo leer ${key}: ${res.status}`)
  return (await res.json()) as unknown[]
}

/** Todas las secciones guardadas (las que nunca se guardaron no aparecen) */
export async function readAll(fresh = false) {
  const entries = await Promise.all(COLLECTION_KEYS.map(async (k) => [k, await readCollection(k, fresh)] as const))
  return Object.fromEntries(entries.filter(([, v]) => v !== null))
}

export async function writeCollection(key: CollectionKey, items: unknown[]) {
  await put(path(key), JSON.stringify(items), {
    access: 'public',
    addRandomSuffix: false,
    allowOverwrite: true,
    contentType: 'application/json',
    // la web pública lo ve actualizado en hasta ~1 minuto
    cacheControlMaxAge: 60,
  })
}
