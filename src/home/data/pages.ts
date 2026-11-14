import type { Page } from '../types'

/* Contenido de cada sección: título y texto del encabezado. Las que no tienen pantalla propia muestran "Próximamente". */

export const HOME: Page = {
  path: '/',
  label: 'Inicio',
  kicker: 'Esports · Valorant',
  title: 'RADIANT SHADOWS',
  script: 'el fuego sigue',
  text: 'Organización argentina de esports de Valorant. Competimos con nuestro roster masculino y Game Changers, y cada partida la jugamos con todo.',
}

/**
 * Orden del nav. Los 3 primeros van a la izquierda del logo (quiénes somos: la org, el equipo y sus logros);
 * el resto a la derecha (lo que pasa: noticias y calendario, después la tienda y al final el botón de contacto).
 */
export const SECTIONS: Page[] = [
  { path: '/quienes-somos', label: 'Quiénes somos', kicker: 'Radiant Shadows', title: 'QUIÉNES SOMOS', script: 'el fuego sigue', text: 'Radiant Shadows es una organización de esports de Valorant nacida en 2025 en Argentina. Competimos con nuestro roster masculino y nuestro equipo de Game Changers, con una idea clara: detrás de cada partida hay mucho más que un juego.' },
  {
    path: '/equipo', label: 'Nuestro equipo', kicker: 'Radiant Shadows', title: 'NUESTRO EQUIPO', script: 'próximamente', text: '',
    children: [
      { path: '/equipo/masculino', label: 'Masculino', kicker: 'Nuestro equipo', title: 'MASCULINO', script: 'próximamente', text: 'Conocé a los dragones del roster masculino: jugadores, roles y su camino en cada competencia.' },
      { path: '/equipo/game-changers', label: 'Game Changers', kicker: 'Nuestro equipo', title: 'GAME CHANGERS', script: 'próximamente', text: 'Conocé a las dragonas de Game Changers: jugadoras, roles y su camino en cada competencia.' },
      { path: '/equipo/creadores', label: 'Creadores de contenido', kicker: 'Nuestro equipo', title: 'CREADORES DE CONTENIDO', script: 'próximamente', text: 'Las caras que llevan el fuego de Radiant Shadows a streams, videos y redes.' },
      { path: '/equipo/staff', label: 'Staff', kicker: 'Nuestro equipo', title: 'STAFF', script: 'próximamente', text: 'La gente que trabaja detrás de escena para que los dragones compitan y crezcan.' },
    ],
  },
  { path: '/logros', label: 'Logros', kicker: 'Radiant Shadows', title: 'LOGROS', script: 'próximamente', text: 'Cada copa, cada podio y cada partido que nos trajo hasta acá, todo en un solo lugar.' },
  { path: '/noticias', label: 'Noticias', kicker: 'Radiant Shadows', title: 'NOTICIAS', script: 'próximamente', text: 'Resultados, tryouts, anuncios y todo lo que pasa en el equipo, en un solo lugar.' },
  { path: '/calendario', label: 'Calendario', kicker: 'Radiant Shadows', title: 'CALENDARIO', script: 'próximamente', text: 'Partidos, torneos, streams y todo lo que se viene. Tocá un día para ver el detalle.' },
  { path: '/shop', label: 'Tienda', kicker: 'Tienda oficial', title: 'TIENDA', script: 'próximamente', text: 'La indumentaria oficial de los dragones está en camino. Camisetas, buzos y más.' },
  { path: '/contacto', label: 'Contactanos', kicker: 'Hablemos', title: 'CONTACTANOS', script: 'próximamente', text: 'Muy pronto vas a poder escribirnos desde acá para sponsors, prensa o tryouts.' },
]
