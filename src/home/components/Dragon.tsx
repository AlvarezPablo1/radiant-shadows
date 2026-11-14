import { cx } from '../lib/cx'
import { useWink } from '../lib/hooks'

/** Kael flotando; cada tanto guiña el ojo (la versión guiñando va encima y aparece un instante) */
export function Dragon() {
  const winking = useWink()
  return (
    <div className="relative w-[min(100%,560px)] animate-float drop-shadow-[0_0_40px_rgb(122_40_226/0.55)] max-md:w-[min(62vw,280px)]">
      <img src="/brand/mascots/kael-dragon.png" alt="" className="w-full" />
      <img
        src="/brand/mascots/kael-dragon-wink.png"
        alt=""
        className={cx('absolute inset-0 w-full', winking ? 'opacity-100' : 'opacity-0')}
      />
    </div>
  )
}
