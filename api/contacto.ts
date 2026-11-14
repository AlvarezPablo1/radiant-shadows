import { CONTACT_SUBJECTS } from '../src/home/data/contact.js'

/**
 * POST /api/contacto — recibe el formulario de la home y lo manda por mail con Resend.
 * Variables: RESEND_API_KEY (obligatoria), CONTACT_TO y CONTACT_FROM (opcionales).
 */

const TO = process.env.CONTACT_TO ?? 'radiant.shadowsss@gmail.com'
// sin dominio propio Resend sólo deja enviar desde su dirección de prueba
const FROM = process.env.CONTACT_FROM ?? 'Radiant Shadows <onboarding@resend.dev>'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

interface Message {
  name: string
  email: string
  subject: string
  message: string
}

const json = (status: number, body: object) => Response.json(body, { status })

const escape = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`)

function read(body: unknown): Message | null {
  if (!body || typeof body !== 'object') return null
  const field = (key: string, max: number) => String((body as Record<string, unknown>)[key] ?? '').trim().slice(0, max)
  const msg = { name: field('name', 80), email: field('email', 120), subject: field('subject', 60), message: field('message', 2000) }
  if (!msg.name || !EMAIL.test(msg.email) || !CONTACT_SUBJECTS.includes(msg.subject)) return null
  return msg
}

function html({ name, email, subject, message }: Message) {
  return `
    <h2 style="margin:0 0 12px">Nuevo mensaje desde la web</h2>
    <p><b>Motivo:</b> ${escape(subject)}</p>
    <p><b>Nombre:</b> ${escape(name)}</p>
    <p><b>Mail:</b> ${escape(email)}</p>
    <p><b>Mensaje:</b><br>${message ? escape(message).replace(/\n/g, '<br>') : '<i>(sin mensaje)</i>'}</p>
    <hr><p style="color:#888;font-size:12px">Respondé este mail para contestarle directamente.</p>`
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)

  // trampa para bots: si completaron el campo oculto, fingimos que salió bien
  if (body && typeof body === 'object' && 'website' in body && body.website) return json(200, { ok: true })

  const msg = read(body)
  if (!msg) return json(400, { error: 'Datos incompletos o inválidos' })

  const key = process.env.RESEND_API_KEY
  if (!key) {
    console.error('Falta RESEND_API_KEY')
    return json(500, { error: 'El envío no está configurado' })
  }

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      reply_to: msg.email,
      subject: `[Web] ${msg.subject} — ${msg.name}`,
      html: html(msg),
    }),
  })
  if (!res.ok) {
    console.error('Resend', res.status, await res.text())
    return json(502, { error: 'No se pudo enviar' })
  }
  return json(200, { ok: true })
}
