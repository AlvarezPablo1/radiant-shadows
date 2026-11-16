import type { PostDoc } from '../../types'

/** resultado del partido: lo elige el usuario (Victoria/Derrota/Empate) o se deduce del marcador */
export function outcome(d: PostDoc): 'win' | 'loss' | 'draw' | undefined {
  if (d.type !== 'resultado') return undefined
  const o = d.fields.outcome
  if (o === 'win' || o === 'loss' || o === 'draw') return o
  const a = Number(d.fields.scoreUs),
    b = Number(d.fields.scoreThem)
  if (!d.fields.scoreUs || isNaN(a) || isNaN(b)) return undefined
  return a > b ? 'win' : a < b ? 'loss' : 'draw'
}

export function isWin(d: PostDoc): boolean | undefined {
  if (d.type === 'torneo') return Number(d.fields.place || 1) <= 3
  const o = outcome(d)
  return o === 'win' ? true : o === 'loss' ? false : undefined
}
