import { NEWS_CATEGORIES, type NewsItem } from '../../data/news'
import { cx } from '../../lib/cx'
import { Reveal } from '../Reveal'

interface Props {
  item: NewsItem
  /** la primera noticia: más grande, con la imagen al costado */
  featured?: boolean
  onContact: () => void
}

/** Tarjeta de una noticia: imagen (o fondo del color de la categoría), categoría, título, bajada y botón */
export function NewsCard({ item, featured, onContact }: Props) {
  const cat = NEWS_CATEGORIES[item.category]
  return (
    <Reveal as="div" className="h-full">
      <article
        className={cx(
          'flex h-full overflow-hidden rounded-3xl border border-violet-hi/25 bg-night/55 backdrop-blur-md',
          featured ? 'flex-row max-md:flex-col' : 'flex-col',
        )}
      >
        <Visual item={item} color={cat.color} className={featured ? 'w-[45%] max-md:h-56 max-md:w-full' : 'h-52'} />

        <div className={cx('flex flex-1 flex-col', featured ? 'justify-center p-10 max-md:p-6' : 'p-6')}>
          <p className="flex items-center gap-2 text-xs">
            <span style={{ color: cat.color, borderColor: `${cat.color}66` }} className="rounded-full border px-2.5 pt-1 pb-0.5 font-display text-[14px] tracking-[0.16em]">
              {cat.label.toUpperCase()}
            </span>
            {item.date && <span className="text-muted">{item.date}</span>}
          </p>
          <h2
            className={cx(
              'mt-3 font-display leading-[0.95] tracking-[0.02em] text-white',
              featured ? 'text-[clamp(40px,4.4vw,64px)] [text-shadow:3px_3px_0_var(--color-violet)]' : 'text-[30px]',
            )}
          >
            {item.title.toUpperCase()}
          </h2>
          <p className={cx('mt-3 leading-[1.55] text-body', featured ? 'text-[17px]' : 'text-[15px]')}>{item.summary}</p>
          {item.action && <Action action={item.action} onContact={onContact} />}
        </div>
      </article>
    </Reveal>
  )
}

/** Foto (o foto grupal) de la noticia o, si no tiene, el logo sobre un degradé del color de la categoría */
function Visual({ item, color, className }: { item: NewsItem; color: string; className: string }) {
  return (
    <div
      style={{ background: `radial-gradient(ellipse at 50% 80%, ${color}55, transparent 70%), linear-gradient(to bottom, rgb(122 40 226 / 0.35), rgb(0 0 16 / 0.7))` }}
      className={cx('relative shrink-0 overflow-hidden', className)}
    >
      {item.group ? (
        // foto grupal: los jugadores uno al lado del otro, pisándose un poco
        <div className="absolute inset-x-0 top-4 bottom-0 flex justify-center">
          {item.group.map((g, i) => (
            <img
              key={g.photo}
              src={g.photo}
              alt=""
              style={{ height: `${(g.scale ?? 1) * 112}%`, zIndex: i === Math.floor(item.group!.length / 2) ? 2 : 1 }}
              className="relative -mx-[4%] w-auto max-w-none object-contain object-top mask-b-from-60% mask-b-to-100%"
            />
          ))}
        </div>
      ) : item.image ? (
        <img src={item.image} alt="" className="absolute top-4 left-1/2 h-[115%] w-auto max-w-none -translate-x-1/2 object-contain object-top mask-b-from-60% mask-b-to-100%" />
      ) : (
        <img src="/brand/logos/rs-positive.png" alt="" className="absolute top-1/2 left-1/2 w-2/5 max-w-40 -translate-1/2 opacity-80 drop-shadow-[0_0_30px_rgb(142_68_255/0.6)]" />
      )}
    </div>
  )
}

function Action({ action, onContact }: { action: NonNullable<NewsItem['action']>; onContact: () => void }) {
  const cls =
    'mt-5 inline-flex w-fit cursor-pointer items-center gap-1.5 font-display text-[18px] tracking-[0.12em] text-lilac transition-colors duration-150 hover:text-white'
  const label = (
    <>
      {action.label.toUpperCase()}
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[2.5]">
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  )
  return 'contact' in action ? (
    <button type="button" onClick={onContact} className={cls}>
      {label}
    </button>
  ) : action.href.startsWith('http') ? (
    <a href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  ) : (
    <a href={action.href} className={cls}>
      {label}
    </a>
  )
}
