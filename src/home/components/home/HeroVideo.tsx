import { useEffect, useRef } from 'react'
import { useMediaQuery } from '../../../shared/lib/hooks'
import { TEAM_BRAND, type Team } from '../../data/teams'

/** primera vez que se mueve después de cargar, y pausa entre una vez y la otra (ms) */
const FIRST_PLAY = 2000
const BETWEEN_PLAYS: [number, number] = [5000, 7000]

/**
 * Video del dragón de fondo del héroe (4K). Viene sobre negro: con "screen" el negro desaparece y queda sólo el dragón,
 * oscurecido (brillo al 55%) para que el texto se lea bien. Detrás, el fondo del héroe también se oscurece.
 * Se mueve una vez y queda quieto unos segundos antes de volver a moverse. Abajo se funde con la página.
 * Con "reducir movimiento" queda el primer cuadro quieto.
 */
/** cuánto antes del final del video se avisa con `onNearEnd` (s) */
const NEAR_END = 1.8

/**
 * `team`: el video de cada equipo (dragón en MAIN, dragona en GC).
 * `onNearEnd`: se llama una vez por vuelta, un poco antes de que el dragón termine de moverse
 */
export function HeroVideo({ team = 'main', onNearEnd }: { team?: Team; onNearEnd?: () => void }) {
  const SRC = TEAM_BRAND[team].heroVideo
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current
    if (reducedMotion || !v) return
    let timer: ReturnType<typeof setTimeout>
    let warned = false
    const tick = () => {
      if (!warned && v.duration && v.currentTime >= v.duration - NEAR_END) {
        warned = true
        onNearEnd?.()
      }
    }
    const play = () => {
      warned = false
      v.currentTime = 0
      v.play().catch(() => {}) // si el navegador no deja reproducir, queda quieto
    }
    const rest = () => {
      const [min, max] = BETWEEN_PLAYS
      timer = setTimeout(play, min + Math.random() * (max - min))
    }
    v.addEventListener('ended', rest)
    v.addEventListener('timeupdate', tick)
    timer = setTimeout(play, FIRST_PLAY)
    return () => {
      clearTimeout(timer)
      v.removeEventListener('ended', rest)
      v.removeEventListener('timeupdate', tick)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, team])

  // el video ocupa todo el héroe (la cabeza ya queda por encima del texto) y las patas se difuminan abajo
  const cls = 'absolute inset-0 size-full object-cover object-center mix-blend-screen brightness-[0.30] max-md:object-[50%_35%]'
  return (
    <>
      {/* fondo oscurecido detrás del dragón (se va aclarando hacia abajo para empalmar con el resto de la página) */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2 bg-black mask-b-from-60% mask-b-to-100%" />
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2 overflow-hidden mask-b-from-50% mask-b-to-85% mask-t-from-85% mask-t-to-100%">
        {reducedMotion ? (
          <img src={SRC.poster} alt="" className={cls} />
        ) : (
          <video key={team} ref={video} muted playsInline preload="auto" poster={SRC.poster} className={cls}>
            <source src={SRC.webm} type="video/webm" />
            <source src={SRC.mp4} type="video/mp4" />
          </video>
        )}
      </div>
    </>
  )
}
