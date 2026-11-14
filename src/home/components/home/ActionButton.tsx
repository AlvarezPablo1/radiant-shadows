import type { ReactNode } from 'react'
import { cx } from '../../lib/cx'

interface Props {
  children: ReactNode
  /** con href es un link; si no, un botón con onClick */
  href?: string
  onClick?: () => void
  variant?: 'primary' | 'ghost'
  className?: string
}

const styles = {
  primary: 'bg-cta text-white shadow-cta hover:shadow-cta-hover hover:brightness-112',
  ghost: 'border border-violet-hi/50 bg-night/40 text-mist backdrop-blur-sm hover:border-violet-hi hover:bg-violet/25 hover:text-white',
}

/** Botón grande redondeado de las secciones de la home */
export function ActionButton({ children, href, onClick, variant = 'primary', className }: Props) {
  const cls = cx(
    'inline-flex cursor-pointer items-center justify-center gap-2 rounded-full px-7 pt-3 pb-2.5 font-display text-[20px] tracking-[0.1em] transition-[background-color,border-color,color,box-shadow,filter,translate] duration-200 hover:-translate-y-0.5',
    styles[variant],
    className,
  )
  const arrow = (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current stroke-[2.5]">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
  return href ? (
    <a href={href} className={cls}>
      {children}
      {arrow}
    </a>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {children}
      {arrow}
    </button>
  )
}
