import { put } from '@vercel/blob'
import { requireSession } from '../../server/auth.js'

const TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']
const MAX_BYTES = 4 * 1024 * 1024 // las funciones de Vercel aceptan hasta 4,5 MB por pedido

/** POST /api/admin/upload — sube una imagen (campo "file") y devuelve su URL pública */
export async function POST(request: Request) {
  const denied = await requireSession(request)
  if (denied) return denied

  const form = await request.formData().catch(() => null)
  const file = form?.get('file')
  if (!(file instanceof File)) return Response.json({ error: 'Falta la imagen' }, { status: 400 })
  if (!TYPES.includes(file.type)) return Response.json({ error: 'Tiene que ser PNG, JPG, WebP o GIF' }, { status: 400 })
  if (file.size > MAX_BYTES) return Response.json({ error: 'La imagen pesa más de 4 MB' }, { status: 413 })

  const name = file.name.toLowerCase().replace(/[^a-z0-9.]+/g, '-').slice(-60)
  try {
    const blob = await put(`uploads/${name}`, file, { access: 'public', addRandomSuffix: true, contentType: file.type })
    return Response.json({ url: blob.url })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'No se pudo subir la imagen' }, { status: 500 })
  }
}
