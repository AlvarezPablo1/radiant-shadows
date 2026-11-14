import { ABOUT_PILLARS } from '../../data/about'
import { PillarIcon } from '../about/PillarIcon'
import { Reveal } from '../Reveal'
import { SectionHeading } from '../SectionHeading'
import { ActionButton } from './ActionButton'

/** "Quiénes somos" en corto: los tres pilares en una línea cada uno y link a la sección */
export function AboutTeaser() {
  return (
    <Reveal label="Quiénes somos" className="px-16 max-lg:px-10 max-md:px-4">
      <SectionHeading kicker="Quiénes somos" title="MÁS QUE UN JUEGO" />
      <ul className="mx-auto mt-10 grid max-w-5xl grid-cols-3 gap-8 max-md:grid-cols-1 max-md:gap-6">
        {ABOUT_PILLARS.map((p) => (
          <li key={p.id} className="flex flex-col items-center text-center">
            <span className="grid size-14 place-items-center rounded-2xl border border-violet-hi/40 bg-violet/25 text-lilac shadow-[0_0_24px_rgb(142_68_255/0.35)]">
              <PillarIcon id={p.id} className="size-7" />
            </span>
            <h3 className="mt-4 font-display text-[32px] leading-none tracking-[0.04em] text-white">{p.title.toUpperCase()}</h3>
            <p className="mt-2 max-w-72 text-[15px] leading-[1.55] text-body">{p.text}</p>
          </li>
        ))}
      </ul>
      <div className="mt-10 text-center">
        <ActionButton href="/quienes-somos" variant="ghost">
          CONOCÉ NUESTRA HISTORIA
        </ActionButton>
      </div>
    </Reveal>
  )
}
