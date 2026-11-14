import { cx } from '../lib/cx'
import { enter } from '../lib/enter'
import type { Page } from '../types'
import { Kicker } from './Kicker'

/** Encabezado centrado de las pantallas internas: kicker, título y texto, con entrada escalonada */
export function PageHeader({ page, ready }: { page: Page; ready: boolean }) {
  return (
    <header className="mx-auto max-w-7xl px-16 text-center max-lg:px-10 max-md:px-4">
      <div className={enter(ready, 'delay-0')}>
        <Kicker>{page.kicker}</Kicker>
      </div>
      <h1
        className={cx(
          'mt-3 font-display text-[clamp(48px,6vw,88px)] leading-[0.9] tracking-[0.01em] [text-shadow:4px_4px_0_var(--color-violet)]',
          enter(ready, 'delay-80'),
        )}
      >
        {page.title}
      </h1>
      {/* sombra fuerte para que se lea sobre los neones del fondo */}
      <p
        className={cx(
          'mx-auto mt-4 max-w-150 text-[18px] leading-[1.55] font-medium text-white [text-shadow:0_2px_14px_var(--color-night),0_0_4px_var(--color-night)] max-md:text-base',
          enter(ready, 'delay-160'),
        )}
      >
        {page.text}
      </p>
    </header>
  )
}
