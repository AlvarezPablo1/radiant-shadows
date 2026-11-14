import type { Page } from '../../types'
import { FlyingDragon } from '../FlyingDragon'
import { Hero } from '../Hero'
import { AboutTeaser } from './AboutTeaser'
import { AchievementsHighlight } from './AchievementsHighlight'
import { ActionButton } from './ActionButton'
import { FollowBand } from './FollowBand'
import { JoinCta } from './JoinCta'
import { NextMatch } from './NextMatch'
import { RosterPreview } from './RosterPreview'
import { TryoutsBanner } from './TryoutsBanner'

/** Home: héroe con botones y, al bajar, tryouts (mientras estén abiertos), próximo partido, roster, logros, quiénes somos, redes y contacto */
export function HomePage({ page, ready, onContact }: { page: Page; ready: boolean; onContact: () => void }) {
  return (
    <>
      <Hero
        page={page}
        isHome
        ready={ready}
        art={<FlyingDragon />}
        actions={
          <div className="mt-8 flex flex-wrap gap-3 max-md:justify-center">
            <ActionButton href="/equipo/masculino">CONOCÉ AL EQUIPO</ActionButton>
            <ActionButton href="/calendario" variant="ghost">
              VER CALENDARIO
            </ActionButton>
          </div>
        }
      />
      <div className="relative z-2 mx-auto flex w-full max-w-page flex-col gap-28 pb-28 max-md:gap-20 max-md:pb-20">
        <TryoutsBanner onContact={onContact} />
        <NextMatch />
        <RosterPreview />
        <AchievementsHighlight />
        <AboutTeaser />
        <FollowBand />
        <JoinCta onContact={onContact} />
      </div>
    </>
  )
}
