import { DEFAULT_CONTENT, type Content } from './content'

/** Lo guardado desde /admin, completado con el contenido del código. Sin conexión o sin API (npm run dev) devuelve el del código. */
export async function loadContent(): Promise<Content> {
  try {
    const r = await fetch('/api/content')
    if (!r.ok) return DEFAULT_CONTENT
    return { ...DEFAULT_CONTENT, ...((await r.json()) as Partial<Content>) }
  } catch {
    return DEFAULT_CONTENT
  }
}
