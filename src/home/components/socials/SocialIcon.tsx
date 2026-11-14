import type { SimpleIcon } from 'simple-icons'
import { cx } from '../../lib/cx'

/** Logo oficial de una red (de simple-icons), en el color del texto */
export function SocialIcon({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('shrink-0 fill-current', className)}>
      <path d={icon.path} />
    </svg>
  )
}
