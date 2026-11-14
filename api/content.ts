import { readAll } from '../server/content.js'

/**
 * GET /api/content — el contenido guardado desde /admin, para la web pública.
 * Se cachea unos segundos en Vercel; con ?fresh=1 (lo usa el admin) se lee al momento.
 */
export async function GET(request: Request) {
  const fresh = new URL(request.url).searchParams.has('fresh')
  try {
    const content = await readAll(fresh)
    return Response.json(content, {
      headers: { 'Cache-Control': fresh ? 'no-store' : 'public, s-maxage=30, stale-while-revalidate=300' },
    })
  } catch (e) {
    console.error(e)
    return Response.json({ error: 'No se pudo leer el contenido' }, { status: 500 })
  }
}
