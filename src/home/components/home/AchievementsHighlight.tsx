import { useContent } from '../../lib/useContent'
import { AchievementCard } from '../achievements/AchievementCard'
import { SectionHeading } from '../SectionHeading'
import { ActionButton } from './ActionButton'

/** Los mejores resultados (mejor puesto primero) con link a la sección Logros */
export function AchievementsHighlight() {
  const TOP = [...useContent().achievements].sort((a, b) => a.place - b.place).slice(0, 2)
  if (TOP.length === 0) return null
  return (
    <section aria-label="Logros destacados" className="px-16 max-lg:px-10 max-md:px-4">
      <SectionHeading kicker="Logros destacados" title="NUESTRO CAMINO" />
      <ul className="mt-10 grid grid-cols-2 gap-6 max-lg:grid-cols-1">
        {TOP.map((a) => (
          <li key={a.tournament + a.team}>
            <AchievementCard achievement={a} />
          </li>
        ))}
      </ul>
      <div className="mt-8 text-center">
        <ActionButton href="/logros" variant="ghost">
          VER TODOS LOS LOGROS
        </ActionButton>
      </div>
    </section>
  )
}
