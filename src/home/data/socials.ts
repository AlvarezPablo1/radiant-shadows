import { siInstagram, siTwitch, siX, type SimpleIcon } from 'simple-icons'

export interface Social {
  name: string
  handle: string
  url: string
  icon: SimpleIcon
}

/** Redes del equipo: se muestran en la barra de arriba del nav y en el footer */
export const SOCIALS: Social[] = [
  { name: 'Twitch', handle: 'radiant_shadowss', url: 'https://twitch.tv/radiant_shadowss', icon: siTwitch },
  { name: 'X', handle: '@radiantshadows_', url: 'https://x.com/radiantshadows_', icon: siX },
  { name: 'Instagram', handle: '@team.radiantshadows', url: 'https://www.instagram.com/team.radiantshadows', icon: siInstagram },
]
