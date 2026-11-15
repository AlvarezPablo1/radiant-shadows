export type Team = 'main' | 'gc'

/**
 * Logo del nav, mascota de cada equipo (la imagen de las páginas "Próximamente")
 * y video de fondo del héroe de la home (WebM + MP4 para Safari, en 4K y en una versión liviana para celular, + imagen del primer cuadro)
 */
export const TEAM_BRAND: Record<Team, { logo: string; mascot: string; heroVideo: { webm: string; mp4: string; mobileWebm: string; mobileMp4: string; poster: string } }> = {
  main: {
    logo: '/brand/logos/rs-nav.webp',
    mascot: '/brand/mascots/dragon-proximamente.webp',
    heroVideo: { webm: '/brand/hero/dragon-roar.webm', mp4: '/brand/hero/dragon-roar.mp4', mobileWebm: '/brand/hero/dragon-roar-m.webm', mobileMp4: '/brand/hero/dragon-roar-m.mp4', poster: '/brand/hero/dragon-roar-poster.webp' },
  },
  gc: {
    logo: '/brand/logos/gc-nav.webp',
    mascot: '/brand/mascots/dragona-proximamente.webp',
    heroVideo: { webm: '/brand/hero/dragona-fire.webm', mp4: '/brand/hero/dragona-fire.mp4', mobileWebm: '/brand/hero/dragona-fire-m.webm', mobileMp4: '/brand/hero/dragona-fire-m.mp4', poster: '/brand/hero/dragona-fire-poster.webp' },
  },
}
