import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react'
import { cx } from '../../../shared/lib/cx'

export interface GlowHandle {
  /** enciende el brillo un momento y lo vuelve a apagar */
  flash: () => void
}

/**
 * Texto con un brillo que se enciende por un instante. El brillo es una copia del texto ya pintada con su resplandor,
 * encima del original: sólo se anima su opacidad (lo hace la placa de video, sin redibujar la página), así el video
 * de fondo no se traba mientras brilla.
 */
export const GlowText = forwardRef<GlowHandle, { children: ReactNode; className?: string; glowClassName: string }>(function GlowText({ children, className, glowClassName }, ref) {
  const glow = useRef<HTMLSpanElement>(null)
  useImperativeHandle(ref, () => ({
    flash: () =>
      glow.current?.animate([{ opacity: 0 }, { opacity: 1, offset: 0.45 }, { opacity: 0 }], { duration: 2200, easing: 'ease-in-out' }),
  }))
  return (
    <span className={cx('relative', className)}>
      {children}
      <span ref={glow} aria-hidden="true" className={cx('pointer-events-none absolute inset-0 opacity-0 will-change-[opacity]', glowClassName)}>
        {children}
      </span>
    </span>
  )
})
