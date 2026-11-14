import { TEAM_BRAND, type Team } from '../data/teams'
import { cx } from '../lib/cx'
import { useWink } from '../lib/hooks'

/** La mascota del equipo flotando; cada tanto guiña el ojo (la versión guiñando va encima y aparece un instante) */
export function Dragon({ team = 'main' }: { team?: Team }) {
  const winking = useWink()
  const { mascot, wink } = TEAM_BRAND[team]
  return (
    <div className="relative w-[min(100%,560px)] animate-float drop-shadow-[0_0_40px_rgb(122_40_226/0.55)] max-md:w-[min(62vw,280px)]">
      <img src={mascot} alt="" className="w-full" />
      <img src={wink} alt="" className={cx('absolute inset-0 w-full', winking ? 'opacity-100' : 'opacity-0')} />
    </div>
  )
}
