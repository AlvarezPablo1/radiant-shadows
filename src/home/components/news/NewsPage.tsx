import { useContent } from '../../lib/useContent'
import type { Page } from '../../types'
import { PageHeader } from '../ui/PageHeader'
import { NewsCard } from './NewsCard'

/** "Noticias": la más nueva en un bloque grande (2×2) y el resto alrededor, en grilla de 3 */
export function NewsPage({ page, ready, onContact }: { page: Page; ready: boolean; onContact: () => void }) {
  const news = useContent().news
  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />
      <ul className="mt-14 grid grid-flow-dense grid-cols-3 gap-6 px-16 max-lg:grid-cols-2 max-lg:px-10 max-md:mt-10 max-md:grid-cols-1 max-md:px-4">
        {news.map((n, i) => (
          <li key={n.id} className={i === 0 ? 'col-span-2 row-span-2 max-md:col-span-1 max-md:row-span-1' : undefined}>
            <NewsCard item={n} variant={i === 0 ? 'hero' : 'card'} onContact={onContact} />
          </li>
        ))}
      </ul>
    </main>
  )
}
