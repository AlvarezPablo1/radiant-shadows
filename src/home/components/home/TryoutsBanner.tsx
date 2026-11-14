import { NEWS } from '../../data/news'
import { todayKey } from '../../lib/calendar'
import { NewsCard } from '../news/NewsCard'

const tryouts = NEWS.find((n) => n.category === 'tryouts')

/** La noticia de tryouts destacada en la home, mientras la inscripción siga abierta */
export function TryoutsBanner({ onContact }: { onContact: () => void }) {
  if (!tryouts || (tryouts.until && todayKey() > tryouts.until)) return null
  return (
    <section aria-label="Tryouts abiertos" className="px-16 max-lg:px-10 max-md:px-4">
      <NewsCard item={tryouts} featured onContact={onContact} />
    </section>
  )
}
