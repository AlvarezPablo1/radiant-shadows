import { sessionCookie } from '../server/session.js'

/** GET /api/logout — cierra la sesión y vuelve al login de /admin */
export function GET(request: Request) {
  const origin = new URL(request.url).origin
  return new Response(null, { status: 303, headers: { Location: `${origin}/admin`, 'Set-Cookie': sessionCookie('', 0) } })
}
