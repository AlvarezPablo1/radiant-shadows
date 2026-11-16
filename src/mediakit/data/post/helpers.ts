import type { Person } from '../../types'
import { handle } from '../roster'

export const year = () => String(new Date().getFullYear())
/** fecha de hoy (YYYY-MM-DD, hora local) */
export const todayISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
/** "twitch.tv/canal" a partir de lo escrito (el canal solo, o la dirección completa si la pegaron) */
export const twitchUrl = (v = '') => 'twitch.tv/' + v.trim().replace(/^(https?:\/\/)?(www\.)?twitch\.tv\//i, '').replace(/^@/, '')
const DAYS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB']
export const dayName = (s?: string) => (s ? DAYS[new Date(s + 'T12:00').getDay()] : '')
export const at = (p?: Person) => (p ? handle(p.ig) : '')
export const fmtDate = (s?: string) => {
  if (!s) return ''
  const [y, m, d] = s.split('-')
  return y && m && d ? `${d}/${m}` : s
}
