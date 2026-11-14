import { useState, type CSSProperties } from 'react'
import type { Member } from '../../data/rosters'
import { cx } from '../../lib/cx'
import { MemberCard } from './MemberCard'

interface Props {
  members: Member[]
  label: string
  /** alto de la fila (puede usar var(--n), la cantidad de integrantes): todas las fotos toman este alto */
  heightClass: string
  /** mostrar el rango en la ficha (sólo para jugadores) */
  showRank?: boolean
  className?: string
}

/** Fila a todo el ancho; el integrante seleccionado se destaca y los demás se apagan */
export function MemberRow({ members, label, heightClass, showRank = true, className }: Props) {
  const [active, setActive] = useState<number | null>(null)
  return (
    <ul
      aria-label={label}
      style={{ '--n': members.length } as CSSProperties}
      className={cx(
        'flex w-full items-end justify-center px-[3vw]',
        // en celular: fila que se desliza de costado
        'max-md:snap-x max-md:snap-mandatory max-md:justify-start max-md:overflow-x-auto max-md:px-[19vw]',
        heightClass,
        className,
      )}
    >
      {members.map((m, i) => (
        <li key={m.name + m.role} className="h-full min-w-0 flex-1 max-md:w-[62vw] max-md:flex-none max-md:snap-center">
          <MemberCard
            member={m}
            showRank={showRank}
            active={active === i}
            dimmed={active !== null && active !== i}
            onSelect={() => setActive(i)}
            onLeave={() => setActive((a) => (a === i ? null : a))}
          />
        </li>
      ))}
    </ul>
  )
}
