import { DEFAULT_TYPES, styleOf, type CalendarItem, type TypeStyles } from './types'
import { fromKey, todayKey } from './dates'
import { useInView } from '../lib/hooks'
import { cx } from '../lib/cx'

interface Props {
  matches: CalendarItem[]
  /** al tocar un partido: mostrar ese día en el calendario */
  onPick: (dateKey: string) => void
  types?: TypeStyles
  title?: string
  empty?: string
}

const monthFmt = new Intl.DateTimeFormat('es-AR', { month: 'short' })
const weekdayFmt = new Intl.DateTimeFormat('es-AR', { weekday: 'long' })
const relative = new Intl.RelativeTimeFormat('es-AR', { numeric: 'auto' })

/** "hoy", "mañana", "en 4 días" */
function whenLabel(key: string) {
  const days = Math.round((fromKey(key).getTime() - fromKey(todayKey()).getTime()) / 86_400_000)
  return relative.format(days, 'day')
}

/** Sección debajo del calendario con los próximos partidos (o eventos) en tarjetas */
export function UpcomingMatches({ matches, onPick, types = DEFAULT_TYPES, title = 'PRÓXIMOS PARTIDOS', empty = 'Todavía no hay partidos programados. ¡Atentos a las redes!' }: Props) {
  const [ref, visible] = useInView<HTMLElement>(0.1)
  return (
    <section
      ref={ref}
      aria-labelledby="matches-title"
      className={cx(
        'mx-16 mt-20 max-lg:mx-10 max-md:mx-3 max-md:mt-14',
        'transition-[opacity,translate] duration-700 ease-out-soft',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <h2 id="matches-title" className="text-center font-brand-title text-[clamp(22px,2.5vw,35px)] text-white">
        {title}
      </h2>

      {matches.length === 0 ? (
        <p className="mt-6 text-center text-muted">{empty}</p>
      ) : (
        <ul className="mt-10 grid grid-cols-3 gap-5 max-lg:grid-cols-2 max-md:grid-cols-1">
          {matches.map((m) => (
            <li key={m.date + m.time + m.title}>
              <MatchCard match={m} onPick={onPick} types={types} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function MatchCard({ match, onPick, types }: { match: CalendarItem; onPick: (dateKey: string) => void; types: TypeStyles }) {
  const date = fromKey(match.date)
  const color = styleOf(types, match.type).color
  return (
    <button
      type="button"
      onClick={() => onPick(match.date)}
      aria-label={`${match.title}, ${weekdayFmt.format(date)} ${date.getDate()}${match.time ? ` a las ${match.time}` : ''}. Ver en el calendario`}
      className="group flex h-full w-full cursor-pointer items-stretch overflow-hidden rounded-3xl border border-violet-hi/25 bg-night/55 text-left backdrop-blur-md transition-[border-color,translate,box-shadow] duration-200 hover:-translate-y-1 hover:border-violet-hi/70 hover:shadow-[0_18px_40px_-18px_rgb(142_68_255/0.7)]"
    >
      {/* bloque de la fecha */}
      <span
        style={{ background: `linear-gradient(to bottom, ${color}55, ${color}18)` }}
        className="flex w-24 shrink-0 flex-col items-center justify-center border-r border-white/8 py-5"
      >
        <span className="font-display text-[15px] tracking-[0.2em] text-mist">{monthFmt.format(date).replace('.', '').toUpperCase()}</span>
        <span className="font-display text-[52px] leading-none text-white">{date.getDate()}</span>
        <span className="mt-1.5 px-2 text-center text-[10px] leading-tight font-semibold tracking-wide text-mist/80 uppercase">{whenLabel(match.date)}</span>
      </span>

      <span className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 px-5 py-5">
        <span className="flex flex-wrap items-center gap-2 text-xs">
          <span style={{ color }} className="font-display text-[15px] tracking-[0.16em]">
            {styleOf(types, match.type).label.toUpperCase()}
          </span>
          {match.team && <span className="rounded-full bg-violet/30 px-2 pt-0.5 font-display text-[13px] tracking-[0.12em] text-lilac">{match.team.toUpperCase()}</span>}
        </span>

        {match.opponent ? (
          <span className="font-display text-[26px] leading-tight tracking-[0.03em] text-white">
            RS <span className="text-muted">VS</span> {match.opponent.toUpperCase()}
          </span>
        ) : (
          <span className="font-display text-[26px] leading-tight tracking-[0.03em] text-white">{match.title.toUpperCase()}</span>
        )}
        {match.opponent && <span className="truncate text-sm text-body">{match.title}</span>}

        <span className="flex items-center gap-1.5 text-sm text-mist">
          <ClockIcon />
          {match.time ? `${match.time} hs` : 'Horario a confirmar'}
          <span className="ml-auto text-xs text-muted transition-colors group-hover:text-lilac">Ver en el calendario →</span>
        </span>
      </span>
    </button>
  )
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-2">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" strokeLinecap="round" />
    </svg>
  )
}
