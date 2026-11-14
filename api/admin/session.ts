import { requireSession } from '../../server/auth.js'

/** GET /api/admin/session — 200 si hay sesión iniciada, 401 si no (el admin decide si muestra el login) */
export async function GET(request: Request) {
  return (await requireSession(request)) ?? Response.json({ ok: true })
}
