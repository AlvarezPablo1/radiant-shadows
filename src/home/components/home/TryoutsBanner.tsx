import { useContent } from '../../lib/useContent'
import { NewsCard } from '../news/NewsCard'

/** La noticia de tryouts destacada en la home, mientras la inscripción siga abierta */
export function TryoutsBanner({ onContact }: { onContact: () => void }) {
  const tryouts = useContent().news.find((n) => n.category === 'tryouts')
  if (!tryouts) return null // las que ya cerraron no llegan acá (ver lib/content)
  return (
    <section aria-label="Tryouts abiertos" className="px-16 max-lg:px-10 max-md:px-4">
      <NewsCard item={tryouts} variant="banner" onContact={onContact} />
    </section>
  )
}
