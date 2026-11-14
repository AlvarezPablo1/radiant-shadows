import type { Content } from '../../shared/content/content'
import { ofTeam, type Member } from '../../shared/content/rosters'
import type { Person, Roster, RosterId } from '../types'

export const STAFF_ROLES = ['COACH', 'ASSISTANT', 'PERFCOACH', 'TEAM MANAGER']

/** Lo único que se ajusta en el mediakit (se guarda en este navegador): quién es titular y una foto distinta */
export type LocalTweaks = Record<string, { active?: boolean; photo?: string }>

const TEAMS: Record<RosterId, { team: 'Masculino' | 'Game Changers'; label: string }> = {
  main: { team: 'Masculino', label: 'Radiant Shadows' },
  gc: { team: 'Game Changers', label: 'Radiant Shadows GC' },
}

const slug = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
/** "@usuario" a partir del link del perfil (o lo que se haya escrito) */
function handleOf(v?: string) {
  if (!v) return ''
  try {
    return '@' + new URL(v).pathname.split('/').filter(Boolean)[0]
  } catch {
    return handle(v.trim())
  }
}
/** el puesto del staff como etiqueta de los copys: [COACH], [ASSISTANT]… */
function staffRole(role = '') {
  const r = role.toLowerCase()
  if (r.includes('assistant') || r.includes('asistente')) return 'ASSISTANT'
  if (r.includes('perf')) return 'PERFCOACH'
  if (r.includes('manager')) return 'TEAM MANAGER'
  if (r.includes('coach')) return 'COACH'
  return role.toUpperCase()
}

function person(rid: RosterId, m: Member, role: string, active: boolean, tweaks: LocalTweaks): Person {
  const id = `${rid}-${slug(m.name)}`
  const t = tweaks[id] ?? {}
  return { id, name: m.name, realName: m.realName, role, ig: handleOf(m.instagram), x: handleOf(m.x), photo: t.photo ?? m.photo, active: t.active ?? active }
}

/** Mientras un equipo no tenga jugadores cargados en /admin, las placas se arman con lugares genéricos */
const placeholders = (rid: RosterId, tweaks: LocalTweaks): Person[] =>
  [1, 2, 3, 4, 5].map((i) => {
    const id = `${rid}-p${i}`
    return { id, name: `Jugador ${i}`, role: 'Jugador', ig: '', x: '', photo: tweaks[id]?.photo, active: true }
  })

/** Los rosters del mediakit salen de lo cargado en /admin (jugadores y cuerpo técnico de cada equipo) */
export function rostersFrom(content: Content, tweaks: LocalTweaks): Record<RosterId, Roster> {
  const build = (rid: RosterId): Roster => {
    const { team, label } = TEAMS[rid]
    const players = ofTeam(content.players, team).map((m, i) => person(rid, m, m.role || 'Jugador', i < 5, tweaks))
    const staff = ofTeam(content.coaches, team).map((m) => person(rid, m, staffRole(m.role), true, tweaks))
    return { id: rid, label, players: players.length ? players : placeholders(rid, tweaks), staff }
  }
  return { main: build('main'), gc: build('gc') }
}

export const allPeople = (r: Roster) => [...r.players, ...r.staff]
export const handle = (h: string) => (!h ? '' : h.startsWith('@') ? h : '@' + h)
