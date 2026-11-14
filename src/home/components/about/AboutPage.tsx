import { ABOUT_CLOSING, ABOUT_PILLARS, type Pillar } from '../../data/about'
import { cx } from '../../../shared/lib/cx'
import { useInView } from '../../../shared/lib/hooks'
import type { Page } from '../../types'
import { PageHeader } from '../ui/PageHeader'
import { PillarIcon } from './PillarIcon'

/** "Quiénes somos": párrafo de presentación, tres pilares en columnas y cierre con "El fuego sigue" */
export function AboutPage({ page, ready }: { page: Page; ready: boolean }) {
  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />

      <ul className="mt-16 grid grid-cols-3 gap-6 px-16 max-lg:px-10 max-md:mt-10 max-md:grid-cols-1 max-md:px-4">
        {ABOUT_PILLARS.map((p, i) => (
          <PillarCard key={p.id} pillar={p} delay={i * 120} />
        ))}
      </ul>

      <Closing />
    </main>
  )
}

/** Un pilar: ícono, título y dos líneas; aparece al llegar con el scroll, uno después del otro */
function PillarCard({ pillar, delay }: { pillar: Pillar; delay: number }) {
  const [ref, visible] = useInView<HTMLLIElement>()
  return (
    <li
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={cx(
        'flex flex-col rounded-3xl border border-violet-hi/25 bg-[linear-gradient(to_bottom,rgb(122_40_226/0.26),rgb(0_0_16/0.6))] p-9 backdrop-blur-md max-md:items-center max-md:p-7 max-md:text-center',
        'transition-[opacity,translate] duration-700 ease-out-soft',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <span className="grid size-14 place-items-center rounded-2xl border border-violet-hi/40 bg-violet/25 text-lilac shadow-[0_0_24px_rgb(142_68_255/0.35)]">
        <PillarIcon id={pillar.id} className="size-7" />
      </span>
      <h2 className="mt-6 font-brand-title text-[22px] text-white">
        {pillar.title.toUpperCase()}
      </h2>
      <p className="mt-3 text-[16px] leading-[1.6] text-body">{pillar.text}</p>
    </li>
  )
}

/** Cierre: una línea y "El fuego sigue" bien grande */
function Closing() {
  const [ref, visible] = useInView<HTMLElement>()
  return (
    <section
      ref={ref}
      aria-label="El fuego sigue"
      className={cx(
        'mt-28 px-4 text-center max-md:mt-20',
        'transition-[opacity,translate] duration-700 ease-out-soft',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <p className="mx-auto max-w-150 text-[18px] leading-[1.6] font-medium text-white [text-shadow:0_2px_14px_var(--color-night)] max-md:text-base">
        {ABOUT_CLOSING}
      </p>
      <p className="mt-8 font-brand-title text-[clamp(35px,5.5vw,82px)] text-white">
        EL FUEGO <span className="text-lilac">SIGUE</span>
      </p>
      <p className="mt-4 inline-block -rotate-3 font-script text-[clamp(18px,2vw,26px)] text-ember">#SomosDRAGONES</p>
    </section>
  )
}
