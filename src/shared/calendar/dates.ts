/* Utilidades de fechas para el calendario. Todo en fechas locales (sin zonas horarias). */

/** "AAAA-MM-DD" de una fecha local */
export const toKey = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

/** Fecha local a partir de "AAAA-MM-DD" (sin el corrimiento de zona horaria de new Date(string)) */
export const fromKey = (key: string) => {
  const [y, m, d] = key.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export const todayKey = () => toKey(new Date())

/** Primer día del mes `offset` meses después de `date` */
export const addMonths = (date: Date, offset: number) => new Date(date.getFullYear(), date.getMonth() + offset, 1)

/**
 * Semanas del mes (lunes a domingo). Incluye los días del mes anterior y siguiente
 * que completan la primera y la última semana; `inMonth` dice si es del mes mostrado.
 */
export function monthWeeks(month: Date) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1)
  const lead = (first.getDay() + 6) % 7 // lunes = 0
  const start = new Date(first.getFullYear(), first.getMonth(), 1 - lead)
  const days = Array.from({ length: 42 }, (_, i) => {
    const date = new Date(start.getFullYear(), start.getMonth(), start.getDate() + i)
    return { date, key: toKey(date), inMonth: date.getMonth() === month.getMonth() }
  })
  const weeks = Array.from({ length: 6 }, (_, w) => days.slice(w * 7, w * 7 + 7))
  // sacar la última semana si es entera del mes siguiente
  return weeks.filter((week, i) => i < 5 || week.some((d) => d.inMonth))
}

export const WEEKDAYS = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']

const monthFmt = new Intl.DateTimeFormat('es-AR', { month: 'long', year: 'numeric' })
const dayFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'long', day: 'numeric', month: 'long' })
const shortFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

/** "Noviembre de 2026" */
export const monthLabel = (d: Date) => capitalize(monthFmt.format(d))
/** "Miércoles 18 de noviembre" */
export const dayLabel = (key: string) => capitalize(dayFmt.format(fromKey(key)))
/** "mié 18 nov" */
export const shortDayLabel = (key: string) => shortFmt.format(fromKey(key)).replace(/\./g, '')
