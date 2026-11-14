import { next } from '@vercel/functions'
import { COOKIE, isValidSession, readCookie } from './server/session.js'

/**
 * Acceso sólo para el staff al mediakit (/mediakit): sin sesión, se manda a /admin para iniciarla.
 * El panel /admin muestra su propio login, y sus APIs (/api/admin/*) chequean la sesión ellas mismas.
 */
export const config = {
  runtime: 'nodejs',
  matcher: ['/mediakit', '/mediakit/:path*', '/api/logout'],
}

export default async function middleware(request: Request) {
  if (await isValidSession(readCookie(request, COOKIE))) return next()

  const url = new URL(request.url)
  const wantsPage = request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html')
  if (wantsPage) {
    url.pathname = '/admin'
    url.search = ''
    return Response.redirect(url, 307)
  }
  return new Response('No autorizado', { status: 401 })
}
