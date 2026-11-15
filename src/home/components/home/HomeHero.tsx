import { useState, type ReactNode } from 'react'
import { cx } from '../../../shared/lib/cx'
import { Kicker } from '../../../shared/ui/Kicker'
import { enter } from '../../lib/enter'
import type { Team } from '../../data/teams'
import type { Page } from '../../types'
import { HeroVideo } from './HeroVideo'

/**
 * Héroe de la home: todo centrado sobre el video del dragón.
 * "RADIANT SHADOWS" ocupa todo el ancho en una línea; en pantallas más chicas pasa a dos.
 */
export function HomeHero({ page, ready, actions, team }: { page: Page; ready: boolean; actions: ReactNode; team?: Team }) {
  // cuando el dragón está por terminar de lanzar fuego, el título se enciende en neón un momento
  const [pulse, setPulse] = useState(0)
  const glow = pulse > 0 ? 'animate-neon-pulse' : ''
  return (
    <main className="relative z-2 flex min-h-svh flex-col items-center justify-center px-6 pt-[calc(var(--header-h)+40px+16vh)] pb-16 text-center max-md:px-4 max-md:pt-[calc(var(--header-h)+24px)] max-md:pb-14">
      <HeroVideo team={team} onNearEnd={() => setPulse((n) => n + 1)} />
      {/* sombra suave detrás de los textos para que se lean sobre el dragón */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_55%_45%_at_50%_55%,rgb(0_0_0/0.45),transparent_75%)]" />

      <div className={cx('relative', enter(ready, 'delay-0'))}>
        <Kicker>{page.kicker}</Kicker>
      </div>
      <h1
        className={cx(
          'relative mt-5 w-full font-brand leading-[1.1] font-semibold tracking-[0.18em] whitespace-nowrap font-stretch-125% text-[clamp(26px,5.6vw,108px)] max-lg:whitespace-normal max-lg:tracking-[0.24em] max-lg:text-[clamp(30px,9vw,80px)]',
          enter(ready, 'delay-80'),
        )}
      >
        {/* sin brillo por defecto: el neón violeta se enciende y se apaga al final de cada fuego; el margen negativo compensa el espaciado que queda después de la última letra (centra bien) */}
        <span
          key={`r${pulse}`}
          className={cx(
            'mr-[-0.18em] text-[#ece6f6] [--neon-hot:#ffffff] [--neon-strong:0_0_6px_rgb(255_255_255/0.95),0_0_22px_rgb(210_180_255/0.9),0_0_60px_rgb(142_68_255/0.9),0_0_110px_rgb(122_40_226/0.7)] max-lg:mr-[-0.24em] max-lg:block',
            glow,
          )}
        >
          RADIANT{' '}
        </span>
        <span
          key={`s${pulse}`}
          className={cx(
            'mr-[-0.18em] text-[#9b5cff] [--neon-hot:#c7a4ff] [--neon-strong:0_0_6px_rgb(235_220_255/0.95),0_0_24px_rgb(175_120_255/0.95),0_0_70px_rgb(142_68_255/0.95),0_0_140px_rgb(122_40_226/0.8)] max-lg:mr-[-0.24em] max-lg:block',
            glow,
          )}
        >
          SHADOWS
        </span>
      </h1>
      <div className={cx('relative', enter(ready, 'delay-160'))}>
        {/* "El fuego sigue" se enciende como si el fuego del video la prendiera (amarillo y naranja), al mismo tiempo que el título */}
        <span
          key={`f${pulse}`}
          className={cx('mt-4 inline-block -rotate-5 font-script text-[clamp(20px,2.4vw,32px)] text-ember', pulse > 0 && 'animate-fire-glow')}
        >
          {page.script}
        </span>
      </div>
      <p className={cx('relative mt-6 max-w-150 text-[17px] leading-[1.6] text-body max-md:text-[15px]', enter(ready, 'delay-240'))}>{page.text}</p>
      <div className={cx('relative flex justify-center', enter(ready, 'delay-320'))}>{actions}</div>
    </main>
  )
}
