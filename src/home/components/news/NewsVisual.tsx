import type { NewsItem } from '../../../shared/content/news'
import { ofTeam } from '../../../shared/content/rosters'
import { cx } from '../../../shared/lib/cx'
import { useContent } from '../../lib/useContent'
import { useImageKind } from '../../lib/useImageKind'
import { PersonArt } from './PersonArt'

const TRYOUTS_ART = '/brand/news/tryouts-valorant.webp'
/** imagen por defecto de las noticias que no son de un jugador: el logo bordado en la camiseta */
const DEFAULT_ART = '/brand/news/default.webp'
const fade = 'mask-b-from-60% mask-b-to-100%'

/**
 * Imagen de la noticia: tryouts → logo de Valorant; foto grupal del roster; una imagen con fondo, entera y a todo
 * el ancho; un recorte sin fondo → placa con el nombre (o la foto recortada); y si no hay imagen, la de por defecto.
 */
export function NewsVisual({ item, color, className }: { item: NewsItem; color: string; className: string }) {
  const content = useContent()
  const group = ofTeam(content.players, 'Masculino').filter((p) => p.photo)
  const roster = item.showRoster && group.length > 0 && item.category !== 'tryouts'
  const kind = useImageKind(item.image && !roster && item.category !== 'tryouts' ? item.image : undefined)
  // imagen con fondo: entera, sin recortarla
  if (item.image && kind === 'photo' && !roster && item.category !== 'tryouts') return <FullImage src={item.image} className={className} />
  // noticia de una persona (recorte sin fondo): placa con su nombre y su foto (las de comunidad no llevan placa)
  if (item.image && kind === 'cutout' && !roster && item.category !== 'tryouts' && item.category !== 'comunidad') {
    const name = personName(item, [...content.players, ...content.coaches].map((m) => ({ name: m.name, photo: m.photo })).concat([...content.staff, ...content.creators].map((p) => ({ name: p.nick, photo: p.photo }))))
    if (name) return <PersonArt name={name} photo={item.image} className={className} />
  }
  return (
    <div
      style={{ background: `radial-gradient(ellipse at 50% 80%, ${color}55, transparent 70%), linear-gradient(to bottom, rgb(122 40 226 / 0.35), rgb(0 0 16 / 0.7))` }}
      className={cx('relative shrink-0 overflow-hidden', className)}
    >
      {item.category === 'tryouts' ? (
        <img loading="lazy" decoding="async" src={TRYOUTS_ART} alt="" className="absolute top-1/2 left-1/2 w-2/5 max-w-44 -translate-1/2 drop-shadow-[0_0_30px_rgb(255_84_84/0.45)]" />
      ) : roster ? (
        // foto grupal del roster actual: los jugadores uno al lado del otro, pisándose un poco
        <div className="absolute inset-x-0 top-4 bottom-0 flex justify-center">
          {group.map((p, i) => (
            <img loading="lazy" decoding="async"
              key={p.photo}
              src={p.photo}
              alt=""
              style={{ height: `${(p.photoScale ?? 1) * 112}%`, zIndex: i === Math.floor(group.length / 2) ? 2 : 1 }}
              className={cx('relative -mx-[4%] w-auto max-w-none object-contain object-top', fade)}
            />
          ))}
        </div>
      ) : item.image && kind ? (
        <img loading="lazy" decoding="async" src={item.image} alt="" className={cx('absolute top-4 left-1/2 h-[115%] w-auto max-w-none -translate-x-1/2 object-contain object-top', fade)} />
      ) : item.image ? null : (
        <img src={DEFAULT_ART} alt="" loading="lazy" className="absolute inset-0 size-full object-cover" />
      )}
    </div>
  )
}

/** nombre para la placa: el que se cargó en la noticia, el de la persona de la foto, alguien del equipo nombrado en el título o lo que sigue a ":" */
function personName(item: NewsItem, people: { name?: string; photo?: string }[]) {
  if (item.person) return item.person
  const byPhoto = people.find((p) => p.photo && p.photo === item.image)?.name
  if (byPhoto) return byPhoto
  // alguien del equipo nombrado en el título ("Splotza, tercera mejor…")
  const words = new Set(item.title.toLowerCase().split(/[^\p{L}\p{N}]+/u))
  const byTitle = people.find((p) => p.name && words.has(p.name.toLowerCase()))?.name
  if (byTitle) return byTitle
  const after = item.title.split(':').pop()?.trim() ?? ''
  return item.title.includes(':') && after.split(/\s+/).length <= 2 ? after : ''
}

/** imagen con fondo: entera y a todo el ancho posible; lo que sobra se rellena con la misma imagen desenfocada */
function FullImage({ src, className }: { src: string; className: string }) {
  return (
    <div className={cx('relative shrink-0 overflow-hidden bg-night', className)}>
      <img src={src} alt="" aria-hidden="true" loading="lazy" decoding="async" className="absolute inset-0 size-full scale-110 object-cover opacity-45 blur-2xl" />
      <img src={src} alt="" loading="lazy" decoding="async" className="absolute inset-0 size-full object-contain" />
    </div>
  )
}
