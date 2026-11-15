import { TEAM_BRAND, type Team } from '../../data/teams'
import { cx } from '../../../shared/lib/cx'

/** La mascota del equipo flotando (dragón y dragona con las alas abiertas: grandes, pueden salirse un poco de su columna) */
export function Dragon({ team = 'main' }: { team?: Team }) {
  return (
    <div
      className={cx(
        'relative animate-float drop-shadow-[0_0_40px_rgb(122_40_226/0.55)]',
        team === 'main' ? 'w-[min(125%,700px)] max-w-none max-md:w-[min(78vw,340px)]' : 'w-[min(150%,860px)] max-w-none max-md:w-[min(92vw,420px)]',
      )}
    >
      {/* el dragón viene con un violeta muy brillante: se apaga un poco para que quede parejo con la dragona */}
      <img src={TEAM_BRAND[team].mascot} alt="" className={cx('w-full', team === 'main' && 'brightness-[0.82] saturate-[0.72]')} />
    </div>
  )
}
