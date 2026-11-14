import { SOCIALS } from '../../data/socials'
import { Reveal } from '../Reveal'
import { SectionHeading } from '../SectionHeading'
import { SocialIcon } from '../socials/SocialIcon'

/** Franja de redes: Twitch destacado (los partidos en vivo) y el resto de las redes al lado */
export function FollowBand() {
  const twitch = SOCIALS.find((s) => s.name === 'Twitch')!
  const others = SOCIALS.filter((s) => s !== twitch)
  return (
    <Reveal label="Seguinos" className="px-16 max-lg:px-10 max-md:px-4">
      <SectionHeading kicker="Comunidad" title="SEGUINOS" />
      <div className="mt-10 grid grid-cols-[1.4fr_1fr] gap-5 max-md:grid-cols-1">
        <a
          href={twitch.url}
          target="_blank"
          rel="noopener noreferrer"
          className="group relative flex min-h-56 flex-col justify-between overflow-hidden rounded-3xl border border-[#9146ff]/50 bg-[linear-gradient(130deg,#9146ff_0%,#4b1fa3_55%,#1a0838)] p-9 transition-[translate,box-shadow] duration-200 hover:-translate-y-1 hover:shadow-[0_24px_60px_-20px_#9146ff] max-md:p-7"
        >
          <SocialIcon icon={twitch.icon} className="absolute -right-6 -bottom-8 size-56 text-white/10 transition-transform duration-300 group-hover:scale-105" />
          <SocialIcon icon={twitch.icon} className="relative size-10 text-white" />
          <span className="relative">
            <span className="block font-display text-[clamp(36px,4vw,56px)] leading-none tracking-[0.03em] text-white">MIRÁ LOS PARTIDOS EN VIVO</span>
            <span className="mt-2 block text-[15px] text-white/80">twitch.tv/{twitch.handle} · Seguir en Twitch →</span>
          </span>
        </a>

        <ul className="grid gap-5">
          {others.map((s) => (
            <li key={s.name}>
              <a
                href={s.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-full items-center gap-5 rounded-3xl border border-violet-hi/25 bg-night/55 p-7 backdrop-blur-md transition-[border-color,translate] duration-200 hover:-translate-y-1 hover:border-violet-hi/70"
              >
                <span className="grid size-14 shrink-0 place-items-center rounded-2xl bg-violet/25 text-white">
                  <SocialIcon icon={s.icon} className="size-6" />
                </span>
                <span>
                  <span className="block font-display text-[30px] leading-none tracking-[0.04em] text-white">{s.name.toUpperCase()}</span>
                  <span className="mt-1 block text-sm text-muted">{s.handle}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Reveal>
  )
}
