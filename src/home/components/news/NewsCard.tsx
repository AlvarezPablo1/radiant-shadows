import { NEWS_CATEGORIES, type NewsItem } from '../../../shared/content/news'
import { cx } from '../../../shared/lib/cx'
import { Reveal } from '../ui/Reveal'
import { NewsAction } from './NewsAction'
import { NewsVisual } from './NewsVisual'

interface Props {
  item: NewsItem
  /**
   * card: tarjeta común · hero: la noticia más nueva, a lo ancho de dos columnas con la imagen arriba ·
   * banner: horizontal con la imagen al costado (la de tryouts en la home)
   */
  variant?: 'card' | 'hero' | 'banner'
  /** la tarjeta de al lado de la principal: su imagen crece para acompañar la altura de la principal (sin hueco abajo) */
  stretch?: boolean
  onContact: () => void
}

/** Tarjeta de una noticia: imagen, categoría, título, bajada y el botón siempre abajo de todo */
export function NewsCard({ item, variant = 'card', stretch, onContact }: Props) {
  const cat = NEWS_CATEGORIES[item.category]
  const big = variant !== 'card'
  return (
    <Reveal as="div" className="h-full">
      <article
        className={cx(
          // esquinas rectas; sólo el aviso de tryouts de la home queda redondeado
          'flex h-full overflow-hidden border border-violet-hi/25 bg-night/55 backdrop-blur-md',
          variant === 'banner' && 'rounded-3xl',
          variant === 'banner' ? 'flex-row max-md:flex-col' : 'flex-col',
        )}
      >
        {variant === 'hero' ? (
          <>
            {/* principal: en compu la imagen apaisada (3:1); en celular, donde se ve como una tarjeta más, la común (2:1) */}
            <NewsVisual item={{ ...item, image: item.imageWide || item.image }} color={cat.color} className="aspect-[3/1] w-full max-md:hidden" />
            <NewsVisual item={{ ...item, image: item.image || item.imageWide }} color={cat.color} className="aspect-[2/1] w-full md:hidden" />
          </>
        ) : (
          <NewsVisual
            item={{ ...item, image: item.image || item.imageWide }}
            color={cat.color}
            // la tarjeta común en 2:1; la de al lado de la principal crece para acompañar su altura (sin hueco abajo)
            className={variant === 'banner' ? 'w-[45%] max-md:h-56 max-md:w-full' : stretch ? 'aspect-[2/1] w-full lg:aspect-auto lg:min-h-52 lg:flex-1' : 'aspect-[2/1] w-full'}
          />
        )}

        <div className={cx('flex flex-col', variant === 'banner' ? 'flex-1 justify-center p-10 max-md:p-6' : variant === 'hero' ? 'flex-1 p-8 max-md:p-6' : stretch ? 'flex-1 p-6 lg:flex-none' : 'flex-1 p-6')}>
          <p className="flex items-center gap-2 text-xs">
            <span style={{ color: cat.color, borderColor: `${cat.color}66` }} className="rounded-full border px-2.5 pt-1 pb-0.5 font-display text-[14px] tracking-[0.16em]">
              {cat.label.toUpperCase()}
            </span>
            {item.date && <span className="text-muted">{item.date}</span>}
          </p>
          <h2
            className={cx(
              'mt-3 text-white',
              // la grande usa el título de la marca; las demás, la letra angosta para que entren en la tarjeta
              big ? 'font-brand-title text-[clamp(22px,2.4vw,35px)]' : 'font-display text-[30px] leading-[0.95] tracking-[0.02em]',
            )}
          >
            {item.title.toUpperCase()}
          </h2>
          <p className={cx('mt-3 mb-5 leading-[1.55] text-body', big ? 'text-[17px]' : 'text-[15px]')}>{item.summary}</p>
          {item.action?.href && <NewsAction action={item.action} onContact={onContact} />}
        </div>
      </article>
    </Reveal>
  )
}
