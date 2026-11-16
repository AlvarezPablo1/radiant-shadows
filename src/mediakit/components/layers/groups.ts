import type { Layer } from '../../types'

/**
 * Elementos que van juntos y se muestran como una sola capa en el panel
 * (p. ej. la caja, el título y el valor de cada estadística, o todos los jugadores de la fila).
 */
export function groupOf(l: Layer): string | null {
  const n = l.name
  let m = n.match(/^(?:Stat|Valor|Caja|Línea stat) (\d+)$/)
  if (m) return `Estadística ${Number(m[1]) + 1}`
  if (/^Jugador \d+$/.test(n)) return 'Jugadores'
  if (['Logo equipo', 'Logo rival', 'Nombre rival', 'VS', 'Marcador'].includes(n)) return 'VS / marcador'
  if (n === 'Firma' || n === 'Hashtag') return 'Pie (firma y hashtag)'
  if (/^Patrón/.test(n)) return 'Patrón de fondo'
  if (/^Tecla /.test(n)) return 'Teclas'
  if (n === 'Tarjeta' || n === 'Esquinas') return 'Marco'
  if (/^Línea (izquierda|derecha)$/.test(n)) return 'Líneas'
  m = n.match(/^(Titular \d)$/)
  if (m) return 'Titular'
  return null
}

export type Entry = { kind: 'one'; layer: Layer } | { kind: 'group'; name: string; layers: Layer[] }

/** lista para el panel (de adelante hacia atrás): cada grupo aparece una vez, en el lugar de su elemento de más adelante */
export function entries(layers: Layer[]): Entry[] {
  const byGroup = new Map<string, Layer[]>()
  for (const l of layers) {
    const g = groupOf(l)
    if (g) byGroup.set(g, [...(byGroup.get(g) ?? []), l])
  }
  const out: Entry[] = []
  const done = new Set<string>()
  for (const l of [...layers].reverse()) {
    const g = groupOf(l)
    const members = g ? byGroup.get(g)! : []
    if (!g || members.length < 2) out.push({ kind: 'one', layer: l })
    else if (!done.has(g)) {
      done.add(g)
      out.push({ kind: 'group', name: g, layers: members })
    }
  }
  return out
}

/** mueve un bloque de elementos (en el orden de la lista) uno o varios lugares, o hasta donde está `target` */
export function moveBlock(ls: Layer[], ids: string[], dir: number, target?: string): Layer[] {
  const block = ls.filter((l) => ids.includes(l.id))
  const rest = ls.filter((l) => !ids.includes(l.id))
  let at: number
  if (target) {
    at = rest.findIndex((l) => l.id === target)
    if (at < 0) return ls
    if (dir > 0) at++
  } else {
    const firstIdx = ls.findIndex((l) => ids.includes(l.id))
    const before = ls.slice(0, firstIdx).filter((l) => !ids.includes(l.id)).length
    at = Math.max(0, Math.min(rest.length, before + dir))
  }
  return [...rest.slice(0, at), ...block, ...rest.slice(at)]
}
