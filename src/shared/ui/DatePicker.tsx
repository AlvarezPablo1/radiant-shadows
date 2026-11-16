import { useState } from 'react'
import { addMonths, dayLabel, fromKey, monthLabel, monthWeeks, toKey, todayKey, WEEKDAYS } from '../calendar/dates'
import { cx } from '../lib/cx'
import { usePopover } from '../lib/usePopover'

interface Props {
  id?: string
  /** "AAAA-MM-DD" o vacío */
  value: string
  onChange: (value: string) => void
  required?: boolean
  /** primer día que se puede elegir ("AAAA-MM-DD") */
  min?: string
}

const plusDays = (n: number) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return toKey(d)
}

/**
 * Selector de fecha con el diseño del sitio: muestra el día escrito ("Miércoles 18 de noviembre"),
 * atajos para hoy, mañana y en una semana, y un calendario del mes para elegir cualquier otro día.
 */
export function DatePicker({ id, value, onChange, required, min }: Props) {
  const { anchor, panel, pos, isOpen, toggle, close } = usePopover<HTMLButtonElement>(304, 360)
  const [month, setMonth] = useState(() => (value ? fromKey(value) : new Date()))
  const today = todayKey()
  const allowed = (key: string) => !min || key >= min

  const openCalendar = () => {
    if (!isOpen) setMonth(value ? fromKey(value) : new Date())
    toggle()
  }
  const choose = (key: string) => {
    onChange(key)
    close()
    anchor.current?.focus()
  }
  const quick = [
    { label: 'Hoy', key: today },
    { label: 'Mañana', key: plusDays(1) },
    { label: 'En una semana', key: plusDays(7) },
  ].filter((q) => allowed(q.key))
  // no se puede ir a meses enteros antes del primer día permitido
  const canGoBack = !min || toKey(month).slice(0, 7) > min.slice(0, 7)

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="relative">
        <button
          ref={anchor}
          id={id}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          onClick={openCalendar}
          className={cx(
            'flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-[10px] border bg-night/60 py-2.5 pr-10 pl-3.5 text-left text-base outline-none transition-[border-color,box-shadow] duration-150',
            'focus-visible:border-violet-hi focus-visible:shadow-[0_0_0_3px_rgb(142_68_255/0.25)]',
            isOpen ? 'border-violet-hi shadow-[0_0_0_3px_rgb(142_68_255/0.25)]' : 'border-violet-hi/28',
          )}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 shrink-0 fill-none stroke-lilac stroke-2">
            <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
            <path d="M3.5 10h17M8 3v4M16 3v4" strokeLinecap="round" />
          </svg>
          <span className={cx('truncate', value ? 'text-fg' : 'text-muted')}>{value ? dayLabel(value) : 'Elegí un día'}</span>
        </button>
        {value && !required && (
          <button type="button" aria-label="Quitar la fecha" onClick={() => onChange('')} className="absolute top-1/2 right-2 grid size-7 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted hover:bg-violet/25 hover:text-white">
            ×
          </button>
        )}
        {/* para la validación del formulario; si el navegador le da foco, se lo pasa al botón */}
        <input tabIndex={-1} aria-hidden="true" required={required} value={value} onChange={() => {}} onFocus={() => anchor.current?.focus()} className="sr-only" />
      </div>

      {quick.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {quick.map((q) => (
            <button
              key={q.label}
              type="button"
              onClick={() => onChange(q.key)}
              className={cx(
                'cursor-pointer rounded-full border px-3 py-1 text-[13px] font-semibold transition-colors duration-150',
                value === q.key ? 'border-violet-hi bg-violet/40 text-white' : 'border-violet-hi/30 text-mist hover:border-violet-hi hover:text-white',
              )}
            >
              {q.label}
            </button>
          ))}
        </div>
      )}

      {pos && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Elegir día"
          style={{ position: 'fixed', ...pos, width: 304 }}
          className="z-100 animate-fade-in rounded-2xl border border-violet-hi/35 bg-[#0d0524] p-3 shadow-[0_18px_40px_rgb(0_0_0/0.6)]"
        >
          <div className="mb-2 flex items-center justify-between">
            <button type="button" aria-label="Mes anterior" disabled={!canGoBack} onClick={() => setMonth(addMonths(month, -1))} className="grid size-8 cursor-pointer place-items-center rounded-full text-lilac hover:bg-violet/25 disabled:cursor-default disabled:opacity-25">
              ‹
            </button>
            <span className="font-display text-[17px] tracking-[0.1em] text-white">{monthLabel(month).toUpperCase()}</span>
            <button type="button" aria-label="Mes siguiente" onClick={() => setMonth(addMonths(month, 1))} className="grid size-8 cursor-pointer place-items-center rounded-full text-lilac hover:bg-violet/25">
              ›
            </button>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center">
            {WEEKDAYS.map((d) => (
              <span key={d} className="pb-1 text-[11px] font-semibold tracking-[0.06em] text-muted">
                {d}
              </span>
            ))}
            {monthWeeks(month)
              .flat()
              .map((d) => {
                const ok = allowed(d.key)
                const on = d.key === value
                return (
                  <button
                    key={d.key}
                    type="button"
                    disabled={!ok}
                    onClick={() => choose(d.key)}
                    aria-label={dayLabel(d.key)}
                    aria-pressed={on}
                    className={cx(
                      'grid h-9 cursor-pointer place-items-center rounded-lg text-sm transition-colors duration-100 disabled:cursor-default disabled:opacity-25',
                      on ? 'bg-violet font-semibold text-white' : ok && 'hover:bg-violet/30',
                      !on && (d.inMonth ? 'text-fg' : 'text-muted/60'),
                      !on && d.key === today && 'ring-1 ring-lilac',
                    )}
                  >
                    {d.date.getDate()}
                  </button>
                )
              })}
          </div>
        </div>
      )}
    </div>
  )
}
