import type { PostDoc, Roster } from '../../types'
import { findAgent } from '../agents'
import { MATCH_WORDS } from './competitive'
import { at, dayName, fmtDate, todayISO, twitchUrl, year } from './helpers'
import { outcome } from './outcome'
import { selectedPeople } from './people'
import { handle } from '../roster'

const PLACE = ['', 'CAMPEONES', 'SUBCAMPEONES', '3° PUESTO', '4° PUESTO', 'TOP 8', 'PARTICIPACIÓN']

/** Todos los valores "enlazables" de la publicación: los derivados + lo que el usuario sobreescribió. */
export function computeValues(d: PostDoc, r: Roster): Record<string, string> {
  const people = selectedPeople(d, r)
  const p0 = people[0]
  // las fechas vacías son siempre la de hoy
  const f: Record<string, string> = { ...d.fields, date: d.fields.date || todayISO(), joinDate: d.fields.joinDate || todayISO() }
  const v: Record<string, string> = {
    year: year(),
    signature: `RADIANT SHADOWS • ${year()}`,
    team: r.id === 'gc' ? 'RADIANT SHADOWS GC' : 'RADIANT SHADOWS',
    hashtag: r.id === 'gc' ? '#SomosDRAGONAS' : '#SomosDRAGONES',
    rival: f.rival || 'RIVAL',
    rivalName: f.rivalLogo ? '' : (f.rival || 'RIVAL').toUpperCase(),
    tournament: f.tournament || 'TORNEO',
    name: p0?.name || 'NOMBRE',
    role: p0?.role || '',
    at: handle(p0?.ig || ''),
  }
  switch (d.type) {
    case 'matchday':
      Object.assign(v, {
        kicker: /HOY|DÍA/.test(f.word || MATCH_WORDS[0]) ? 'Se viene' : 'Hoy se juega',
        title: f.word || MATCH_WORDS[0],
        info: [fmtDate(f.date), f.time && f.time + ' HS'].filter(Boolean).join('  •  ') || 'FECHA  •  HORA',
        sub: [f.tournament || 'TORNEO', f.phase].filter(Boolean).join('  •  '),
        foot: f.where ? 'EN VIVO EN ' + twitchUrl(f.where).toUpperCase() : '',
      })
      break
    case 'resultado': {
      const o = outcome(d)
      Object.assign(v, {
        kicker: o === 'loss' ? 'Seguimos de pie' : o === 'draw' ? 'Punto a punto' : 'El fuego sigue',
        title: o === 'loss' ? 'DERROTA' : o === 'win' ? 'VICTORIA' : o === 'draw' ? 'EMPATE' : 'RESULTADO',
        score: `${f.scoreUs || '0'}  -  ${f.scoreThem || '0'}`,
        sub: [f.tournament || 'TORNEO', f.map].filter(Boolean).join('  •  '),
        info: '',
      })
      break
    }
    case 'torneo': {
      const n = Math.min(6, Math.max(1, Number(f.place || 1)))
      Object.assign(v, {
        kicker: n === 1 ? 'Somos' : n <= 3 ? 'Orgullosos' : n === 6 ? 'Somos parte' : 'Terminamos',
        // en participación el titular es el torneo (no se repite abajo)
        title: n === 6 ? (f.tournament || 'TORNEO').toUpperCase() : PLACE[n],
        sub: n === 6 ? '' : f.tournament || 'TORNEO',
        info: f.prize || '',
      })
      break
    }
    case 'bienvenida':
      Object.assign(v, { kicker: 'Bienvenido', title: (p0?.name || 'NOMBRE').toUpperCase(), sub: [(p0?.role || 'ROL').toUpperCase(), f.joinDate && 'DESDE EL ' + fmtDate(f.joinDate)].filter(Boolean).join('  •  '), info: f.phrase || 'Un dragón más en la familia' })
      break
    case 'despedida':
      Object.assign(v, { kicker: 'Gracias', title: (p0?.name || 'NOMBRE').toUpperCase(), sub: (p0?.role || '').toUpperCase(), info: f.phrase || 'Por cada ronda jugada con nuestros colores' })
      break
    case 'cumple':
      Object.assign(v, { kicker: 'FELIZ', title: 'CUMPLEAÑOS', sub: (p0?.name || 'NOMBRE').toUpperCase(), info: f.phrase || '' })
      break
    case 'tryouts':
      Object.assign(v, {
        kicker: 'Buscamos',
        title: (f.title || 'TRYOUTS').toUpperCase(),
        list: (f.roles || 'Duelista\nControlador').split('\n').filter(Boolean).map((x) => '•  ' + x.toUpperCase()).join('\n'),
        sub: f.reqs || 'Requisitos',
        info: [f.cta || 'Escribinos por DM', f.deadline && 'Hasta el ' + fmtDate(f.deadline)].filter(Boolean).join('  •  '),
      })
      break
    case 'roster':
      Object.assign(v, {
        kicker: f.season || `Temporada ${year()}`,
        title: 'ROSTER OFICIAL',
        list: people.map((p) => p.name.toUpperCase()).join('   ·   '),
        sub: r.staff.filter((s) => s.name).map((s) => `${s.role} ${s.name.toUpperCase()}`).join('   ·   '),
      })
      break
    case 'comunicado':
      Object.assign(v, { kicker: 'Radiant Shadows', title: (f.title || 'COMUNICADO OFICIAL').toUpperCase(), body: f.body || 'Texto del comunicado.' })
      break
    case 'comunidad':
      Object.assign(v, { kicker: f.kicker || 'Tip del día', title: (f.title || 'TITULAR').toUpperCase(), body: f.body || 'Texto breve y claro.' })
      break
    case 'stream':
      Object.assign(v, { kicker: 'En vivo', title: (f.title || 'STREAM ON').toUpperCase(), sub: twitchUrl(f.channel || 'radiant_shadowss'), info: f.time ? f.time + ' HS' : '' })
      break
    case 'mvp': {
      const scope = f.mvpScope || 'partido'
      Object.assign(v, {
        kicker: 'MVP',
        title: 'MVP',
        sub: (p0?.name || 'NICKNAME').toUpperCase(),
        info: p0?.realName || '',
        mvpHeader: `MVP ${scope === 'torneo' ? 'DEL TORNEO' : scope === 'semana' ? 'DE LA SEMANA' : 'DEL PARTIDO'}`,
        mvpScript: scope === 'torneo' ? 'del torneo' : scope === 'semana' ? 'de la semana' : 'del partido',
        mvpTop: `VALORANT · ${year()}`,
        kdaLabel: 'K / D / A',
        kda: `${f.kills || '0'} / ${f.deaths || '0'} / ${f.assists || '0'}`,
        acsLabel: 'ACS',
        acs: f.acs || '0',
        hsLabel: 'HS%',
        hs: (f.hs || '0') + '%',
        agentLabel: 'AGENTE',
        agent: (findAgent(f.agent)?.name || f.agent || 'AGENTE').toUpperCase(),
      })
      break
    }
    case 'competencia':
      Object.assign(v, {
        kicker: 'Nueva competencia',
        title: (f.tournament || 'TORNEO').toUpperCase(),
        sub: f.format || '',
        info: 'Arranca el ' + fmtDate(f.date),
      })
      break
  }
  // valores del diseño Neón
  const title = v.title || ''
  const words = title.split(/\s+/).filter(Boolean)
  let n1 = '',
    n2 = ''
  if (d.type === 'resultado') [n1, n2] = [title, v.score.replace(/\s+/g, ' ')]
  else if (words.length >= 2) [n1, n2] = [words[0], words.slice(1).join(' ')]
  else [n1, n2] = [(v.kicker || '').toUpperCase(), title]
  Object.assign(v, {
    neon1: n1,
    neon2: n2,
    neonTitle: d.type === 'matchday' || d.type === 'resultado' ? title : [n1, n2].filter(Boolean).join(' '),
    panelHeader: title,
    panelTitle: title,
    panelDate: [dayName(f.date), fmtDate(f.date).replace('/', '.'), f.time && f.time + ' ART'].filter(Boolean).join(' · '),
    panelDay: [dayName(f.date), fmtDate(f.date).replace('/', '.')].filter(Boolean).join(' '),
    panelRight: (d.type === 'matchday' ? [f.phase, f.tournament].filter(Boolean).join(' · ') || 'TORNEO' : v.sub || v.team).toUpperCase(),
    script: d.type === 'matchday' ? 'hoy' : d.type === 'resultado' && outcome(d) === 'win' ? 'ganamos' : '',
    patternRow: Array(3).fill(title).join(' · ') + ' ·',
    bigData: d.type === 'matchday' ? f.time || '--:--' : d.type === 'resultado' ? `${f.scoreUs || '0'}-${f.scoreThem || '0'}` : '',
    bigUnit: d.type === 'matchday' ? 'ART' : '',
    script2: d.type === 'matchday' ? 'a jugar' : d.type === 'resultado' && outcome(d) === 'win' ? 'ganamos' : d.type === 'torneo' && Number(f.place || 1) === 1 ? 'campeones' : '',
    rivalUpper: (f.rival || 'EQUIPO RIVAL').toUpperCase(),
    sideline: `${v.team} · VALORANT · TEMPORADA ${year()}`,
    neonLeft: (d.type === 'torneo' && !v.sub ? '' : d.type === 'cumple' ? v.sub : d.type === 'bienvenida' || d.type === 'despedida' ? v.sub : v.sub || v.team).toUpperCase(),
    neonRight: (d.type === 'matchday'
      ? [dayName(f.date), fmtDate(f.date).replace('/', '.'), f.time && f.time + ' ART'].filter(Boolean).join(' · ') || 'FECHA · HORA'
      : d.type === 'resultado'
        ? f.tournament || 'TORNEO'
        : d.type === 'bienvenida' && f.joinDate
          ? 'DESDE ' + fmtDate(f.joinDate).replace('/', '.')
          : at(p0) || v.hashtag
    ).toUpperCase(),
  })
  people.forEach((p, i) => {
    v[`personName:${i}`] = p.name.toUpperCase()
    v[`personRole:${i}`] = p.role.toUpperCase()
  })
  // overrides manuales del usuario sobre textos (prefijo "t:")
  for (const [k, val] of Object.entries(f)) if (k.startsWith('t:')) v[k.slice(2)] = val
  return v
}
