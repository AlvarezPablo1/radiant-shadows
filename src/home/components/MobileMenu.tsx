import { useState, type MouseEvent } from 'react'
import { cx } from '../lib/cx'
import { CONTACT_PATH, isActive } from '../lib/route'
import type { Page } from '../types'
import { Chevron } from './Chevron'

interface Props {
  sections: Page[]
  page: Page
  onContact: () => void
}

// el tamaño se ajusta al alto de la pantalla, así entran todas las opciones en celulares chicos
const item = 'animate-menu-in py-1.5 font-display text-[clamp(22px,min(7vw,4.2vh),30px)] tracking-[0.06em]'
const delay = (i: number) => ({ animationDelay: `${i * 0.04}s` })

/** Menú a pantalla completa del celular (se monta sólo cuando está abierto) */
export function MobileMenu({ sections, page, onContact }: Props) {
  return (
    // se puede scrollear si no entra; "my-auto" centra las opciones cuando sobra lugar y las deja arriba cuando no
    <div
      id="menu"
      className="fixed inset-0 z-19 hidden flex-col overflow-y-auto overscroll-contain bg-night px-8 pt-[calc(var(--header-h)+16px)] pb-[calc(32px+env(safe-area-inset-bottom,0px))] max-md:flex"
    >
      <nav aria-label="Menú" className="my-auto flex flex-col gap-1">
        {sections.map((s, i) => {
          if (s.children) return <MenuGroup key={s.path} section={s} page={page} index={i} />
          if (s.path === CONTACT_PATH) {
            const open = (e: MouseEvent) => {
              e.preventDefault()
              onContact()
            }
            return (
              <a
                key={s.path}
                href={s.path}
                onClick={open}
                style={delay(i)}
                className="mt-5 animate-menu-in rounded-full bg-cta pt-2 pb-1.5 text-center font-display text-[19px] tracking-[0.12em] text-white shadow-[0_6px_22px_rgb(122_40_226/0.45)]"
              >
                {s.label}
              </a>
            )
          }
          return (
            <a key={s.path} href={s.path} style={delay(i)} className={cx(item, 'border-b border-violet-hi/15', s === page ? 'text-lilac' : 'text-mist')}>
              {s.label}
            </a>
          )
        })}
      </nav>
    </div>
  )
}

/** "Nuestro equipo": se abre como acordeón, y arranca abierto si estás en una de sus páginas */
function MenuGroup({ section, page, index }: { section: Page; page: Page; index: number }) {
  const active = isActive(section, page)
  const [open, setOpen] = useState(active)
  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        style={delay(index)}
        className={cx(item, 'flex w-full cursor-pointer items-center justify-between border-b border-violet-hi/15 text-left', active ? 'text-lilac' : 'text-mist')}
      >
        {section.label}
        <Chevron open={open} className="size-3 border-r-3 border-b-3" />
      </button>
      {open && (
        <div className="flex flex-col border-l-2 border-violet-hi/40 pt-1 pb-2 pl-4">
          {section.children!.map((c) => (
            <a key={c.path} href={c.path} className={cx('py-1 font-display text-[clamp(17px,min(5vw,3.2vh),22px)] tracking-[0.06em]', c === page ? 'text-lilac' : 'text-haze')}>
              {c.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
