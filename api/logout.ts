import { sessionCookie } from '../server/session'

/** GET /api/logout — cierra la sesión y vuelve al login */
export function GET(request: Request) {
  const origin = new URL(request.url).origin
  return new Response(null, { status: 303, headers: { Location: `${origin}/login.html`, 'Set-Cookie': sessionCookie('', 0) } })
}
