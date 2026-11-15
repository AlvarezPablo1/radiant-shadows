import type { Team } from '../../data/teams'
import type { Page } from '../../types'
import { HomeHero } from './HomeHero'
import { AboutTeaser } from './AboutTeaser'
import { AchievementsHighlight } from './AchievementsHighlight'
import { ActionButton } from '../../../shared/ui/ActionButton'
import { FollowBand } from './FollowBand'
import { JoinCta } from './JoinCta'
import { NextMatch } from './NextMatch'
import { RosterPreview } from './RosterPreview'
import { TryoutsBanner } from './TryoutsBanner'

/** Home: héroe con botones y, al bajar, próximo partido (si hay), tryouts (mientras estén abiertos), roster, logros, quiénes somos, redes y contacto */
export function HomePage({ page, ready, onContact, team }: { page: Page; ready: boolean; onContact: () => void; team?: Team }) {
  return (
    <>
      <HomeHero
        page={page}
        // el video del equipo del próximo partido: el dragón (MAIN) o la dragona (GC)
        team={team}
        ready={ready}
        actions={
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <ActionButton href="/equipo/masculino">CONOCÉ AL EQUIPO</ActionButton>
            <ActionButton href="/calendario" variant="ghost">
              VER CALENDARIO
            </ActionButton>
          </div>
        }
      />
      <div className="relative z-2 mx-auto flex w-full max-w-page flex-col gap-28 pb-28 max-md:gap-20 max-md:pb-20">
        {/* si hay un partido en el calendario, va primero, justo debajo del héroe */}
        <NextMatch />
        <TryoutsBanner onContact={onContact} />
        <RosterPreview />
        <AchievementsHighlight />
        <AboutTeaser />
        <FollowBand />
        <JoinCta onContact={onContact} />
      </div>
    </>
  )
}
