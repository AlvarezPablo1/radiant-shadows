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

const item = 'animate-menu-in py-1.5 font-display text-[44px] tracking-[0.04em]'
const delay = (i: number) => ({ animationDelay: `${i * 0.04}s` })

/** Menú a pantalla completa del celular (se monta sólo cuando está abierto) */
export function MobileMenu({ sections, page, onContact }: Props) {
  return (
    <div
      id="menu"
      className="fixed inset-0 z-19 hidden flex-col justify-center gap-1.5 bg-night/97 px-8 pt-[calc(var(--nav-h)+24px)] pb-20 max-md:flex"
    >
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
              className={cx(item, 'mt-7 rounded-full bg-cta pt-3.5 pb-2.5 text-center text-[32px] text-white shadow-[0_8px_28px_rgb(122_40_226/0.45)]')}
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
            <a key={c.path} href={c.path} className={cx('py-1 font-display text-[28px] tracking-[0.04em]', c === page ? 'text-lilac' : 'text-haze')}>
              {c.label}
            </a>
          ))}
        </div>
      )}
    </>
  )
}
