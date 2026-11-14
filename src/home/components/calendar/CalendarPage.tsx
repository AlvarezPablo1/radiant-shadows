import { useMemo, useRef, useState } from 'react'
import { EVENT_TYPES, EVENTS, type CalendarEvent } from '../../data/events'
import { upcomingEvents, upcomingMatches } from '../../lib/events'
import { addMonths, fromKey, monthLabel, todayKey } from '../../lib/calendar'
import { cx } from '../../lib/cx'
import { enter } from '../../lib/enter'
import type { Page } from '../../types'
import { PageHeader } from '../PageHeader'
import { DayEvents } from './DayEvents'
import { MonthGrid } from './MonthGrid'
import { UpcomingMatches } from './UpcomingMatches'

/** Calendario mensual con los eventos de data/events.ts (al tocar un día se ve su detalle) y debajo los próximos partidos */
export function CalendarPage({ page, ready }: { page: Page; ready: boolean }) {
  const [selected, setSelected] = useState(todayKey)
  const [month, setMonth] = useState(() => addMonths(new Date(), 0))

  const byDay = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>()
    for (const e of [...EVENTS].sort((a, b) => (a.time ?? '').localeCompare(b.time ?? ''))) {
      map.set(e.date, [...(map.get(e.date) ?? []), e])
    }
    return map
  }, [])
  const upcoming = useMemo(() => upcomingEvents(4), [])
  const matches = useMemo(() => upcomingMatches(6), [])
  const calendar = useRef<HTMLElement>(null)

  // elegir un día de otro mes (los grises) también cambia de mes
  const select = (key: string) => {
    setSelected(key)
    const d = fromKey(key)
    if (d.getMonth() !== month.getMonth()) setMonth(addMonths(d, 0))
  }
  // desde "Próximos partidos": mostrar ese día y subir al calendario
  const pick = (key: string) => {
    select(key)
    calendar.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  const goToday = () => {
    setSelected(todayKey())
    setMonth(addMonths(new Date(), 0))
  }

  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />

      <section
        ref={calendar}
        aria-label="Calendario de eventos"
        className={cx(
          'mx-16 mt-12 grid scroll-mt-[calc(var(--header-h)+16px)] grid-cols-[minmax(0,1fr)_340px] gap-8 rounded-3xl border border-violet-hi/25 bg-[linear-gradient(to_bottom,rgb(122_40_226/0.18),rgb(0_0_16/0.6))] p-8 backdrop-blur-md',
          'max-lg:mx-10 max-lg:grid-cols-1 max-md:mx-3 max-md:mt-8 max-md:p-4',
          enter(ready, 'delay-240'),
        )}
      >
        <div>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-[40px] leading-none tracking-[0.03em] text-white max-md:text-[30px]">{monthLabel(month).toUpperCase()}</h2>
            <div className="flex items-center gap-2">
              <button type="button" onClick={goToday} className={navBtn + ' px-4'}>
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
          <MonthGrid month={month} byDay={byDay} selected={selected} onSelect={select} />
          <Legend />
        </div>

        <DayEvents selected={selected} events={byDay.get(selected) ?? []} upcoming={upcoming} />
      </section>

      <UpcomingMatches matches={matches} onPick={pick} />
    </main>
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

/** Referencia de colores por tipo de evento */
function Legend() {
  return (
    <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
      {Object.values(EVENT_TYPES).map((t) => (
        <li key={t.label} className="flex items-center gap-2">
          <i style={{ background: t.color }} className="size-2.5 rounded-full" />
          {t.label}
        </li>
      ))}
    </ul>
  )
}
