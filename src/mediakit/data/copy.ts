import type { PostDoc, Roster, Person } from '../types'
import { computeValues, outcome, selectedPeople, twitchUrl } from './postTypes'
import { handle } from './roster'

/**
 * Generador de copys "a mano": plantillas cortas con la voz del equipo, sin negritas
 * (en IG/X se verían los asteriscos) y con el roster etiquetado con [ROL] → @cuenta.
 */

export type Network = 'ig' | 'x'

const at = (p: Person, net: Network) => handle(net === 'x' ? p.x || p.ig : p.ig || p.x)
const tag = (p: Person, net: Network) => at(p, net) || p.name || `[${p.role}]`

export function rosterBlock(r: Roster, people: Person[], net: Network, withStaff = true) {
  const lines = people.filter((p) => r.players.includes(p)).map((p) => tag(p, net))
  if (withStaff)
    for (const s of r.staff) {
      const acc = at(s, net) || s.name
      if (acc) lines.push(`[${s.role}] ${acc}`)
    }
  return lines.join('\n')
}

const pick = <T,>(arr: T[], i: number) => arr[((i % arr.length) + arr.length) % arr.length]
const tournament = (d: PostDoc) => d.fields.tournament || '[TORNEO]'

export function generateCopy(d: PostDoc, r: Roster, net: Network, variant: number, hashtags: string[]): string {
  const v = computeValues(d, r)
  const people = selectedPeople(d, r)
  const p0 = people[0]
  const f = d.fields
  const rival = f.rival || '[RIVAL]'
  const tags = hashtags.join(' ')
  const team = r.id === 'gc' ? 'Radiant Shadows GC' : 'Radiant Shadows'
  const block = (title = 'Roster oficial:') => `${title}\n${rosterBlock(r, people, net)}`
  const date = [v.info && d.type === 'matchday' ? v.info.replace('  •  ', ' · ') : ''].filter(Boolean).join('')
  let body = ''

  switch (d.type) {
    case 'matchday':
      body = pick(
        [
          `Hoy jugamos ${tournament(d)}.\n\nEnfrentamos a ${rival}${date ? ` · ${date}` : ''}.${f.where ? `\nLo ves en ${twitchUrl(f.where)}` : ''}\n\n${block()}`,
          `Día de partido 🐉\n\n${tournament(d)}${f.phase ? ` · ${f.phase}` : ''}\nVS ${rival}${date ? `\n${date}` : ''}\n\n${block('Salen a la cancha:')}`,
          `Se viene ${rival}. ${tournament(d)}${date ? `, ${date}` : ''}.\nA dejar todo.\n\n${block()}`,
        ],
        variant,
      )
      break
    case 'resultado': {
      const o = outcome(d)
      const score = `${f.scoreUs || 'X'}-${f.scoreThem || 'X'}`
      body =
        o === 'draw'
          ? pick(
              [
                `Empate ${score} ante ${rival} en ${tournament(d)}.\nPunto a punto, seguimos sumando.\n\n${block()}`,
                `${score} frente a ${rival}. Reparto de puntos y a seguir.\n\n${block()}`,
              ],
              variant,
            )
          : o === 'loss'
          ? pick(
              [
                `Hoy no se dio. Caímos ${score} ante ${rival} en ${tournament(d)}.\nSe aprende, se ajusta y se vuelve.\n\n${block()}`,
                `Derrota ${score} frente a ${rival}.\nNo cambia quiénes somos. El fuego sigue.\n\n${block()}`,
              ],
              variant,
            )
          : pick(
              [
                `Victoria ${score} ante ${rival} en ${tournament(d)} 🔥\n\nGran trabajo del equipo.\n\n${block()}`,
                `Ganamos ${score} frente a ${rival}.\nUn paso más en ${tournament(d)}.\n\n${block()}`,
                `${score}. Así se juega.\nGracias ${rival} por el partido.\n\n${block()}`,
              ],
              variant,
            )
      break
    }
    case 'torneo': {
      const n = Number(f.place || 1)
      const what = n === 1 ? 'campeones' : n === 2 ? 'subcampeones' : n === 5 ? 'top 8' : `${n}° puesto`
      if (n === 6) {
        body = pick(
          [
            `Cerramos nuestra participación en ${tournament(d)}.\nGracias a todos los que acompañaron. Volvemos más fuertes.\n\n${block()}`,
            `Fuimos parte de ${tournament(d)}. Mucho aprendizaje y ganas de más.\n\n${block()}`,
          ],
          variant,
        )
        break
      }
      body =
        n === 1
          ? pick(
              [`SOMOS CAMPEONES de ${tournament(d)} 🏆\n\nOrgullo total por este equipo.${f.prize ? `\n${f.prize}.` : ''}\n\n${block()}`, `Campeones de ${tournament(d)}.\nTrabajo, paciencia y fuego.\n\n${block()}`],
              variant,
            )
          : pick(
              [
                `Terminamos ${what} en ${tournament(d)}.${f.prize ? `\n${f.prize}.` : ''}\nOrgullosos del camino. Vamos por más.\n\n${block()}`,
                `${what[0].toUpperCase() + what.slice(1)} en ${tournament(d)}.\nGracias a todos los que acompañaron.\n\n${block()}`,
              ],
              variant,
            )
      break
    }
    case 'bienvenida':
      body = pick(
        [
          `Bienvenido a ${team}, ${p0 ? tag(p0, net) : '[JUGADOR]'}.\n\nSe suma como ${p0?.role || '[ROL]'}${f.joinDate ? ` desde el ${f.joinDate.split('-').reverse().slice(0, 2).join('/')}` : ''}.\n${f.phrase || 'Un dragón más en la familia.'}`,
          `Nueva incorporación 🐉\n\n${p0 ? tag(p0, net) : '[JUGADOR]'} es parte de ${team} como ${p0?.role || '[ROL]'}.\nA romperla.`,
        ],
        variant,
      )
      break
    case 'despedida':
      body = pick(
        [
          `Hoy despedimos a ${p0 ? tag(p0, net) : '[JUGADOR]'}.\n\nGracias por cada ronda, cada entreno y todo lo que dejaste en ${team}.\nTe deseamos lo mejor en lo que viene.`,
          `Gracias, ${p0?.name || '[JUGADOR]'} (${p0 ? at(p0, net) || '[@]' : '[@]'}).\n${f.phrase || 'Siempre vas a ser parte de esta historia.'}`,
        ],
        variant,
      )
      break
    case 'cumple':
      body = pick(
        [`Hoy cumple ${p0 ? tag(p0, net) : '[JUGADOR]'} 🎂\n\nQue tengas un gran día. Desde ${team} te mandamos un abrazo enorme.`, `Feliz cumple, ${p0?.name || '[JUGADOR]'}.\n${f.phrase || 'Que este año arda más que nunca.'}\n${p0 ? at(p0, net) : ''}`],
        variant,
      )
      break
    case 'tryouts':
      body = pick(
        [
          `Abrimos tryouts.\n\nBuscamos:\n${(f.roles || '[ROL]').split('\n').filter(Boolean).map((x) => '· ' + x).join('\n')}\n\nRequisitos: ${f.reqs || '[REQUISITOS]'}\n${f.cta || 'Escribinos por DM'}${f.deadline ? ` hasta el ${f.deadline.split('-').reverse().slice(0, 2).join('/')}` : ''}.`,
          `¿Querés ser parte de ${team}?\nBuscamos ${(f.roles || '[ROL]').split('\n').filter(Boolean).join(', ')}.\n\n${f.cta || 'Escribinos por DM'}.`,
        ],
        variant,
      )
      break
    case 'roster':
      body = pick([`${v.kicker}.\nEste es nuestro roster oficial.\n\n${block('')}`.replace('\n\n\n', '\n\n'), `Presentamos el roster de ${team} para ${v.kicker}.\n\n${block('')}`], variant)
      break
    case 'comunicado':
      body = `${f.title || 'Comunicado oficial'}\n\n${f.body || '[TEXTO]'}`
      break
    case 'comunidad':
      body = pick([`${f.kicker || 'Tip del día'}: ${f.title || '[TEMA]'}\n\n${f.body || '[TEXTO]'}\n\n¿Lo sabías? Contanos abajo.`, `${f.title || '[TEMA]'}\n${f.body || '[TEXTO]'}`], variant)
      break
    case 'mvp': {
      const scope = f.mvpScope === 'torneo' ? 'del torneo' : f.mvpScope === 'semana' ? 'de la semana' : 'del partido'
      const stats = `${f.kills || 'X'}/${f.deaths || 'X'}/${f.assists || 'X'} · ${f.acs || 'X'} ACS · ${f.hs || 'X'}% HS${f.agent ? ` con ${f.agent}` : ''}`
      body = pick(
        [
          `MVP ${scope}: ${p0 ? tag(p0, net) : '[JUGADOR]'}\n\n${stats}${f.rival ? `\nFrente a ${f.rival}` : ''}${f.tournament ? ` en ${f.tournament}` : ''}.`,
          `${p0?.name || '[JUGADOR]'} se llevó el MVP ${scope}.\n${stats}\n${p0 ? at(p0, net) : ''}`,
        ],
        variant,
      )
      break
    }
    case 'competencia':
      body = pick(
        [
          `Confirmado: vamos a jugar ${tournament(d)}.${f.format ? `\nFormato: ${f.format}.` : ''}\nArrancamos el ${(f.date || '').split('-').reverse().slice(0, 2).join('/') || '[FECHA]'}.\n\n${block()}`,
          `Nueva competencia: ${tournament(d)}.\nSe viene, a dejar todo.\n\n${block()}`,
        ],
        variant,
      )
      break
    case 'stream':
      body = pick([`Estamos en vivo 🔴\n${f.channel ? twitchUrl(f.channel) : '[CANAL]'}${f.time ? `\nDesde las ${f.time} hs` : ''}`, `Stream ON. Pasá a saludar.\n${f.channel ? twitchUrl(f.channel) : '[CANAL]'}`], variant)
      break
  }
  return `${body.trim()}\n\n${tags}`.trim()
}

export const COPY_VARIANTS = 3
