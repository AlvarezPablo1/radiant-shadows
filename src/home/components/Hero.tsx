import type { ReactNode } from 'react'
import { cx } from '../lib/cx'
import { enter } from '../lib/enter'
import type { Page } from '../types'
import { Dragon } from './Dragon'
import { Kicker } from './Kicker'
import { Soon } from './Soon'

interface Props {
  page: Page
  isHome: boolean
  ready: boolean
  /** botones en lugar del cartel "Próximamente" (en la home) */
  actions?: ReactNode
}

/** Bloque principal: título de la sección, texto y el dragón */
export function Hero({ page, isHome, ready, actions }: Props) {
  return (
    <main className="relative z-2 mx-auto grid min-h-svh max-w-page items-center gap-8 px-16 pt-[calc(var(--header-h)+40px)] pb-30 max-md:min-h-0 max-md:grid-cols-1 max-md:content-start max-md:gap-2 max-md:px-4 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-8 max-md:text-center grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="relative">
        <div className={enter(ready, 'delay-0')}>
          <Kicker>{page.kicker}</Kicker>
        </div>
        <h1
          className={cx(
            'mt-3.5 font-display leading-[0.86] font-normal tracking-[0.01em]',
            'text-[clamp(64px,11vw,168px)] [text-shadow:6px_6px_0_var(--color-violet)]',
            enter(ready, 'delay-80'),
          )}
        >
          {isHome ? (
            <>
              RADIANT
              <br />
              <span className="text-lilac">SHADOWS</span>
            </>
          ) : (
            page.title
          )}
        </h1>
        <div className={enter(ready, 'delay-160')}>
          <span className="mt-4.5 ml-1.5 inline-block -rotate-5 font-script text-[clamp(20px,2.4vw,30px)] text-ember">{page.script}</span>
        </div>
        <p className={cx('mt-6.5 max-w-130 text-[17px] leading-[1.6] text-body max-md:mx-auto max-md:text-[15px]', enter(ready, 'delay-240'))}>
          {page.text}
        </p>
        <div className={enter(ready, 'delay-320')}>
          {actions ?? <Soon className="mt-7.5" />}
        </div>
      </div>

      <Art ready={ready} />
    </main>
  )
}

/** El dragón flotando con un halo violeta detrás */
function Art({ ready }: { ready: boolean }) {
  return (
    <div
      aria-hidden="true"
      className={cx(
        'relative grid place-items-center max-md:-order-1',
        // halo violeta detrás del dragón
        'before:absolute before:aspect-square before:w-4/5 before:rounded-full before:bg-[radial-gradient(circle,rgb(122_40_226/0.45),transparent_65%)] before:blur-[10px]',
        enter(ready, 'delay-200'),
      )}
    >
      <Dragon />
    </div>
  )
}

