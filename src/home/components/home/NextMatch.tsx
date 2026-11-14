import { EVENT_TYPES } from '../../../shared/content/events'
import { dayLabel } from '../../lib/calendar'
import { eventStart, upcomingMatches } from '../../lib/events'
import { useContent } from '../../lib/useContent'
import { useNow } from '../../../shared/lib/hooks'
import { Reveal } from '../ui/Reveal'
import { ActionButton } from '../../../shared/ui/ActionButton'

/** Franja con el próximo partido y una cuenta regresiva en vivo (sale de los eventos del calendario) */
export function NextMatch() {
  const now = useNow()
  const next = upcomingMatches(useContent().events, 1)[0]
  if (!next) return null
  const color = EVENT_TYPES[next.type].color
  const left = Math.max(0, eventStart(next).getTime() - now)
  const parts: [number, string][] = [
    [Math.floor(left / 86_400_000), 'días'],
    [Math.floor(left / 3_600_000) % 24, 'horas'],
    [Math.floor(left / 60_000) % 60, 'min'],
    [Math.floor(left / 1000) % 60, 'seg'],
  ]

  return (
    <Reveal label="Próximo partido" className="mx-16 max-lg:mx-10 max-md:mx-4">
      <div className="relative flex items-center justify-between gap-10 overflow-hidden rounded-3xl border border-violet-hi/30 bg-[linear-gradient(110deg,rgb(122_40_226/0.35),rgb(0_0_16/0.65)_60%)] px-12 py-10 backdrop-blur-md max-lg:flex-col max-lg:items-start max-md:items-center max-md:px-6 max-md:py-8 max-md:text-center">
        <div>
          <p className="font-display text-[15px] tracking-[0.3em] text-lilac">PRÓXIMO PARTIDO</p>
          <p className="mt-2 font-brand-title text-[clamp(20px,2.2vw,33px)] text-white">
            {next.opponent ? (
              <>
                RS <span className="text-muted">VS</span> {next.opponent.toUpperCase()}
              </>
            ) : (
              next.title.toUpperCase()
            )}
          </p>
          <p className="mt-3 text-[15px] text-body">
            <span style={{ color }} className="font-semibold">
              {EVENT_TYPES[next.type].label}
            </span>
            {next.team && ` · ${next.team}`}
            {next.opponent && ` · ${next.title}`}
            <br />
            {dayLabel(next.date)}
            {next.time && ` · ${next.time} hs (ARG)`}
          </p>
        </div>

        <div className="flex flex-col items-end gap-5 max-lg:items-start max-md:items-center">
          <ol aria-label="Cuenta regresiva" className="flex gap-3">
            {parts.map(([value, label]) => (
              <li key={label} className="flex w-20 flex-col items-center rounded-2xl border border-white/10 bg-night/60 py-3 max-md:w-16">
                <span className="font-display text-[40px] leading-none text-white tabular-nums max-md:text-[32px]">{String(value).padStart(2, '0')}</span>
                <span className="mt-1 text-[11px] font-semibold tracking-wider text-muted uppercase">{label}</span>
              </li>
            ))}
          </ol>
          <ActionButton href="/calendario" variant="ghost">
            VER CALENDARIO
          </ActionButton>
        </div>
      </div>
    </Reveal>
  )
}
