import { createHash } from 'node:crypto'
import { put } from '@vercel/blob'

/**
 * Agenda de contenido del staff: un JSON aparte, que NO forma parte del contenido público (/api/content no lo lee).
 * El almacenamiento es público por dirección, así que el nombre del archivo lleva un código que sale del token
 * (no se puede adivinar) y sólo se lee y se escribe desde /api/admin/agenda, con la sesión del admin.
 */
function storeUrl() {
  const token = process.env.BLOB_READ_WRITE_TOKEN
  if (!token) throw new Error('Falta BLOB_READ_WRITE_TOKEN')
  return `https://${token.split('_')[3].toLowerCase()}.public.blob.vercel-storage.com`
}
const path = () => `privado/agenda-${createHash('sha256').update(`${process.env.BLOB_READ_WRITE_TOKEN}:agenda`).digest('hex').slice(0, 32)}.json`

export async function readAgenda(): Promise<unknown[]> {
  const res = await fetch(`${storeUrl()}/${path()}?v=${Date.now()}`, { cache: 'no-store' })
  if (res.status === 404) return []
  if (!res.ok) throw new Error(`No se pudo leer la agenda: ${res.status}`)
  return (await res.json()) as unknown[]
}

export async function writeAgenda(items: unknown[]) {
  await put(path(), JSON.stringify(items), { access: 'public', addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 0 })
}
