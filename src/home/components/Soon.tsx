import { cx } from '../lib/cx'

/** Cartel "Próximamente" con un punto que late */
export function Soon({ className }: { className?: string }) {
  return (
    <div
      className={cx(
        'inline-flex items-center gap-3 rounded-full border border-ember/45 bg-ember/8 px-5.5 pt-3 pb-2.5 font-display text-[22px] tracking-[0.16em] text-ember',
        className,
      )}
    >
      <i className="size-2.25 animate-ping-soft rounded-full bg-ember shadow-[0_0_0_0_rgb(255_179_71/0.7)]" />
      Próximamente
    </div>
  )
}
