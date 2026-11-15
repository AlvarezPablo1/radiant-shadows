import { useMemo, useRef, useState } from 'react'
import { DayEvents } from '../shared/calendar/DayEvents'
import { addMonths, fromKey, monthLabel, todayKey } from '../shared/calendar/dates'
import { sortByDate } from '../shared/calendar/events'
import { MonthGrid } from '../shared/calendar/MonthGrid'
import { UpcomingMatches } from '../shared/calendar/UpcomingEvents'
import { cx } from '../shared/lib/cx'
import { AGENDA_TYPES, type AgendaEvent } from './types'

interface Props {
  events: AgendaEvent[]
  /** tocar un día vacío: agregar un evento en ese día */
  onAdd: (date: string) => void
  onEdit: (e: AgendaEvent) => void
}

/**
 * El mismo calendario de la web, para la agenda del staff: tocar un día vacío abre el formulario para agregar
 * un evento ahí; si el día ya tiene eventos, se ven al costado (tocarlos los edita) con el botón para sumar otro.
 * Debajo, los próximos eventos.
 */
export function AgendaCalendar({ events, onAdd, onEdit }: Props) {
  const [selected, setSelected] = useState(todayKey)
  const [month, setMonth] = useState(() => addMonths(new Date(), 0))
  const calendar = useRef<HTMLElement>(null)

  const byDay = useMemo(() => {
    const map = new Map<string, AgendaEvent[]>()
    for (const e of [...events].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))) map.set(e.date, [...(map.get(e.date) ?? []), e])
    return map
  }, [events])
  const upcoming = useMemo(() => sortByDate(events.filter((e) => e.date >= todayKey())), [events])

  const select = (key: string) => {
    setSelected(key)
    const d = fromKey(key)
    if (d.getMonth() !== month.getMonth()) setMonth(addMonths(d, 0))
    if (!byDay.get(key)?.length) onAdd(key)
  }
  const pick = (key: string) => {
    setSelected(key)
    setMonth(addMonths(fromKey(key), 0))
    calendar.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <>
      <section
        ref={calendar}
        aria-label="Agenda de contenido"
        className="mx-16 mt-10 grid scroll-mt-6 grid-cols-[minmax(0,1fr)_340px] gap-8 rounded-3xl border border-violet-hi/25 bg-[linear-gradient(to_bottom,rgb(116_21_193/0.18),rgb(0_0_16/0.6))] p-8 backdrop-blur-md max-lg:mx-10 max-lg:grid-cols-1 max-md:mx-3 max-md:mt-6 max-md:p-4"
      >
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[40px] leading-none tracking-[0.03em] text-white max-md:text-[30px]">{monthLabel(month).toUpperCase()}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={() => (setSelected(todayKey()), setMonth(addMonths(new Date(), 0)))} className={navBtn + ' px-4'}>
                HOY
              </button>
              <button type="button" aria-label="Mes anterior" onClick={() => setMonth((m) => addMonths(m, -1))} className={navBtn + ' w-10'}>
                <Arrow className="rotate-180" />
              </button>
              <button type="button" aria-label="Mes siguiente" onClick={() => setMonth((m) => addMonths(m, 1))} className={navBtn + ' w-10'}>
                <Arrow />
              </button>
            </div>
          </div>
          <MonthGrid month={month} byDay={byDay} selected={selected} onSelect={select} types={AGENDA_TYPES} />
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
            {Object.values(AGENDA_TYPES).map((t) => (
              <li key={t.label} className="flex items-center gap-2">
                <i style={{ background: t.color }} className="size-2.5 rounded-full" />
                {t.label}
              </li>
            ))}
          </ul>
        </div>
        <DayEvents
          selected={selected}
          events={byDay.get(selected) ?? []}
          upcoming={upcoming.slice(0, 4)}
          types={AGENDA_TYPES}
          onEdit={(e) => onEdit(e as AgendaEvent)}
          onAdd={() => onAdd(selected)}
        />
      </section>
      <UpcomingMatches matches={upcoming.slice(0, 9)} onPick={pick} types={AGENDA_TYPES} title="PRÓXIMOS EVENTOS" empty="Todavía no hay nada agendado. Tocá un día del calendario para agregar." />
    </>
  )
}

const navBtn =
  'grid h-10 cursor-pointer place-items-center rounded-full border border-violet-hi/40 bg-night/50 font-display text-[18px] tracking-[0.1em] text-mist transition-colors duration-150 hover:border-violet-hi hover:bg-violet/30 hover:text-white'

function Arrow({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('size-5 fill-none stroke-current stroke-[2.5]', className)}>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
