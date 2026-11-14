import { cx } from '../lib/cx'

/** Flechita que gira cuando el desplegable está abierto */
export function Chevron({ open, className }: { open: boolean; className?: string }) {
  return (
    <i
      aria-hidden="true"
      className={cx(
        'size-1.75 border-r-2 border-b-2 border-current transition-transform duration-200',
        open ? 'translate-y-px rotate-[-135deg]' : '-translate-y-0.5 rotate-45',
        className,
      )}
    />
  )
}
