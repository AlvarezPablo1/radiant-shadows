import { useEffect, useRef } from 'react'
import { TEAM_BRAND, type Team } from '../data/teams'
import { useMediaQuery } from '../lib/hooks'
import { Dragon } from './Dragon'

/** primera vez que vuela después de cargar, y pausa entre vuelos (ms) */
const FIRST_FLIGHT = 3000
const BETWEEN_FLIGHTS: [number, number] = [8000, 12000]

// Safari reproduce WebM pero sin transparencia: ahí va la versión HEVC con canal alfa
const isSafari = /^((?!chrome|android|crios|fxios).)*safari/i.test(navigator.userAgent)

/**
 * La mascota del equipo sentada que, cada tanto, levanta vuelo y vuelve a sentarse (video con fondo transparente).
 * Hoy sólo Kael tiene video; los equipos sin video muestran la mascota quieta guiñando.
 * Los bordes se suavizan apenas: en algunos cuadros los cuernos y las alas tocan el borde del video original.
 * En celular y con "reducir movimiento" se muestra el dragón quieto de siempre (y el video ni se descarga).
 */
export function FlyingDragon({ team = 'main' }: { team?: Team }) {
  const { flight } = TEAM_BRAND[team]
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const mobile = useMediaQuery('(width < 861px)')
  const calm = reducedMotion || mobile
  const video = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const v = video.current
    if (calm || !flight || !v) return
    let timer: ReturnType<typeof setTimeout>
    const fly = () => {
      v.currentTime = 0
      v.play().catch(() => {}) // si el navegador no deja reproducir, queda sentado
    }
    const rest = () => {
      const [min, max] = BETWEEN_FLIGHTS
      timer = setTimeout(fly, min + Math.random() * (max - min))
    }
    v.addEventListener('ended', rest)
    // el video pesa: se descarga recién cuando terminó de cargar la página (mientras, se ve la imagen fija)
    const load = () => {
      v.preload = 'auto'
      v.load()
    }
    if (document.readyState === 'complete') load()
    else window.addEventListener('load', load, { once: true })
    timer = setTimeout(fly, FIRST_FLIGHT)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('load', load)
      v.removeEventListener('ended', rest)
    }
  }, [calm, flight, team])

  // sin video para este equipo: la mascota quieta guiñando
  if (calm || !flight) return <Dragon team={team} />
  return (
    <video
      key={team}
      ref={video}
      src={isSafari ? flight.hevc : flight.webm}
      poster={flight.poster}
      muted
      playsInline
      preload="none"
      aria-hidden="true"
      width={1920}
      height={1080}
      className="relative w-[min(200%,1200px)] max-w-none max-lg:w-[min(140%,760px)] drop-shadow-[0_0_40px_rgb(122_40_226/0.5)] mask-x-from-94% mask-x-to-100% mask-y-from-95% mask-y-to-100%"
    />
  )
}
