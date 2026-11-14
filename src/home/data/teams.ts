export type Team = 'main' | 'gc'

/**
 * Logo del nav y mascota del héroe de cada equipo: la imagen quieta, la misma guiñando el ojo,
 * y, si tiene, el video volando (WebM con transparencia + versión HEVC para Safari + imagen del primer cuadro).
 */
export const TEAM_BRAND: Record<Team, { logo: string; mascot: string; wink: string; flight?: { webm: string; hevc: string; poster: string } }> = {
  main: {
    logo: '/brand/logos/rs-positive.png',
    mascot: '/brand/mascots/kael-dragon.png',
    wink: '/brand/mascots/kael-dragon-wink.png',
    flight: { webm: '/brand/mascots/kael-volando.webm', hevc: '/brand/mascots/kael-volando-hevc.mp4', poster: '/brand/mascots/kael-volando-poster.webp' },
  },
  gc: {
    logo: '/brand/logos/gc-positive.png',
    mascot: '/brand/mascots/nyra-gc.webp',
    wink: '/brand/mascots/nyra-gc-wink.webp',
    // sin video: el que había no quedaba bien recortado, se usa la imagen quieta que guiña
  },
}
