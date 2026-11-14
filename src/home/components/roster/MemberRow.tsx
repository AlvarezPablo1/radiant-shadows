import { useEffect, useRef, useState, type CSSProperties } from 'react'
import type { Member } from '../../data/rosters'
import { cx } from '../../lib/cx'
import { useMediaQuery } from '../../lib/hooks'
import { CarouselControls } from './CarouselControls'
import { MemberCard } from './MemberCard'

interface Props {
  members: Member[]
  label: string
  /** alto de la fila (puede usar var(--n), la cantidad de integrantes): todas las fotos toman este alto */
  heightClass: string
  /** mostrar el rango en la ficha (sólo para jugadores) */
  showRank?: boolean
  className?: string
}

/**
 * Escritorio: fila a todo el ancho; el integrante con el mouse encima se destaca y los demás se apagan.
 * Celular: carrusel; el del centro se ve nítido con su ficha, los de los costados desenfocados,
 * y tocar a uno (o las flechas / puntos) lo trae al centro.
 */
export function MemberRow({ members, label, heightClass, showRank = true, className }: Props) {
  const mobile = useMediaQuery('(width < 861px)')
  const [hovered, setHovered] = useState<number | null>(null)
  const [centered, setCentered] = useState(0)
  const list = useRef<HTMLUListElement>(null)

  // celular: cuál quedó en el centro al deslizar
  useEffect(() => {
    const ul = list.current
    if (!mobile || !ul) return
    let frame = 0
    const onScroll = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const middle = ul.scrollLeft + ul.clientWidth / 2
        const items = [...ul.children] as HTMLElement[]
        const distances = items.map((li) => Math.abs(li.offsetLeft + li.offsetWidth / 2 - middle))
        setCentered(distances.indexOf(Math.min(...distances)))
      })
    }
    onScroll()
    ul.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      ul.removeEventListener('scroll', onScroll)
    }
  }, [mobile])

  const goTo = (i: number) => {
    const li = list.current?.children[i] as HTMLElement | undefined
    li?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' })
  }

  const active = mobile ? centered : hovered

  return (
    <div className={className}>
      <ul
        ref={list}
        aria-label={label}
        style={{ '--n': members.length } as CSSProperties}
        className={cx(
          'flex w-full items-end justify-center px-[3vw]',
          'max-md:snap-x max-md:snap-mandatory max-md:justify-start max-md:overflow-x-auto max-md:px-[19vw] max-md:[scrollbar-width:none]',
          heightClass,
        )}
      >
        {members.map((m, i) => (
          <li key={m.name + m.role} className="h-full min-w-0 flex-1 max-md:w-[62vw] max-md:flex-none max-md:snap-center">
            <MemberCard
              member={m}
              showRank={showRank}
              active={active === i}
              dimmed={!mobile && active !== null && active !== i}
              blurred={mobile && active !== i}
              onSelect={() => (mobile ? goTo(i) : setHovered(i))}
              onLeave={() => !mobile && setHovered((h) => (h === i ? null : h))}
            />
          </li>
        ))}
      </ul>
      {members.length > 1 && <CarouselControls names={members.map((m) => m.name)} current={centered} onGo={goTo} />}
    </div>
  )
}
