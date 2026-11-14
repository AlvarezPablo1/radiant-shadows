import { rankIcon } from '../../../shared/content/ranks'
import { ofTeam } from '../../../shared/content/rosters'
import { useContent } from '../../lib/useContent'
import { Reveal } from '../ui/Reveal'
import { SectionHeading } from '../ui/SectionHeading'
import { ActionButton } from '../../../shared/ui/ActionButton'

/** Vista previa del roster masculino: fotos en fila con rol y rango, y link al equipo completo */
export function RosterPreview() {
  const players = ofTeam(useContent().players, 'Masculino')
  return (
    <Reveal label="Nuestro roster" className="px-16 max-lg:px-10 max-md:px-4">
      <SectionHeading kicker="Roster masculino" title="NUESTROS DRAGONES" />
      <ul className="mt-10 grid grid-cols-[repeat(auto-fit,minmax(0,1fr))] gap-5 max-md:grid-cols-1">
        {players.map((p) => {
          const icon = rankIcon(p.rank)
          return (
            <li key={p.name}>
              <a
                href="/equipo/masculino"
                className="group relative block h-96 overflow-hidden rounded-3xl border border-violet-hi/25 bg-[linear-gradient(to_bottom,rgb(122_40_226/0.3),rgb(0_0_16/0.6))] transition-[border-color,translate] duration-200 hover:-translate-y-1 hover:border-violet-hi/70 max-md:h-80"
              >
                {p.photo && (
                  <img
                    src={p.photo}
                    alt=""
                    style={{ height: `${(p.photoScale ?? 1) * 100}%` }}
                    className="absolute top-4 left-1/2 w-auto max-w-none -translate-x-1/2 object-contain object-top transition-transform duration-300 group-hover:scale-104 mask-b-from-60% mask-b-to-100%"
                  />
                )}
                <span className="absolute inset-x-0 bottom-0 flex flex-col items-center px-4 pb-6 text-center">
                  <span className="font-brand-title text-[22px] text-white [text-shadow:0_2px_16px_var(--color-night)]">
                    {p.name.toUpperCase()}
                  </span>
                  <span className="mt-2 flex items-center gap-2 text-sm font-semibold text-mist">
                    {p.role}
                    {icon && <img src={icon} alt="" className="size-5" />}
                    <span className="text-muted">{p.rank}</span>
                  </span>
                </span>
              </a>
            </li>
          )
        })}
      </ul>
      <div className="mt-8 text-center">
        <ActionButton href="/equipo/masculino" variant="ghost">
          VER EQUIPO COMPLETO
        </ActionButton>
      </div>
    </Reveal>
  )
}
