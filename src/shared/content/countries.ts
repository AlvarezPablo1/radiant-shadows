/** Nacionalidades que se pueden elegir en el admin, con su bandera */
export const COUNTRIES: { name: string; flag: string }[] = [
  { name: 'Argentina', flag: '🇦🇷' },
  { name: 'Uruguay', flag: '🇺🇾' },
  { name: 'Chile', flag: '🇨🇱' },
  { name: 'Paraguay', flag: '🇵🇾' },
  { name: 'Bolivia', flag: '🇧🇴' },
  { name: 'Perú', flag: '🇵🇪' },
  { name: 'Brasil', flag: '🇧🇷' },
  { name: 'Colombia', flag: '🇨🇴' },
  { name: 'Venezuela', flag: '🇻🇪' },
  { name: 'Ecuador', flag: '🇪🇨' },
  { name: 'México', flag: '🇲🇽' },
  { name: 'España', flag: '🇪🇸' },
  { name: 'Estados Unidos', flag: '🇺🇸' },
]

export const countryFlag = (name?: string) => COUNTRIES.find((c) => c.name === name)?.flag ?? ''
