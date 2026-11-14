import { ofTeam } from '../data/rosters'
import { useContent } from '../lib/useContent'
import type { Team } from '../data/teams'
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
  team: Team
}

/** Elige qué pantalla mostrar según la sección; las que todavía no tienen contenido muestran el héroe con "Próximamente" */
export function PageView({ page, isHome, ready, onContact, team }: Props) {
  const content = useContent()
  if (isHome) return <HomePage page={page} ready={ready} onContact={onContact} team={team} />
  switch (page.path) {
    case '/quienes-somos':
      return <AboutPage page={page} ready={ready} />
    case '/logros':
      return <AchievementsPage page={page} ready={ready} />
    case '/noticias':
      return <NewsPage page={page} ready={ready} onContact={onContact} />
    case '/calendario':
      return <CalendarPage page={page} ready={ready} />
    case '/equipo/game-changers': {
      // mientras no haya jugadoras cargadas, la página queda con el "Próximamente"
      const players = ofTeam(content.players, 'Game Changers')
      const staff = ofTeam(content.coaches, 'Game Changers')
      if (players.length === 0 && staff.length === 0) return <Hero page={page} isHome={isHome} ready={ready} team={team} />
      return <RosterPage page={page} players={players} staff={staff} ready={ready} />
    }
    case '/equipo/masculino':
      return <RosterPage page={page} players={ofTeam(content.players, 'Masculino')} staff={ofTeam(content.coaches, 'Masculino')} ready={ready} />
    case '/equipo/staff':
      return <PeoplePage page={page} people={content.staff} ready={ready} />
    case '/equipo/creadores':
      return <PeoplePage page={page} people={content.creators} ready={ready} />
    default:
      return <Hero page={page} isHome={isHome} ready={ready} team={team} />
  }
}
