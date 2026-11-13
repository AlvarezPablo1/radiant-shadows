import { next } from '@vercel/functions'
import { COOKIE, isValidSession, readCookie } from './server/session.js'

/**
 * Acceso sólo para el staff: sin sesión válida no se entrega nada de la app
 * (ni el código ni las fotos). La pantalla de login y sus recursos quedan libres.
 */
export const config = {
  runtime: 'nodejs',
  matcher: ['/((?!login\\.html|api/login|favicon\\.png|brand/logos/rs-positive\\.png|brand/mascots/kael-dragon\\.png).*)'],
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
