import { siInstagram, siTwitch, siX, type SimpleIcon } from 'simple-icons'
import { handleFromUrl, type Person } from '../../data/people'
import { cx } from '../../lib/cx'
import { useInView } from '../../lib/hooks'
import { Kicker } from '../Kicker'
import { Silhouette } from '../roster/Silhouette'
import { SocialIcon } from '../socials/SocialIcon'

interface Props {
  person: Person
  /** filas pares: imagen a la izquierda; impares: a la derecha */
  reversed: boolean
}

/**
 * Una persona (staff o creador) a todo el ancho. Imagen e info comparten un único fondo
 * (violeta del lado de la imagen, oscuro del otro) para que se vean como una sola pieza.
 */
export function PersonRow({ person, reversed }: Props) {
  const [ref, visible] = useInView<HTMLElement>()
  return (
    <article
      ref={ref}
      aria-label={`${person.nick}, ${person.role}`}
      className={cx(
        'relative isolate grid items-stretch overflow-hidden rounded-3xl border border-violet-hi/25 backdrop-blur-md',
        reversed
          ? 'grid-cols-[1fr_auto] bg-[linear-gradient(to_left,rgb(122_40_226/0.34),rgb(40_14_80/0.45)_35%,rgb(0_0_16/0.6))]'
          : 'grid-cols-[auto_1fr] bg-[linear-gradient(to_right,rgb(122_40_226/0.34),rgb(40_14_80/0.45)_35%,rgb(0_0_16/0.6))]',
        'max-md:grid-cols-1 max-md:bg-[linear-gradient(to_bottom,rgb(122_40_226/0.34),rgb(40_14_80/0.45)_40%,rgb(0_0_16/0.6))]',
        'transition-[opacity,translate] duration-700 ease-out-soft',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0',
      )}
    >
      <Portrait person={person} reversed={reversed} />
      <InfoPanel person={person} reversed={reversed} />
    </article>
  )
}

/** Imagen chica: foto o silueta con un brillo suave que se funde con el panel */
function Portrait({ person, reversed }: { person: Person; reversed: boolean }) {
  return (
    <div className={cx('relative aspect-[4/5] w-60 max-lg:w-48 max-md:mx-auto max-md:mt-6 max-md:w-40', reversed && 'order-2 max-md:order-none')}>
      <span aria-hidden="true" className="absolute -inset-x-16 inset-y-0 bg-[radial-gradient(ellipse_at_50%_70%,rgb(142_68_255/0.3),transparent_60%)]" />
      {person.photo ? (
        <img src={person.photo} alt="" className="absolute inset-x-0 bottom-0 mx-auto h-[92%] w-auto object-contain object-bottom" />
      ) : (
        <Silhouette className="absolute bottom-0 left-1/2 h-[82%] w-auto -translate-x-1/2" />
      )}
    </div>
  )
}

/** Info: cargo, apodo, nombre y edad siempre pegados a la imagen; redes en el extremo opuesto */
function InfoPanel({ person, reversed }: { person: Person; reversed: boolean }) {
  const socials: [SimpleIcon, string][] = []
  if (person.instagram) socials.push([siInstagram, person.instagram])
  if (person.x) socials.push([siX, person.x])
  if (person.twitch) socials.push([siTwitch, person.twitch])

  return (
    <div
      className={cx(
        'relative flex items-center justify-between gap-8 px-12 py-10',
        'max-lg:flex-col max-lg:justify-center max-lg:px-8 max-md:items-center max-md:px-6 max-md:pt-6 max-md:pb-8 max-md:text-center',
        // imagen a la derecha: el texto se alinea a la derecha (junto a ella) y las redes van a la izquierda
        reversed ? 'order-1 flex-row-reverse text-right max-lg:items-end max-md:order-none' : 'max-lg:items-start',
      )}
    >
      <div className={cx('flex flex-col max-md:items-center', reversed && 'items-end')}>
        <Kicker>{person.role}</Kicker>
        <h2 className="mt-3 font-brand-title text-[clamp(29px,3.3vw,53px)] text-white">
          {person.nick.toUpperCase()}
        </h2>
        <p className="mt-3 text-[19px] font-semibold text-fg">
          {person.name} <span className="font-normal text-muted">· {person.age} años</span>
        </p>
      </div>

      {socials.length > 0 && (
        <ul className={cx('flex shrink-0 flex-col gap-2.5 max-lg:flex-row max-lg:flex-wrap max-md:justify-center', reversed && 'items-start')}>
          {socials.map(([icon, url]) => (
            <li key={url}>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${icon.title} de ${person.nick}: ${handleFromUrl(url)} (se abre en otra pestaña)`}
                className="flex items-center gap-2.5 rounded-full border border-violet-hi/35 bg-night/50 py-2.5 pr-5 pl-3.5 text-sm text-mist transition-colors duration-150 hover:border-violet-hi hover:bg-violet/30 hover:text-white"
              >
                <SocialIcon icon={icon} className="size-4" />
                {handleFromUrl(url)}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
