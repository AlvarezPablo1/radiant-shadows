import { requireSession } from '../../server/auth.js'
import { writeCollection } from '../../server/content.js'
import { isCollectionKey } from '../../src/shared/content/collections.js'

const MAX_BYTES = 500_000

/** PUT /api/admin/content?collection=news — reemplaza una sección completa (lista de elementos) */
export async function PUT(request: Request) {
  const denied = await requireSession(request)
  if (denied) return denied

  const key = new URL(request.url).searchParams.get('collection')
  if (!isCollectionKey(key)) return Response.json({ error: 'Sección desconocida' }, { status: 400 })

  const text = await request.text()
  if (text.length > MAX_BYTES) return Response.json({ error: 'Demasiado contenido' }, { status: 413 })
  let items: unknown
  try {
    items = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Formato inválido' }, { status: 400 })
  }
  if (!Array.isArray(items) || !items.every((i) => i && typeof i === 'object' && !Array.isArray(i))) {
    return Response.json({ error: 'Se esperaba una lista' }, { status: 400 })
  }

  try {
    await writeCollection(key, items)
    return Response.json({ ok: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'No se pudo guardar' }, { status: 500 })
  }
}
