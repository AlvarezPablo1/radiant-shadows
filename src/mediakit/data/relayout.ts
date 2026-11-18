import { FORMAT_IDS, type FormatId, type Layer, type PostDoc, type Roster } from '../types'
import { keyOf } from './doc'
import { buildLayout, reflowRow } from './layouts'
import { selectedPeople } from './postTypes'

/** clave para seguir un elemento entre el armado viejo y el nuevo: las fotos de personas siguen a la persona, no al lugar */
function trackKey(l: Layer, people: string[]) {
  const slot = l.bind?.startsWith('person:') ? Number(l.bind.slice(7)) : NaN
  return Number.isInteger(slot) && people[slot] ? 'persona:' + people[slot] : keyOf(l)
}

/**
 * Rearma la composición con la plantilla (cambió el diseño, quién aparece, el orden…) sin perder lo hecho a mano:
 * los elementos agregados siguen, lo que se ocultó o bloqueó queda así y lo que se borró no vuelve.
 * Las posiciones sí vuelven a las de la plantilla. Los formatos que nunca se armaron se generan después, como siempre.
 */
export function relayoutKeeping(prev: PostDoc, next: PostDoc, rosters: Record<string, Roster>): PostDoc {
  // al cambiar de roster (MAIN ↔ GC) cada armado usa el suyo
  const before = rosters[prev.roster], after = rosters[next.roster]
  const prevPeople = selectedPeople(prev, before).map((p) => p.id)
  const nextPeople = selectedPeople(next, after).map((p) => p.id)
  const layers: Partial<Record<FormatId, Layer[]>> = {}

  for (const f of FORMAT_IDS) {
    const old = prev.layers[f]
    if (!old) continue
    const oldTemplate = buildLayout(prev, before, f)
    const present = new Set(old.map(keyOf))
    // de la plantilla vieja, lo que ya no estaba: se borró a mano
    const removed = new Set(oldTemplate.filter((l) => !present.has(keyOf(l))).map((l) => trackKey(l, prevPeople)))
    const state = new Map(old.map((l) => [trackKey(l, prevPeople), { visible: l.visible, locked: l.locked }]))

    let fresh = buildLayout(next, after, f)
      .filter((l) => !removed.has(trackKey(l, nextPeople)))
      .map((l) => {
        const s = state.get(trackKey(l, nextPeople))
        return s ? ({ ...l, ...s } as Layer) : l
      })
    // con "mantener la formación", los jugadores visibles se vuelven a repartir
    if (next.fields.rowSnap === '1') fresh = reflowRow(fresh)
    // lo agregado a mano (al crearlo se le pone una clave "u-…") va arriba de todo, en el orden en que estaba
    const added = old.filter((l) => keyOf(l).startsWith('u-'))
    layers[f] = [...fresh, ...added]
  }
  return { ...next, layers }
}
