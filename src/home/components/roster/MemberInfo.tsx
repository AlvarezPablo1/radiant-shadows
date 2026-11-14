import type { ReactNode } from 'react'
import type { Member } from '../../data/rosters'
import { rankIcon } from '../../data/ranks'
import { cx } from '../../lib/cx'

interface Props {
  member: Member
  showRank: boolean
  open: boolean
}

/** Nombre siempre visible; al seleccionar sube la ficha con rol, rango, nacionalidad, edad y link a sus stats */
export function MemberInfo({ member, showRank, open }: Props) {
  const icon = rankIcon(member.rank)
  const rank = (
    <span className="flex items-center gap-1.5">
      {icon && <img src={icon} alt="" className="size-5" />}
      {member.rank ?? '—'}
    </span>
  )
  const rows: [string, ReactNode][] = [
    ...(showRank ? [['Rango', rank] as [string, ReactNode]] : []),
    ['Nacionalidad', member.nationality ? `${member.flag ?? ''} ${member.nationality}`.trim() : '—'],
    ['Edad', member.age ? `${member.age} años` : '—'],
  ]
  return (
    <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-3 pb-5 text-center">
      <span className="font-display text-[clamp(28px,2.8vw,44px)] leading-none tracking-[0.06em] text-white [text-shadow:3px_3px_0_var(--color-violet),0_2px_16px_var(--color-night)]">
        {member.name.toUpperCase()}
      </span>
      <span
        className={cx(
          'grid w-full max-w-72 transition-[grid-template-rows,opacity] duration-300 ease-out-soft',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <span className="overflow-hidden">
          <span className="mt-2.5 inline-block rounded-full bg-cta px-4.5 pt-1.5 pb-1 font-display text-[19px] tracking-[0.16em] text-white shadow-[0_0_18px_rgb(142_68_255/0.65)]">
            {(member.role ?? 'Jugador').toUpperCase()}
          </span>
          <span className="relative mt-3 flex flex-col gap-1.5 px-3 pt-2.5 pb-4 text-[13px]">
            {/* fondo de la ficha: se desvanece hacia abajo en vez de cortar en seco */}
            <span aria-hidden="true" className="absolute inset-0 -bottom-4 rounded-t-xl bg-night/80 backdrop-blur-sm mask-b-from-45% mask-b-to-100%" />
            {rows.map(([label, value]) => (
              <span key={label} className="relative flex justify-between gap-3 border-b border-white/8 pb-1.5 last:border-0">
                <span className="text-muted">{label}</span>
                <span className="font-semibold text-fg">{value}</span>
              </span>
            ))}
            {member.tracker && <TrackerLink url={member.tracker} name={member.name} focusable={open} />}
          </span>
        </span>
      </span>
    </span>
  )
}

/** Acceso directo a sus stats en tracker.gg */
function TrackerLink({ url, name, focusable }: { url: string; name: string; focusable: boolean }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      tabIndex={focusable ? 0 : -1}
      aria-label={`Ver las stats de ${name} en tracker.gg (se abre en otra pestaña)`}
      className="relative mt-1.5 flex items-center justify-center gap-2 rounded-full border border-violet-hi/60 bg-violet/20 pt-2 pb-1.5 font-display text-[16px] tracking-[0.14em] text-white transition-colors duration-150 hover:bg-violet-hi/45"
    >
      Valo Tracker
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[2.5]">
        <path d="M7 17 17 7M8 7h9v9" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}
