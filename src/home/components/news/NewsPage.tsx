import { useContent } from '../../lib/useContent'
import type { Page } from '../../types'
import { PageHeader } from '../PageHeader'
import { NewsCard } from './NewsCard'

/** "Noticias": la más nueva destacada a todo el ancho y el resto en grilla */
export function NewsPage({ page, ready, onContact }: { page: Page; ready: boolean; onContact: () => void }) {
  const [featured, ...rest] = useContent().news
  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />
      <div className="mt-14 flex flex-col gap-6 px-16 max-lg:px-10 max-md:mt-10 max-md:px-4">
        {featured && <NewsCard item={featured} featured onContact={onContact} />}
        <ul className="grid grid-cols-3 gap-6 max-lg:grid-cols-2 max-md:grid-cols-1">
          {rest.map((n) => (
            <li key={n.id}>
              <NewsCard item={n} onContact={onContact} />
            </li>
          ))}
        </ul>
      </div>
    </main>
  )
}
