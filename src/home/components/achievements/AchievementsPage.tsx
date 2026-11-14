import { ACHIEVEMENTS } from '../../data/achievements'
import type { Page } from '../../types'
import { PageHeader } from '../PageHeader'
import { AchievementCard } from './AchievementCard'

/** "Logros": un casillero por resultado, del más destacado al menos */
export function AchievementsPage({ page, ready }: { page: Page; ready: boolean }) {
  return (
    <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-[calc(var(--header-h)+32px)] pb-24 max-md:pt-[calc(var(--header-h)+16px)] max-md:pb-16">
      <PageHeader page={page} ready={ready} />
      <ul className="mt-14 grid grid-cols-2 gap-6 px-16 max-lg:grid-cols-1 max-lg:px-10 max-md:mt-10 max-md:px-4">
        {ACHIEVEMENTS.map((a) => (
          <li key={a.tournament + a.team}>
            <AchievementCard achievement={a} />
          </li>
        ))}
      </ul>
      <p className="mt-12 px-4 text-center font-script text-[clamp(18px,2vw,24px)] text-ember">y vamos por más…</p>
    </main>
  )
}
