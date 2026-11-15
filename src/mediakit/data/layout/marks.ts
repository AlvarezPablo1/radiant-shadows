import { C } from '../../brand'
import type { Layer, TextLayer } from '../../types'
import { I, T, type Ctx } from './core'

/** nombre de la tipografía del "Stream ON" (subida desde la pestaña Marca) */
export const STREAM_FONT = 'Deep Shadows'
const TOP_LOGOS = new Set(['Logo', 'Logo chico'])
const GAME_TAGS = new Set(['Juego', 'Año'])
const TITLE_BINDS = new Set(['title', 'neonTitle', 'neon1', 'neon2', 'panelTitle'])

/**
 * Reglas de marca comunes a todos los diseños (se aplican al final):
 *  - el logo va arriba a la izquierda, chico. Si la placa ya tiene nuestro logo (el VS / marcador o el isotipo
 *    como protagonista) no se repite; en Stream ON no va (queda sólo el isotipo del fondo).
 *  - "VALORANT" va arriba a la derecha, chico, y siempre detrás de los jugadores.
 *  - el titular del Stream ON usa su tipografía propia.
 */
export function brandMarks(c: Ctx, layers: Layer[]): Layer[] {
  const { W, u, d } = c
  const stream = d.type === 'stream'
  let out = layers.filter((l) => !TOP_LOGOS.has(l.name) && !(stream && l.type === 'image' && l.bind === 'logo:team'))
  // nuestro logo ya presente: el del VS / marcador o el isotipo como protagonista (no cuenta el de fondo)
  const ownLogo = out.some((l) => l.type === 'image' && l.bind === 'logo:team' && (l.name === 'Logo equipo' || l.name === 'Isotipo'))

  const size = u * 5
  const x = u * 6
  const y = c.safeTop + u * 6
  if (!ownLogo && !stream) out.push(I('Logo', 'logo:team', '', x, y, size, size, { glow: 0.3 }))

  // VALORANT: se reubica (o se crea) y se manda detrás del primer jugador / foto
  const found = out.find((l) => GAME_TAGS.has(l.name)) as TextLayer | undefined
  out = out.filter((l) => l !== found)
  const fontSize = u * 2.7
  const tag = T(found?.name ?? 'Juego', found?.bind, found?.text ?? 'VALORANT', W / 2, y + size / 2 - fontSize * 0.45, W / 2 - x, 'condensada', fontSize, {
    align: 'right',
    fill: C.lilac,
    letterSpacing: u * 0.3,
  })
  const firstPhoto = out.findIndex((l) => l.type === 'image' && (!!l.row || l.bind?.startsWith('person:') || l.bind === 'mascot'))
  out.splice(firstPhoto < 0 ? out.length : firstPhoto, 0, tag)

  if (stream) out = out.map((l) => (l.type === 'text' && l.bind && TITLE_BINDS.has(l.bind) ? { ...l, font: STREAM_FONT } : l))
  return out
}
