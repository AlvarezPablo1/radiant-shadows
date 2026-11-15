import type { ReactNode } from 'react'
import { cx } from '../../../shared/lib/cx'
import { enter } from '../../lib/enter'
import type { Team } from '../../data/teams'
import type { Page } from '../../types'
import { Dragon } from './Dragon'
import { Kicker } from '../../../shared/ui/Kicker'
import { Soon } from '../ui/Soon'

interface Props {
  page: Page
  isHome: boolean
  ready: boolean
  /** botones en lugar del cartel "Próximamente" (en la home) */
  actions?: ReactNode
  /** imagen del costado; por defecto, la mascota del equipo guiñando */
  art?: ReactNode
  team?: Team
}

/** Bloque principal: título de la sección, texto y el dragón */
export function Hero({ page, isHome, ready, actions, art, team }: Props) {
  return (
    <main className="relative z-2 mx-auto grid min-h-svh max-w-page items-center gap-8 px-16 pt-[calc(var(--header-h)+40px)] pb-30 max-md:min-h-0 max-md:grid-cols-1 max-md:content-start max-md:gap-2 max-md:px-4 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-8 max-md:text-center grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
      <div className="relative z-1">
        <div className={enter(ready, 'delay-0')}>
          <Kicker>{page.kicker}</Kicker>
        </div>
        <h1
          className={cx(
            isHome
              ? // RADIANT SHADOWS: letra ensanchada, bien espaciada y sin sombra
                'mt-5 font-brand leading-[1.1] font-semibold tracking-[0.26em] [font-stretch:125%] text-[clamp(30px,5.4vw,80px)]'
              : // título de cada sección, con el mismo estilo de marca
                'mt-3.5 font-brand-title text-[clamp(23px,4.3vw,63px)]',
            enter(ready, 'delay-80'),
          )}
        >
          {isHome ? (
            <>
              {/* el margen negativo compensa el espaciado que queda después de la última letra (centra bien en celular) */}
              <span className="mr-[-0.26em] text-[#ece6f6]">RADIANT</span>
              <br />
              <span className="mr-[-0.26em] text-[#9b5cff] [text-shadow:0_0_24px_rgb(142_68_255/0.45)]">SHADOWS</span>
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

      <Art ready={ready}>{art ?? <Dragon team={team} />}</Art>
    </main>
  )
}

/** La imagen del costado (el dragón) con un halo violeta detrás */
function Art({ ready, children }: { ready: boolean; children: ReactNode }) {
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
      {children}
    </div>
  )
}

