import { LOGOS, mascot } from '../../brand'
import { keyArt, keycapsArt } from '../../lib/art'
import type { PostDoc, Roster } from '../../types'
import { agentImage } from '../agents'
import { outcome } from './outcome'
import { selectedPeople } from './people'

/** Fuentes de imagen enlazadas. */
export function resolveImageBind(bind: string, d: PostDoc, r: Roster): string | undefined {
  // el logo blanco es sólo para las derrotas; en todo lo demás va el de color (MAIN o GC)
  if (bind === 'logo:team') return LOGOS[r.id][outcome(d) === 'loss' ? 'negative' : 'positive']
  if (bind === 'logo:rival') return d.fields.rivalLogo || undefined
  // en las derrotas, la de victoria pasa a la enojada
  if (bind === 'agent') return agentImage(d.fields.agent)
  if (bind === 'mascot') return mascot(d.type === 'resultado' && d.mascot.endsWith('-victoria') && outcome(d) === 'loss' ? d.mascot.replace(/-victoria$/, '-enojado') : d.mascot)
  if (bind === 'logo:tournament') return d.fields.tournamentLogo || undefined
  if (bind === 'art:keycaps') return keycapsArt()
  if (bind.startsWith('art:key:')) {
    const [, , letter, rot] = bind.split(':')
    return keyArt(letter, Number(rot) || 0)
  }
  if (bind.startsWith('person:')) {
    const p = selectedPeople(d, r)[Number(bind.slice(7))]
    if (!p) return undefined
    return p.photo || '/brand/player-placeholder.png'
  }
  return undefined
}
