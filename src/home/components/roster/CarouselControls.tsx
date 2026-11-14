import { cx } from '../../lib/cx'

interface Props {
  names: string[]
  current: number
  onGo: (index: number) => void
}

/** Debajo del carrusel (sólo celular): flechas y un punto por integrante, para que se note que se desliza */
export function CarouselControls({ names, current, onGo }: Props) {
  const arrow = 'grid size-11 cursor-pointer place-items-center rounded-full border border-violet-hi/40 bg-night/60 text-lilac transition-colors hover:bg-violet/30 disabled:cursor-default disabled:opacity-30'
  return (
    <div className="mt-5 hidden items-center justify-center gap-5 max-md:flex">
      <button type="button" aria-label="Anterior" disabled={current === 0} onClick={() => onGo(current - 1)} className={arrow}>
        <Chevron className="rotate-180" />
      </button>
      <ol className="flex items-center gap-2.5" aria-label="Integrantes">
        {names.map((n, i) => (
          <li key={n + i}>
            <button
              type="button"
              aria-label={`Ver a ${n}`}
              aria-current={i === current ? 'true' : undefined}
              onClick={() => onGo(i)}
              className={cx('block h-2.5 cursor-pointer rounded-full transition-all duration-300', i === current ? 'w-7 bg-violet-hi shadow-[0_0_10px_var(--color-violet-hi)]' : 'w-2.5 bg-white/25')}
            />
          </li>
        ))}
      </ol>
      <button type="button" aria-label="Siguiente" disabled={current === names.length - 1} onClick={() => onGo(current + 1)} className={arrow}>
        <Chevron />
      </button>
    </div>
  )
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('size-5 fill-none stroke-current stroke-[2.5]', className)}>
      <path d="m9 6 6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
