import type { MouseEvent } from 'react'
import { cx } from '../../lib/cx'
import { useScrolled } from '../../lib/hooks'
import { CONTACT_PATH, isActive } from '../../lib/route'
import { TEAM_BRAND, type Team } from '../../data/teams'
import type { Page } from '../../types'
import { NavDropdown } from './NavDropdown'
import { TopBar } from './TopBar'
import { navCta, navLink, navLinkActive } from './navStyles'

interface Props {
  sections: Page[]
  page: Page
  /** equipo activo: define el logo del centro (RS o GC) */
  team: Team
  ready: boolean
  menuOpen: boolean
  onToggleMenu: () => void
  onContact: () => void
}

/** Barra superior: redes arriba, links a los lados del logo, y la hamburguesa en celular */
export function Nav({ sections, page, team, ready, menuOpen, onToggleMenu, onContact }: Props) {
  const scrolled = useScrolled()

  const renderLink = (s: Page) => {
    if (s.children) return <NavDropdown key={s.path} section={s} page={page} active={isActive(s, page)} />
    if (s.path === CONTACT_PATH) {
      const open = (e: MouseEvent) => {
        e.preventDefault()
        onContact()
      }
      return (
        <a key={s.path} href={s.path} onClick={open} className={navCta}>
          {s.label}
        </a>
      )
    }
    return (
      <a key={s.path} href={s.path} aria-current={s === page ? 'page' : undefined} className={cx(navLink, s === page && navLinkActive)}>
        {s.label}
      </a>
    )
  }

  const side = 'flex items-center gap-8.5 max-lg:gap-5.5 max-md:hidden'

  return (
    <header
      className={cx(
        'fixed inset-x-0 top-0 z-20 border-b transition-[opacity,translate,background-color,border-color] duration-700 ease-out-soft',
        scrolled || menuOpen ? 'border-violet-hi/18 bg-night/78 backdrop-blur-md' : 'border-transparent',
        ready ? 'translate-y-0 opacity-100' : '-translate-y-3 opacity-0',
      )}
    >
      <TopBar />
      <nav
        aria-label="Principal"
        className="mx-auto grid h-(--nav-h) max-w-page grid-cols-[1fr_auto_1fr] items-center gap-10 px-16 max-lg:gap-6 max-lg:px-10 max-md:grid-cols-[44px_1fr_44px] max-md:px-4"
      >
        <div className={cx(side, 'justify-end')}>{sections.slice(0, 3).map(renderLink)}</div>

        <a href="/" aria-label="Radiant Shadows — inicio" className="group grid place-items-center max-md:col-start-2">
          <img
            src={TEAM_BRAND[team].logo}
            alt=""
            className="size-14.5 drop-shadow-[0_0_14px_rgb(142_68_255/0.6)] transition-[rotate,scale,filter] duration-250 group-hover:scale-106 group-hover:-rotate-8 group-hover:drop-shadow-[0_0_22px_rgb(142_68_255/0.9)] max-md:size-12"
          />
        </a>

        <div className={cx(side, 'justify-start')}>{sections.slice(3).map(renderLink)}</div>

        <button
          onClick={onToggleMenu}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuOpen}
          aria-controls="menu"
          className="hidden size-11 cursor-pointer place-content-center gap-1.75 rounded-[10px] max-md:col-start-3 max-md:grid"
        >
          <span className={cx('block h-0.5 w-6 rounded-xs bg-fg transition-transform duration-250', menuOpen && 'translate-y-[4.5px] rotate-45')} />
          <span className={cx('block h-0.5 w-6 rounded-xs bg-fg transition-transform duration-250', menuOpen && 'translate-y-[-4.5px] -rotate-45')} />
        </button>
      </nav>
    </header>
  )
}
