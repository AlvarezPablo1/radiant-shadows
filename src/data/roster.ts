import { PLAYER_PHOTOS } from '../brand'
import type { Person, Roster, RosterId } from '../types'

const p = (id: string, name: string, role: string): Person => ({ id, name, role, ig: '', x: '', active: true })

export const STAFF_ROLES = ['COACH', 'ASSISTANT', 'PERFCOACH', 'TEAM MANAGER']
export const PLAYER_ROLES = ['Jugador', 'Duelista', 'Iniciador', 'Controlador', 'Centinela', 'Flex', 'Suplente']

function make(id: RosterId, label: string): Roster {
  return {
    id,
    label,
    players: [
      p(`${id}-p1`, 'Jugador 1', 'Duelista'),
      p(`${id}-p2`, 'Jugador 2', 'Iniciador'),
      p(`${id}-p3`, 'Jugador 3', 'Controlador'),
      p(`${id}-p4`, 'Jugador 4', 'Centinela'),
      p(`${id}-p5`, 'Jugador 5', 'Flex'),
      { ...p(`${id}-p6`, 'Jugador 6', 'Suplente'), active: false },
    ],
    staff: [p(`${id}-s1`, '', 'COACH'), p(`${id}-s2`, '', 'ASSISTANT'), p(`${id}-s3`, '', 'PERFCOACH'), p(`${id}-s4`, '', 'TEAM MANAGER')],
  }
}

const MAIN_PLAYERS = Object.keys(PLAYER_PHOTOS)

/** Completa el roster MAIN con los jugadores oficiales donde todavía haya nombres genéricos. */
export function withOfficialPlayers(r: Roster): Roster {
  if (r.id !== 'main') return r
  return {
    ...r,
    players: r.players.map((p, i) => {
      const name = MAIN_PLAYERS[i]
      if (!name || !/^Jugador \d$/.test(p.name)) return p
      return { ...p, name, role: 'Jugador', photo: p.photo ?? PLAYER_PHOTOS[name] }
    }),
  }
}

export const DEFAULT_ROSTERS: Record<RosterId, Roster> = {
  main: withOfficialPlayers(make('main', 'Radiant Shadows')),
  gc: make('gc', 'Radiant Shadows GC'),
}

export const allPeople = (r: Roster) => [...r.players, ...r.staff]
export const handle = (h: string) => (!h ? '' : h.startsWith('@') ? h : '@' + h)
