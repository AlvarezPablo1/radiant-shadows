import type { Member } from '../../../shared/content/rosters'
import { enter } from '../../lib/enter'
import type { Page } from '../../types'
import { Kicker } from '../../../shared/ui/Kicker'
import { PageHeader } from '../ui/PageHeader'
import { MemberRow } from './MemberRow'

interface Props {
  page: Page
  players: Member[]
  staff: Member[]
  ready: boolean
}

/** Pantalla de un roster: título, jugadores a todo el ancho y debajo el cuerpo técnico */
export function RosterPage({ page, players, staff, ready }: Props) {
  return (
    <main className="relative z-2 mx-auto flex min-h-svh w-full max-w-page flex-col pt-[calc(var(--header-h)+32px)] pb-16 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-10">
      <PageHeader page={page} ready={ready} />

      {players.length > 0 && (
        <MemberRow members={players} label="Jugadores" heightClass="mt-8 h-[min(68vh,660px,calc(165vw/var(--n)))] min-h-80 max-md:h-[62vh]" className={enter(ready, 'delay-240')} />
      )}

      {staff.length > 0 && (
        <section aria-labelledby="staff-title" className="mt-24 max-md:mt-16">
          <div className="text-center">
            <Kicker>Cuerpo técnico</Kicker>
            <h2 id="staff-title" className="mt-2 font-brand-title text-[clamp(22px,2.5vw,35px)]">
              STAFF
            </h2>
          </div>
          <MemberRow members={staff} label="Cuerpo técnico" heightClass="mx-auto mt-8 h-[min(56vh,540px)] min-h-80 max-w-5xl max-md:h-[56vh]" />
        </section>
      )}
    </main>
  )
}
