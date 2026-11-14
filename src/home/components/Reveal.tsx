import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { useInView } from '../lib/hooks'

/** Envoltorio que aparece (sube y se hace visible) cuando llega a la pantalla con el scroll */
export function Reveal({ children, className, as: Tag = 'section', label }: { children: ReactNode; className?: string; as?: 'section' | 'div'; label?: string }) {
  const [ref, visible] = useInView<HTMLElement>(0.15)
  return (
    <Tag
      ref={ref as never}
      aria-label={label}
      className={cx('transition-[opacity,translate] duration-700 ease-out-soft', visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0', className)}
    >
      {children}
    </Tag>
  )
}
