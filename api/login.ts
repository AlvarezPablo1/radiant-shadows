import { createSession, safeEqual, sessionCookie } from '../server/session.js'

/** POST /api/login — valida la contraseña del staff, deja una sesión firmada por 30 días y vuelve a /admin */
export async function POST(request: Request) {
  const expected = process.env.APP_PASSWORD
  const form = await request.formData().catch(() => null)
  const password = String(form?.get('password') ?? '')
  const origin = new URL(request.url).origin

  if (!expected || !safeEqual(password, expected)) {
    // pequeña espera para desalentar intentos en serie
    await new Promise((r) => setTimeout(r, 700))
    return new Response(null, { status: 303, headers: { Location: `${origin}/admin?error=1` } })
  }

  return new Response(null, {
    status: 303,
    headers: { Location: `${origin}/admin`, 'Set-Cookie': sessionCookie(await createSession()) },
  })
}
