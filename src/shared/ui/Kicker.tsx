import type { ReactNode } from 'react'
import { cx } from '../lib/cx'

/** Texto chico violeta que va arriba de los títulos, con una rayita de neón delante */
export function Kicker({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        'inline-flex items-center gap-3 font-display text-[20px] tracking-[0.3em] text-lilac',
        'before:h-0.5 before:w-10.5 before:bg-violet-hi before:shadow-[0_0_10px_var(--color-violet-hi)]',
        'max-md:text-base max-md:before:hidden',
        className,
      )}
    >
      {children}
    </span>
  )
}
