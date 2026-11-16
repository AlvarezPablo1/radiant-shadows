import { C } from '../../brand'
import type { Layer } from '../../types'
import { S, T, stack, type Ctx } from './core'
import { footer, hero, versus } from './parts'

type Kind = 'poster' | 'contour' | 'center'

const fade = (c: Ctx, y: number) => S('Fundido', 'rect', 0, y, c.W, c.H - y, { fill: 'rgba(0,0,16,0)', stroke: 'transparent', strokeWidth: 0, gradient: true })

/**
 * VICTORIA / DERROTA / EMPATE en Póster, Contorno y Centrado.
 * El equipo enorme ocupando todo el ancho; el resultado ("0 - 0" entre los dos logos) y la frase encima de los jugadores.
 * Póster: titular blanco con brillo (en X, gigante detrás de los jugadores, con el marcador arriba).
 * Contorno: titular calado arriba, detrás del equipo. Centrado: titular blanco sobre el pecho de los jugadores.
 */
export function result(c: Ctx, kind: Kind): Layer[] {
  return c.fmt === 'x' ? landscape(c, kind) : portrait(c, kind)
}

function portrait(c: Ctx, kind: Kind): Layer[] {
  const { W, H, u } = c
  const m = u * 7
  const top = c.safeTop + m * 0.7
  const bottom = H - c.safeBottom - m * 0.8
  const out: Layer[] = []
  const outline = kind === 'contour'

  // pie: el póster con la firma vertical a la izquierda; los otros, firma y hashtag centrados
  const foot =
    kind === 'poster'
      ? [
          T('Firma', 'signature', '', u * 3.5, bottom + u * 2, H * 0.4, 'condensada', u * 3, { rotation: -90, align: 'left', fill: '#690ae6', letterSpacing: u * 0.5 }),
          T('Hashtag', 'hashtag', '', m, bottom - u * 3, W - 2 * m, 'condensada', u * 3.2, { fill: C.violetLight, letterSpacing: u * 0.2 }),
        ]
      : footer(c, 'center')
  const hashY = Math.min(...foot.filter((l) => l.name === 'Hashtag').map((l) => l.y))

  // el resultado entre los logos, arriba del hashtag
  const size = u * (outline ? 14 : 13)
  const vsY = hashY - u * (outline ? 9 : 4) - size
  const vs = versus(W / 2, vsY, size, 'score')

  // frase + titular (sólido) + contexto, apilados encima del resultado
  const kick = T('Frase', 'kicker', '', m, 0, W - 2 * m, 'manuscrita', u * (outline ? 10 : 8.5), { fill: C.ember, autoFit: true, lineHeight: 1.3, rotation: outline ? -6 : 0 }, 1)
  const title = T('Titular', 'title', '', m * 0.6, 0, W - m * 1.2, 'condensada', u * 31, { autoFit: true, glow: 0.9, lineHeight: 0.95 }, 1)
  const sub = T('Contexto', 'sub', '', m, 0, W - 2 * m, 'condensada', u * 3.4, { fill: C.violetLight, letterSpacing: u * 0.35, lineHeight: 1.3 }, 1)
  const placed = stack(c, outline ? [kick, sub] : [kick, u * 1.5, title, u * 1.5, sub], { bottom: vsY - u * 2 })
  const textTop = Math.min(...placed.map((l) => l.y))

  // titular calado arriba (contorno)
  if (outline) out.push(T('Titular contorno', 'title', '', m * 0.5, top + u * 12, W - m, 'condensada', u * 34, { fill: 'transparent', stroke: C.violetLight, strokeWidth: 3, autoFit: true, lineHeight: 0.9, glow: 0.3 }, 1))
  // el equipo: todo el ancho (los de los costados se cortan) y hasta abajo
  const heroTop = top + u * (outline ? 24 : 2)
  out.push(...hero(c, -W * 0.3, heroTop, W * 1.6, H - c.safeBottom * 0.4 - heroTop))
  out.push(fade(c, textTop - u * 12))
  out.push(...placed, ...vs, ...foot)
  return out
}

function landscape(c: Ctx, kind: Kind): Layer[] {
  const { W, H, u } = c
  const m = u * 7
  const out: Layer[] = []
  const firma = T('Firma', 'signature', '', u * 3.5, H - u * 5, H * 0.6, 'condensada', u * 3, { rotation: -90, align: 'left', fill: '#690ae6', letterSpacing: u * 0.5 })
  const kickAt = (y: number, w = 640) => T('Frase', 'kicker', '', W / 2 - w / 2, y, w, 'manuscrita', 100, { fill: C.ember, autoFit: true, rotation: -4, lineHeight: 1.3 }, 1)

  if (kind === 'poster') {
    // titular gigante detrás del equipo, marcador y contexto arriba, la frase sobre los jugadores
    out.push(T('Titular', 'title', '', m, 120, W - 2 * m, 'condensada', 540, { autoFit: true, glow: 0.9, lineHeight: 0.95 }, 1))
    out.push(...hero(c, 90, 240, W - 180, H - 240))
    out.push(fade(c, H * 0.62))
    out.push(...versus(W / 2, 10, 104, 'score'))
    out.push(T('Contexto', 'sub', '', m, 118, W - 2 * m, 'condensada', 26, { fill: C.violetLight, letterSpacing: 3 }, 1))
    out.push(kickAt(690))
    out.push(T('Hashtag', 'hashtag', '', m, H - u * 5.5, W - 2 * m, 'condensada', u * 3, { fill: C.violetLight, letterSpacing: u * 0.2 }), firma)
    return out
  }

  if (kind === 'contour') {
    // titular calado arriba, contexto arriba a la izquierda, el equipo a lo ancho y el resultado sobre el del medio
    out.push(T('Titular contorno', 'title', '', W / 2 - 480, 14, 960, 'condensada', 360, { fill: 'transparent', stroke: C.violetLight, strokeWidth: 3, autoFit: true, lineHeight: 0.9, glow: 0.3 }, 1))
    out.push(T('Contexto', 'sub', '', 47, 158, 420, 'condensada', 28, { align: 'left', letterSpacing: 3 }, 1))
    out.push(...hero(c, 40, 205, W - 80, H - 205))
    out.push(fade(c, H * 0.6))
    out.push(...versus(W / 2, 612, 105, 'score'))
    out.push(kickAt(720, 560), ...footer(c, 'center'))
    return out
  }

  // centrado: el equipo a lo ancho y, sobre el pecho, frase + titular + contexto + resultado
  out.push(...hero(c, 60, 60, W - 120, H - 60))
  const size = u * 11
  const vsY = H - u * 9 - size
  const placed = stack(
    c,
    [
      kickAt(0, 560),
      u * 1.5,
      T('Titular', 'title', '', W * 0.18, 0, W * 0.64, 'condensada', 240, { autoFit: true, glow: 0.9, lineHeight: 0.95 }, 1),
      u * 1,
      T('Contexto', 'sub', '', m, 0, W - 2 * m, 'condensada', 26, { fill: C.violetLight, letterSpacing: 3, lineHeight: 1.3 }, 1),
    ],
    { bottom: vsY - u * 1.5 },
  )
  out.push(fade(c, Math.min(...placed.map((l) => l.y)) - u * 8))
  out.push(...placed, ...versus(W / 2, vsY, size, 'score'))
  out.push(T('Hashtag', 'hashtag', '', m, H - u * 5.5, W - 2 * m, 'condensada', u * 3, { fill: C.violetLight, letterSpacing: u * 0.2 }), firma)
  return out
}
