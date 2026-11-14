import type { Member } from '../../data/rosters'
import { enter } from '../../lib/enter'
import type { Page } from '../../types'
import { Kicker } from '../Kicker'
import { PageHeader } from '../PageHeader'
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

      <MemberRow members={players} label="Jugadores" heightClass="mt-8 h-[min(68vh,660px,calc(165vw/var(--n)))] min-h-80 max-md:h-[62vh]" className={enter(ready, 'delay-240')} />

      <section aria-labelledby="staff-title" className="mt-24 max-md:mt-16">
        <div className="text-center">
          <Kicker>Cuerpo técnico</Kicker>
          <h2 id="staff-title" className="mt-2 font-display text-[clamp(40px,4.5vw,64px)] leading-none tracking-[0.02em] [text-shadow:3px_3px_0_var(--color-violet)]">
            STAFF
          </h2>
        </div>
        <MemberRow
          members={staff}
          label="Cuerpo técnico"
          heightClass="mx-auto mt-8 h-[min(56vh,540px)] min-h-80 max-w-5xl max-md:h-[56vh]"
        />
      </section>
    </main>
  )
}
