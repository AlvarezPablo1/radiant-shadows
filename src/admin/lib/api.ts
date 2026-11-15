import type { CollectionKey } from '../../shared/content/collections'
import { compressImage } from './compress'
import { DEFAULT_CONTENT, type Content } from '../../shared/content/content'

/** Sesión iniciada en /admin */
export async function hasSession() {
  const r = await fetch('/api/admin/session', { cache: 'no-store' })
  return r.ok
}

/** Contenido actual (lo guardado y, para lo que nunca se guardó, lo del código) */
export async function loadContent(): Promise<Content> {
  const r = await fetch('/api/content?fresh=1', { cache: 'no-store' })
  if (!r.ok) throw new Error('No se pudo cargar el contenido')
  return { ...DEFAULT_CONTENT, ...((await r.json()) as Partial<Content>) }
}

async function errorText(r: Response) {
  const data = (await r.json().catch(() => null)) as { error?: string } | null
  return data?.error ?? `Error ${r.status}`
}

/**
 * Guarda una sección completa y no termina hasta comprobar que lo guardado ya es lo que se lee
 * (así el aviso de "guardado" aparece cuando el cambio está de verdad en el sitio).
 */
export async function saveCollection(key: CollectionKey, items: unknown[]) {
  const body = JSON.stringify(items)
  const r = await fetch(`/api/admin/content?collection=${key}`, {
    method: 'PUT',
    headers: { 'content-type': 'application/json' },
    body,
  })
  if (!r.ok) throw new Error(await errorText(r))
  // se vuelve a leer hasta que coincida (unos segundos como mucho)
  for (let i = 0; i < 12; i++) {
    const check = await fetch('/api/content?fresh=1', { cache: 'no-store' })
    if (check.ok) {
      const saved = ((await check.json()) as Partial<Content>)[key]
      if (JSON.stringify(saved) === body) return
    }
    await new Promise((res) => setTimeout(res, 700))
  }
  throw new Error('Se guardó, pero todavía no se ve actualizado. Recargá en unos segundos para confirmar.')
}

/** Sube una imagen (achicada y en WebP) y devuelve su URL pública */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData()
  body.append('file', await compressImage(file))
  const r = await fetch('/api/admin/upload', { method: 'POST', body })
  if (!r.ok) throw new Error(await errorText(r))
  return ((await r.json()) as { url: string }).url
}
