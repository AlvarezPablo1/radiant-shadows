/** Persona del staff o creador de contenido */
export interface Person {
  role: string
  name: string
  /** apodo con el que se la conoce */
  nick: string
  age: number
  /** foto recortada sin fondo; si falta se muestra una silueta */
  photo?: string
  instagram?: string
  x?: string
  twitch?: string
}

/** Staff de la organización, en el orden en que se muestra (alternando imagen y texto) */
export const STAFF: Person[] = [
  {
    role: 'CEO',
    name: 'Bianca Margulies',
    nick: 'Caby',
    age: 33,
    instagram: 'https://www.instagram.com/bianmargulies/',
    x: 'https://x.com/caaabyy',
  },
  {
    role: 'General Manager',
    name: 'Irene Nuñez',
    nick: 'Chinarda',
    age: 28,
    instagram: 'https://www.instagram.com/chinarda/',
    x: 'https://x.com/chinardavibes',
    twitch: 'https://www.twitch.tv/chinardavibes',
  },
  { role: 'Directora deportiva', name: 'Carla Politano', nick: 'Poli', age: 23, x: 'https://x.com/07khaleesi_' },
  {
    role: 'Performance & Mental Coach',
    name: 'Jazmín Cabrera',
    nick: 'Lexa',
    age: 20,
    instagram: 'https://www.instagram.com/_.devils_angel.__/',
    x: 'https://x.com/lexa505',
  },
  { role: 'Community Manager', name: 'Carla Politano', nick: 'Poli', age: 23, x: 'https://x.com/07khaleesi_' },
]

/** Creadores de contenido */
export const CREATORS: Person[] = [
  {
    role: 'Creadora de contenido',
    name: 'Lucía',
    nick: 'Coti',
    age: 29,
    instagram: 'https://www.instagram.com/soycoti_/',
    x: 'https://x.com/cotideterracota',
    twitch: 'https://www.twitch.tv/xccoti',
  },
]

/** "@usuario" a partir del link del perfil */
export const handleFromUrl = (url: string) => '@' + new URL(url).pathname.split('/').filter(Boolean)[0]
