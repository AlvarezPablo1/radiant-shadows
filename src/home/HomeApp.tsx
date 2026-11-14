import { useCallback, useEffect, useState } from 'react'
import { Background } from '../shared/ui/Background'
import { ContactModal } from './components/modals/ContactModal'
import { Footer } from './components/layout/Footer'
import { LegalModal } from './components/modals/LegalModal'
import { MobileMenu } from './components/nav/MobileMenu'
import { PageTransition } from './components/layout/PageTransition'
import { Nav } from './components/nav/Nav'
import { PageView } from './components/layout/PageView'
import { activeTeam } from './lib/team'
import { useContent } from './lib/useContent'
import type { LegalDoc } from './data/legal'
import { HOME, SECTIONS } from './data/pages'
import { useEscape, useScrollLock } from '../shared/lib/hooks'
import { useReveal } from './lib/useReveal'
import { CONTACT_PATH, normalizePath, resolvePage } from './lib/route'
import { useLinkTransition } from './lib/useLinkTransition'

const path = normalizePath(location.pathname)
const page = resolvePage(path)
const isHome = page === HOME
const year = new Date().getFullYear()

/** Sitio público de Radiant Shadows: arma la página y maneja el menú y los modales */
export function HomeApp() {
  const ready = useReveal()
  const team = activeTeam(page, isHome, useContent().events)
  const leaving = useLinkTransition()
  const [menuOpen, setMenuOpen] = useState(false)
  // si se entró por /contacto, el formulario arranca abierto
  const [contactOpen, setContactOpen] = useState(path === CONTACT_PATH)
  const [legal, setLegal] = useState<LegalDoc | null>(null)

  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useEscape(menuOpen, closeMenu)
  useScrollLock(menuOpen)

  useEffect(() => {
    document.title = isHome ? 'Radiant Shadows · Esports de Valorant' : `${page.label} · Radiant Shadows`
  }, [])

  const openContact = () => {
    setMenuOpen(false)
    setContactOpen(true)
  }
  const closeContact = () => {
    setContactOpen(false)
    if (normalizePath(location.pathname) === CONTACT_PATH) history.replaceState(null, '', '/')
  }

  return (
    <>
      <Background year={year} />
      <Nav sections={SECTIONS} page={page} team={team} ready={ready} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} onContact={openContact} />
      {menuOpen && <MobileMenu sections={SECTIONS} page={page} onContact={openContact} />}
      <PageView page={page} isHome={isHome} ready={ready} onContact={openContact} team={team} />
      <Footer onLegal={setLegal} />
      <ContactModal open={contactOpen} onClose={closeContact} />
      <LegalModal doc={legal} onClose={() => setLegal(null)} />
      <PageTransition active={leaving} />
    </>
  )
}
