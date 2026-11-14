import { COOKIE, isValidSession, readCookie } from './session.js'

/** null si la persona inició sesión en /admin; si no, la respuesta 401 para devolver */
export async function requireSession(request: Request): Promise<Response | null> {
  if (await isValidSession(readCookie(request, COOKIE))) return null
  return Response.json({ error: 'Tenés que iniciar sesión' }, { status: 401 })
}
