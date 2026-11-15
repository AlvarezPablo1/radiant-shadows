import { useEffect, useRef, useState } from 'react'
import { cx } from '../../../shared/lib/cx'
import { useMediaQuery } from '../../../shared/lib/hooks'
import { TEAM_BRAND, type Team } from '../../data/teams'

/** pausa entre una vez y la otra mientras se está viendo (ms), y cuánto antes del final se avisa con `onNearEnd` (s) */
const BETWEEN_PLAYS: [number, number] = [5000, 7000]
const NEAR_END = 1.8

/**
 * Video del dragón de fondo del héroe. Viene sobre negro: con "screen" el negro desaparece y queda sólo el dragón.
 * El video ya viene oscurecido (al 30% del brillo, horneado en el archivo: así el navegador no aplica un filtro en cada
 * cuadro y pesa mucho menos). Detrás, el fondo del héroe también se oscurece.
 * - Se mueve cada vez que el héroe entra en pantalla, y mientras se ve, de nuevo cada unos segundos. Fuera de pantalla, pausa.
 * - Sin parpadeo: mientras el video arranca se ve la imagen del primer cuadro; el video aparece (con un fundido,
 *   mientras la imagen se va) recién cuando ya está pintando cuadros.
 * - En compu va en 1440p y en celular en 1080p y con "reducir movimiento" queda la imagen quieta.
 * `team`: dragón en MAIN, dragona en GC. `onNearEnd`: una vez por vuelta, un poco antes de que termine de moverse.
 */
export function HeroVideo({ team = 'main', onNearEnd }: { team?: Team; onNearEnd?: () => void }) {
  const SRC = TEAM_BRAND[team].heroVideo
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const mobile = useMediaQuery('(width < 861px)')
  const video = useRef<HTMLVideoElement>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const v = video.current
    if (reducedMotion || !v) return
    setShown(false) // video nuevo (otro equipo o tamaño de pantalla): hasta que pinte, se ve la imagen quieta
    let timer: ReturnType<typeof setTimeout> | undefined
    let warned = false
    let inView = false
    const play = () => {
      clearTimeout(timer)
      if (!inView || document.hidden) return
      warned = false
      v.currentTime = 0
      v.play().catch(() => {}) // si el navegador no deja reproducir, queda la imagen quieta
    }
    const onPlaying = () => {
      // se muestra cuando ya hay un cuadro pintado (así no se ve el hueco negro del arranque)
      const reveal = () => setShown(true)
      if ('requestVideoFrameCallback' in v) v.requestVideoFrameCallback(reveal)
      else requestAnimationFrame(reveal)
    }
    const tick = () => {
      if (!warned && v.duration && v.currentTime >= v.duration - NEAR_END) {
        warned = true
        onNearEnd?.()
      }
    }
    const rest = () => {
      const [min, max] = BETWEEN_PLAYS
      timer = setTimeout(play, min + Math.random() * (max - min))
    }
    // cada vez que el héroe entra en pantalla, se mueve; al salir, se pausa
    const io = new IntersectionObserver(
      ([e]) => {
        const was = inView
        inView = e.isIntersecting
        if (inView && !was) play()
        if (!inView) {
          clearTimeout(timer)
          v.pause()
        }
      },
      { threshold: 0.35 },
    )
    const onVisibility = () => !document.hidden && v.paused && play()
    v.addEventListener('playing', onPlaying)
    v.addEventListener('timeupdate', tick)
    v.addEventListener('ended', rest)
    document.addEventListener('visibilitychange', onVisibility)
    io.observe(v.parentElement ?? v)
    return () => {
      clearTimeout(timer)
      io.disconnect()
      v.removeEventListener('playing', onPlaying)
      v.removeEventListener('timeupdate', tick)
      v.removeEventListener('ended', rest)
      document.removeEventListener('visibilitychange', onVisibility)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, team, mobile])

  // el video ocupa todo el héroe y las patas se difuminan abajo
  const cls = 'absolute inset-0 size-full object-cover object-center mix-blend-screen max-md:object-[50%_35%]'
  return (
    <>
      {/* fondo oscurecido detrás del dragón (se va aclarando hacia abajo para empalmar con el resto de la página) */}
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2 bg-black mask-b-from-60% mask-b-to-100%" />
      <div aria-hidden="true" className="pointer-events-none absolute top-0 left-1/2 h-full w-screen -translate-x-1/2 overflow-hidden mask-b-from-50% mask-b-to-85% mask-t-from-85% mask-t-to-100%">
        {/* primer cuadro quieto: se ve mientras el video carga o arranca, y se va cuando aparece el video (si no, se ven dos dragones) */}
        <img src={SRC.poster} alt="" className={cx(cls, 'transition-opacity duration-500', shown && !reducedMotion ? 'opacity-0' : 'opacity-100')} />
        {!reducedMotion && (
          <video
            key={`${team}-${mobile}`}
            ref={video}
            muted
            playsInline
            preload="auto"
            disablePictureInPicture
            className={cx(cls, 'transition-opacity duration-500', shown ? 'opacity-100' : 'opacity-0')}
          >
            <source src={mobile ? SRC.mobileWebm : SRC.webm} type="video/webm" />
            <source src={mobile ? SRC.mobileMp4 : SRC.mp4} type="video/mp4" />
          </video>
        )}
      </div>
    </>
  )
}
