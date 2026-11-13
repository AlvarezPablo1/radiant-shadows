/**
 * Sesión del staff: cookie firmada con HMAC-SHA256 ("<vencimiento>.<firma>").
 * La contraseña y el secreto viven en variables de entorno de Vercel (APP_PASSWORD, SESSION_SECRET),
 * nunca en el código que descarga el navegador.
 */
export const COOKIE = 'rs_session'
export const MAX_AGE = 60 * 60 * 24 * 30 // 30 días

const enc = new TextEncoder()

async function hmac(data: string): Promise<string> {
  const secret = process.env.SESSION_SECRET
  if (!secret) throw new Error('Falta SESSION_SECRET')
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data))
  return Buffer.from(sig).toString('base64url')
}

/** comparación en tiempo constante */
export function safeEqual(a: string, b: string): boolean {
  const x = enc.encode(a),
    y = enc.encode(b)
  let diff = x.length ^ y.length
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0)
  return diff === 0
}

export async function createSession(): Promise<string> {
  const exp = String(Math.floor(Date.now() / 1000) + MAX_AGE)
  return `${exp}.${await hmac(exp)}`
}

export async function isValidSession(token: string | undefined): Promise<boolean> {
  if (!token) return false
  const [exp, sig] = token.split('.')
  if (!exp || !sig || Number(exp) < Date.now() / 1000) return false
  try {
    return safeEqual(sig, await hmac(exp))
  } catch {
    return false
  }
}

export function readCookie(request: Request, name: string): string | undefined {
  const header = request.headers.get('cookie') ?? ''
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return undefined
}

export function sessionCookie(value: string, maxAge = MAX_AGE) {
  return `${COOKIE}=${value}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${maxAge}`
}
