import { useContent } from '../../lib/useContent'
import type { Page } from '../../types'
import { PageHeader } from '../ui/PageHeader'
import { NewsCard } from './NewsCard'

/**
 * "Noticias": la principal (la marcada en el admin, o si no hay ninguna la primera) ocupa dos columnas,
 * imagen arriba y textos abajo, en una fila de alto; el resto va en grilla de 3, en el orden del admin.
 */
export function NewsPage({ page, ready, onContact }: { page: Page; ready: boolean; onContact: () => void }) {
  const all = useContent().news
  const main = all.find((n) => n.featured) ?? all[0]
  const news = main ? [main, ...all.filter((n) => n !== main)] : all
  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />
      <ul className="mt-14 grid grid-flow-dense grid-cols-3 gap-6 px-16 max-lg:grid-cols-2 max-lg:px-10 max-md:mt-10 max-md:grid-cols-1 max-md:px-4">
        {news.map((n, i) => (
          <li key={n.id} className={i === 0 ? 'col-span-2 max-md:col-span-1' : undefined}>
            <NewsCard item={n} variant={i === 0 ? 'hero' : 'card'} stretch={i === 1} onContact={onContact} />
          </li>
        ))}
      </ul>
    </main>
  )
}
