import { readAgenda, writeAgenda } from '../../server/agenda.js'
import { requireSession } from '../../server/auth.js'

const MAX_BYTES = 500_000

/** GET /api/admin/agenda — los eventos de la agenda de contenido (sólo con la sesión del admin) */
export async function GET(request: Request) {
  const denied = await requireSession(request)
  if (denied) return denied
  try {
    return Response.json(await readAgenda(), { headers: { 'Cache-Control': 'no-store' } })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'No se pudo leer la agenda' }, { status: 500 })
  }
}

/** PUT /api/admin/agenda — reemplaza la lista completa de eventos */
export async function PUT(request: Request) {
  const denied = await requireSession(request)
  if (denied) return denied
  const text = await request.text()
  if (text.length > MAX_BYTES) return Response.json({ error: 'Demasiado contenido' }, { status: 413 })
  let items: unknown
  try {
    items = JSON.parse(text)
  } catch {
    return Response.json({ error: 'Formato inválido' }, { status: 400 })
  }
  if (!Array.isArray(items) || !items.every((i) => i && typeof i === 'object' && !Array.isArray(i) && typeof (i as { date?: unknown }).date === 'string')) {
    return Response.json({ error: 'Se esperaba una lista de eventos' }, { status: 400 })
  }
  try {
    await writeAgenda(items)
    return Response.json({ ok: true })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'No se pudo guardar' }, { status: 500 })
  }
}
