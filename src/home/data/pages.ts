import type { Page } from '../types'

/* Contenido de cada sección. Por ahora todas muestran "Próximamente". */

export const HOME: Page = {
  path: '/',
  label: 'Inicio',
  kicker: 'Esports · Valorant',
  title: 'RADIANT SHADOWS',
  script: 'el fuego sigue',
  text: 'Estamos preparando nuestra nueva casa. Muy pronto vas a poder conocer al equipo, nuestros rosters y todo lo que se viene.',
}

export const SECTIONS: Page[] = [
  { path: '/quienes-somos', label: 'Quiénes somos', kicker: 'Radiant Shadows', title: 'QUIÉNES SOMOS', script: 'próximamente', text: 'Nuestra historia, nuestra forma de competir y la gente que mantiene vivo el fuego.' },
  {
    path: '/equipo', label: 'Nuestro equipo', kicker: 'Radiant Shadows', title: 'NUESTRO EQUIPO', script: 'próximamente', text: '',
    children: [
      { path: '/equipo/masculino', label: 'Masculino', kicker: 'Nuestro equipo', title: 'MASCULINO', script: 'próximamente', text: 'Conocé a los dragones del roster masculino: jugadores, roles y su camino en cada competencia.' },
      { path: '/equipo/game-changers', label: 'Game Changers', kicker: 'Nuestro equipo', title: 'GAME CHANGERS', script: 'próximamente', text: 'Conocé a las dragonas de Game Changers: jugadoras, roles y su camino en cada competencia.' },
      { path: '/equipo/creadores', label: 'Creadores de contenido', kicker: 'Nuestro equipo', title: 'CREADORES DE CONTENIDO', script: 'próximamente', text: 'Las caras que llevan el fuego de Radiant Shadows a streams, videos y redes.' },
      { path: '/equipo/staff', label: 'Staff', kicker: 'Nuestro equipo', title: 'STAFF', script: 'próximamente', text: 'Coaches, analistas y toda la gente que trabaja detrás de escena para que los dragones compitan.' },
    ],
  },
  { path: '/logros', label: 'Logros', kicker: 'Radiant Shadows', title: 'LOGROS', script: 'próximamente', text: 'Cada copa, cada podio y cada partido que nos trajo hasta acá, todo en un solo lugar.' },
  { path: '/shop', label: 'Tienda', kicker: 'Tienda oficial', title: 'TIENDA', script: 'próximamente', text: 'La indumentaria oficial de los dragones está en camino. Camisetas, buzos y más.' },
  { path: '/redes', label: 'Redes', kicker: 'Hablemos', title: 'RED SOCIAL', script: 'próximamente', text: 'Seguinos en nuestras redes sociales para estar al día con las últimas novedades.' },
  { path: '/calendario', label: 'Calendario', kicker: 'Hablemos', title: 'CALENDARIO', script: 'próximamente', text: 'Muy pronto vas a poder ver los eventos y torneos en los que participaremos.' },
  { path: '/contacto', label: 'Contactanos', kicker: 'Hablemos', title: 'CONTACTANOS', script: 'próximamente', text: 'Muy pronto vas a poder escribirnos desde acá para sponsors, prensa o tryouts.' },
]
