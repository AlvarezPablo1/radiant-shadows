import { next } from '@vercel/functions'
import { COOKIE, isValidSession, readCookie } from './server/session.js'

/**
 * Acceso sólo para el staff al mediakit (/mediakit) y a las fotos de los jugadores.
 * La home pública y la pantalla de login quedan libres.
 */
export const config = {
  runtime: 'nodejs',
  matcher: ['/mediakit', '/mediakit/:path*', '/brand/players/:path*', '/api/logout'],
}

export default async function middleware(request: Request) {
  if (await isValidSession(readCookie(request, COOKIE))) return next()

  const url = new URL(request.url)
  const wantsPage = request.method === 'GET' && (request.headers.get('accept') ?? '').includes('text/html')
  if (wantsPage) {
    url.pathname = '/login.html'
    url.search = ''
    return Response.redirect(url, 307)
  }
  return new Response('No autorizado', { status: 401 })
}
