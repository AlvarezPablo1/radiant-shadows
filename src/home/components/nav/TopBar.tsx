import { SOCIALS } from '../../data/socials'
import { SocialIcon } from '../socials/SocialIcon'

/** Barra fina arriba del nav: sólo los íconos de las redes, centrados */
export function TopBar() {
  return (
    <div className="border-b border-violet-hi/12 bg-night/45">
      <nav aria-label="Redes sociales" className="mx-auto flex h-(--bar-h) max-w-page items-center justify-center gap-7 px-4">
        {SOCIALS.map((s) => (
          <a
            key={s.name}
            href={s.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${s.name} (se abre en otra pestaña)`}
            title={s.name}
            className="text-mist transition-[color,scale] duration-150 hover:scale-110 hover:text-white"
          >
            <SocialIcon icon={s.icon} className="size-4" />
          </a>
        ))}
      </nav>
    </div>
  )
}
