import { cx } from '../lib/cx'
import type { Page } from '../types'
import { Kicker } from './Kicker'

interface Props {
  page: Page
  isHome: boolean
  ready: boolean
}

/** Entrada escalonada: cada bloque aparece un poco después del anterior */
const enter = (ready: boolean, delay: string) =>
  cx('transition-[opacity,translate] duration-700 ease-out-soft', delay, ready ? 'translate-y-0 opacity-100' : 'translate-y-3.75 opacity-0')

/** Bloque principal: título de la sección, texto y el dragón */
export function Hero({ page, isHome, ready }: Props) {
  return (
    <main className="relative z-2 mx-auto grid min-h-svh max-w-7xl grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] items-center gap-8 px-16 pt-[calc(var(--nav-h)+40px)] pb-30 max-md:min-h-0 max-md:grid-cols-1 max-md:content-start max-md:gap-2 max-md:px-4 max-md:pt-[calc(var(--nav-h)+16px)] max-md:pb-8 max-md:text-center">
      <div className="relative">
        <div className={enter(ready, 'delay-0')}>
          <Kicker>{page.kicker}</Kicker>
        </div>
        <h1
          className={cx(
            'mt-3.5 font-display text-[clamp(64px,11vw,168px)] leading-[0.86] font-normal tracking-[0.01em] [text-shadow:6px_6px_0_var(--color-violet)]',
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
          <div className="mt-7.5 inline-flex items-center gap-3 rounded-full border border-ember/45 bg-ember/8 px-5.5 pt-3 pb-2.5 font-display text-[22px] tracking-[0.16em] text-ember">
            <i className="size-2.25 animate-ping-soft rounded-full bg-ember shadow-[0_0_0_0_rgb(255_179_71/0.7)]" />
            Próximamente
          </div>
        </div>
      </div>

      <div
        aria-hidden="true"
        className={cx(
          'relative grid place-items-center max-md:-order-1',
          // halo violeta detrás del dragón
          'before:absolute before:aspect-square before:w-4/5 before:rounded-full before:bg-[radial-gradient(circle,rgb(122_40_226/0.45),transparent_65%)] before:blur-[10px]',
          enter(ready, 'delay-200'),
        )}
      >
        <img
          src="/brand/mascots/kael-dragon.png"
          alt=""
          className="relative w-[min(100%,560px)] animate-float drop-shadow-[0_0_40px_rgb(122_40_226/0.55)] max-md:w-[min(62vw,280px)]"
        />
      </div>
    </main>
  )
}
