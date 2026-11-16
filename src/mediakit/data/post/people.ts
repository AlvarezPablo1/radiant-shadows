import type { Person, PostDoc, Roster } from '../../types'
import { allPeople } from '../roster'
import { postType } from './registry'

export function selectedPeople(d: PostDoc, r: Roster): Person[] {
  const all = allPeople(r)
  const t = postType(d.type)
  if (t.people === 'one') {
    const p = all.find((x) => x.id === d.people[0]) ?? r.players[0]
    return p ? [p] : []
  }
  // los elegidos a mano (si alguno ya no está en el roster, se ignora; si no queda ninguno, van los titulares)
  const chosen = d.people.map((id) => all.find((x) => x.id === id)).filter(Boolean) as Person[]
  return captainInCenter(chosen.length ? chosen : r.players.filter((x) => x.active))
}

/** el capitán va siempre en el lugar del centro de la fila (con un número par, el de la derecha del medio) */
function captainInCenter(list: Person[]): Person[] {
  const i = list.findIndex((p) => p.captain)
  if (i < 0) return list
  const rest = list.filter((_, j) => j !== i)
  const c = Math.floor(list.length / 2)
  return [...rest.slice(0, c), list[i], ...rest.slice(c)]
}
