import { DEFAULT_TYPES, styleOf, type CalendarItem, type TypeStyles } from './types'
import { WEEKDAYS, monthWeeks, todayKey } from './dates'
import { cx } from '../lib/cx'

interface Props {
  month: Date
  /** eventos agrupados por día ("AAAA-MM-DD") */
  byDay: Map<string, CalendarItem[]>
  selected: string
  onSelect: (key: string) => void
  /** colores de cada tipo (por defecto, los del calendario de la web) */
  types?: TypeStyles
}

/** Grilla del mes: un casillero por día con sus eventos; el día elegido muestra el detalle al costado */
export function MonthGrid({ month, byDay, selected, onSelect, types = DEFAULT_TYPES }: Props) {
  const today = todayKey()
  return (
    <div role="grid" aria-label="Calendario" className="flex flex-col gap-1.5 max-md:gap-1">
      <div role="row" className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1.5 max-md:gap-1">
        {WEEKDAYS.map((d) => (
          <span key={d} role="columnheader" className="pb-2 text-center font-display text-[15px] tracking-[0.18em] text-muted max-md:text-[12px] max-md:tracking-[0.08em]">
            {d.toUpperCase()}
          </span>
        ))}
      </div>

      {monthWeeks(month).map((week) => (
        <div key={week[0].key} role="row" className="grid grid-cols-[repeat(7,minmax(0,1fr))] gap-1.5 max-md:gap-1">
          {week.map(({ date, key, inMonth }) => {
            const events = byDay.get(key) ?? []
            const isToday = key === today
            const isSelected = key === selected
            return (
              <button
                key={key}
                type="button"
                role="gridcell"
                aria-selected={isSelected}
                aria-label={`${date.getDate()}${events.length ? `, ${events.length} evento${events.length > 1 ? 's' : ''}` : ''}`}
                onClick={() => onSelect(key)}
                className={cx(
                  'flex min-h-28 min-w-0 cursor-pointer flex-col gap-1.5 rounded-xl border p-2 text-left transition-colors duration-150 max-md:min-h-14 max-md:items-center max-md:p-1.5',
                  isSelected ? 'border-violet-hi bg-violet/30 shadow-[0_0_20px_rgb(142_68_255/0.35)]' : 'border-white/6 bg-night/40 hover:border-violet-hi/50 hover:bg-violet/15',
                  !inMonth && 'opacity-35',
                )}
              >
                <span
                  className={cx(
                    'grid size-7 place-items-center rounded-full text-sm font-semibold max-md:size-6 max-md:text-[13px]',
                    isToday ? 'bg-cta text-white shadow-[0_0_12px_rgb(142_68_255/0.7)]' : 'text-fg',
                  )}
                >
                  {date.getDate()}
                </span>

                {/* escritorio: nombre de cada evento; celular: sólo puntos de color */}
                <span className="flex w-full flex-col gap-1 max-md:hidden">
                  {events.slice(0, 2).map((e) => (
                    <span
                      key={e.title + e.time}
                      style={{ borderColor: styleOf(types, e.type).color }}
                      className="truncate rounded-md border-l-[3px] bg-white/6 px-1.5 py-0.5 text-[11px] leading-tight text-fg"
                    >
                      {e.time && <span className="text-muted">{e.time} </span>}
                      {e.title}
                    </span>
                  ))}
                  {events.length > 2 && <span className="px-1.5 text-[11px] text-muted">+{events.length - 2} más</span>}
                </span>
                <span className="hidden gap-1 max-md:flex">
                  {events.map((e) => (
                    <i key={e.title + e.time} style={{ background: styleOf(types, e.type).color }} className="size-1.5 rounded-full" />
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      ))}
    </div>
  )
}
