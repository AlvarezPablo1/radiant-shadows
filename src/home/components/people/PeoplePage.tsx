import type { Person } from '../../../shared/content/people'
import type { Page } from '../../types'
import { PageHeader } from '../ui/PageHeader'
import { PersonRow } from './PersonRow'

/** Pantalla de personas (staff, creadores): encabezado y una fila por persona, alternando imagen-texto y texto-imagen */
export function PeoplePage({ page, people, ready }: { page: Page; people: Person[]; ready: boolean }) {
  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />
      <div className="mt-16 flex flex-col gap-10 px-16 max-lg:px-10 max-md:mt-10 max-md:gap-12 max-md:px-4">
        {people.map((p, i) => (
          <PersonRow key={p.role + p.nick} person={p} reversed={i % 2 === 1} />
        ))}
      </div>
    </main>
  )
}
