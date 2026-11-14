import { useCallback, useRef, useState } from 'react'
import { cx } from '../../lib/cx'
import { useEscape } from '../../lib/hooks'
import type { Page } from '../../types'
import { Chevron } from '../Chevron'
import { navLink, navLinkActive } from './navStyles'

interface Props {
  section: Page
  page: Page
  active: boolean
}

/** Desplegable del nav: se abre al pasar el mouse, al hacer click o con el teclado */
export function NavDropdown({ section, page, active }: Props) {
  const [open, setOpen] = useState(false)
  const button = useRef<HTMLButtonElement>(null)

  const closeAndFocus = useCallback(() => {
    setOpen(false)
    button.current?.focus()
  }, [])
  useEscape(open, closeAndFocus)

  return (
    <div
      className="relative"
      // sólo con mouse: en pantallas táctiles el toque ya lo abre con el click
      onPointerEnter={(e) => e.pointerType === 'mouse' && setOpen(true)}
      onPointerLeave={(e) => e.pointerType === 'mouse' && setOpen(false)}
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && setOpen(false)}
    >
      <button
        ref={button}
        aria-expanded={open}
        aria-haspopup="true"
        // con mouse ya está abierto por el hover, así que el click no lo cierra
        onClick={(e) => setOpen((o) => (e.nativeEvent as PointerEvent).pointerType === 'mouse' || !o)}
        className={cx(navLink, 'inline-flex cursor-pointer items-center gap-2', active && navLinkActive)}
      >
        {section.label}
        <Chevron open={open} />
      </button>

      <div
        className={cx(
          'absolute top-full left-1/2 mt-2.5 flex min-w-57.5 -translate-x-1/2 flex-col rounded-xl border border-violet-hi/30 bg-night/94 p-2 shadow-[0_18px_40px_rgb(0_0_0/0.5)] backdrop-blur-md',
          'transition-[opacity,translate,visibility] duration-180',
          // puente invisible para que el panel no se cierre al bajar el mouse
          'before:absolute before:inset-x-0 before:-top-3 before:h-3',
          open ? 'visible translate-y-0 opacity-100' : 'invisible -translate-y-1.5 opacity-0',
        )}
      >
        {section.children!.map((c) => (
          <a
            key={c.path}
            href={c.path}
            aria-current={c === page ? 'page' : undefined}
            className={cx(
              'rounded-lg px-3.5 py-2.25 font-display text-[19px] tracking-[0.06em] whitespace-nowrap transition-colors duration-150 hover:bg-violet/22 hover:text-white focus-visible:bg-violet/22 focus-visible:text-white',
              c === page ? 'text-lilac' : 'text-mist',
            )}
          >
            {c.label}
          </a>
        ))}
      </div>
    </div>
  )
}
