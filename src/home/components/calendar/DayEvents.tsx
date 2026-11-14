import { EVENT_TYPES, type CalendarEvent } from '../../../shared/content/events'
import { dayLabel, shortDayLabel } from '../../lib/calendar'

interface Props {
  selected: string
  events: CalendarEvent[]
  /** próximos eventos, para cuando el día elegido no tiene nada */
  upcoming: CalendarEvent[]
}

/** Panel al costado del calendario: eventos del día elegido o, si no hay, los próximos */
export function DayEvents({ selected, events, upcoming }: Props) {
  const empty = events.length === 0
  return (
    <aside aria-live="polite" className="flex flex-col gap-4">
      <div>
        <p className="font-display text-sm tracking-[0.3em] text-lilac">{empty ? 'SIN EVENTOS' : 'EVENTOS DEL DÍA'}</p>
        <h2 className="mt-1 font-display text-[34px] leading-none tracking-[0.03em] text-white">{dayLabel(selected).toUpperCase()}</h2>
      </div>

      {empty ? (
        <>
          <p className="text-sm text-muted">No hay nada programado para este día.</p>
          {upcoming.length > 0 && (
            <>
              <p className="mt-2 font-display text-sm tracking-[0.3em] text-lilac">PRÓXIMOS</p>
              <ul className="flex flex-col gap-3">
                {upcoming.map((e) => (
                  <EventCard key={e.date + e.title} event={e} showDate />
                ))}
              </ul>
            </>
          )}
        </>
      ) : (
        <ul className="flex flex-col gap-3">
          {events.map((e) => (
            <EventCard key={e.title + e.time} event={e} />
          ))}
        </ul>
      )}
    </aside>
  )
}

function EventCard({ event, showDate }: { event: CalendarEvent; showDate?: boolean }) {
  const type = EVENT_TYPES[event.type]
  return (
    <li style={{ borderColor: type.color }} className="rounded-2xl border-l-4 bg-night/55 p-4 backdrop-blur-sm">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span style={{ color: type.color }} className="font-display text-[15px] tracking-[0.16em]">
          {type.label.toUpperCase()}
          {event.team && <span className="text-muted"> · {event.team.toUpperCase()}</span>}
        </span>
        <span className="font-semibold text-fg">
          {showDate && <span className="text-muted">{shortDayLabel(event.date)} · </span>}
          {event.time ? `${event.time} hs` : 'Todo el día'}
        </span>
      </div>
      <p className="mt-1.5 text-[16px] font-semibold text-white">{event.title}</p>
      {event.description && <p className="mt-1 text-sm text-body">{event.description}</p>}
      {event.link && (
        <a
          href={event.link}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-2.5 inline-flex items-center gap-1.5 text-sm font-semibold text-lilac transition-colors hover:text-white"
        >
          Ver más
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-3.5 fill-none stroke-current stroke-[2.5]">
            <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </a>
      )}
    </li>
  )
}
