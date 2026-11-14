import { placeColor, type Achievement } from '../../data/achievements'
import { Reveal } from '../Reveal'

/** Un logro: el puesto bien grande con su color (oro, plata, bronce) y el torneo, el equipo y quién lo organizó */
export function AchievementCard({ achievement }: { achievement: Achievement }) {
  const { place, result, tournament, organizer, team, when } = achievement
  const color = placeColor(place)
  return (
    <Reveal as="div" className="h-full">
      <article
        style={{ borderColor: `${color}55` }}
        className="relative flex h-full items-center gap-8 overflow-hidden rounded-3xl border bg-[linear-gradient(120deg,rgb(122_40_226/0.28),rgb(0_0_16/0.65)_65%)] p-9 backdrop-blur-md max-md:flex-col max-md:gap-4 max-md:p-7 max-md:text-center"
      >
        {/* brillo del color del puesto */}
        <span aria-hidden="true" style={{ background: `radial-gradient(circle, ${color}40, transparent 70%)` }} className="absolute -top-16 -left-16 size-64" />

        <div className="relative flex shrink-0 flex-col items-center">
          <TrophyIcon color={color} />
          <span style={{ color }} className="mt-1 font-display text-[64px] leading-none [text-shadow:0_0_24px_currentColor]">
            {place}°
          </span>
        </div>

        <div className="relative flex min-w-0 flex-col max-md:items-center">
          <span style={{ color }} className="font-display text-[17px] tracking-[0.3em]">
            {result.toUpperCase()}
          </span>
          <h2 className="mt-1 font-brand-title text-[clamp(22px,2.2vw,33px)] text-white">
            {tournament.toUpperCase()}
          </h2>
          <p className="mt-3 flex flex-wrap items-center gap-2 text-sm text-body max-md:justify-center">
            <span className="rounded-full bg-violet/30 px-3 pt-1 pb-0.5 font-display text-[15px] tracking-[0.12em] text-lilac">{team.toUpperCase()}</span>
            {organizer && <span>Organizado por {organizer}</span>}
            {when && <span className="text-muted">· {when}</span>}
          </p>
        </div>
      </article>
    </Reveal>
  )
}

function TrophyIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-14" fill="none" stroke={color} strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4" />
    </svg>
  )
}
