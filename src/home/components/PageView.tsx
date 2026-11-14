import { CREATORS, STAFF } from '../data/people'
import { MAIN_PLAYERS, MAIN_STAFF } from '../data/rosters'
import type { Page } from '../types'
import { AboutPage } from './about/AboutPage'
import { AchievementsPage } from './achievements/AchievementsPage'
import { CalendarPage } from './calendar/CalendarPage'
import { Hero } from './Hero'
import { HomePage } from './home/HomePage'
import { NewsPage } from './news/NewsPage'
import { PeoplePage } from './people/PeoplePage'
import { RosterPage } from './roster/RosterPage'

interface Props {
  page: Page
  isHome: boolean
  ready: boolean
  /** abre el formulario de contacto (lo usan la home y noticias) */
  onContact: () => void
}

/** Elige qué pantalla mostrar según la sección; las que todavía no tienen contenido muestran el héroe con "Próximamente" */
export function PageView({ page, isHome, ready, onContact }: Props) {
  if (isHome) return <HomePage page={page} ready={ready} onContact={onContact} />
  switch (page.path) {
    case '/quienes-somos':
      return <AboutPage page={page} ready={ready} />
    case '/logros':
      return <AchievementsPage page={page} ready={ready} />
    case '/noticias':
      return <NewsPage page={page} ready={ready} onContact={onContact} />
    case '/calendario':
      return <CalendarPage page={page} ready={ready} />
    case '/equipo/masculino':
      return <RosterPage page={page} players={MAIN_PLAYERS} staff={MAIN_STAFF} ready={ready} />
    case '/equipo/staff':
      return <PeoplePage page={page} people={STAFF} ready={ready} />
    case '/equipo/creadores':
      return <PeoplePage page={page} people={CREATORS} ready={ready} />
    default:
      return <Hero page={page} isHome={isHome} ready={ready} />
  }
}
