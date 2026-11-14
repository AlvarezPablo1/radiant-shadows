import { useCallback, useEffect, useState } from 'react'
import { Background } from './components/Background'
import { ContactModal } from './components/ContactModal'
import { Footer } from './components/Footer'
import { LegalModal } from './components/LegalModal'
import { MobileMenu } from './components/MobileMenu'
import { PageTransition } from './components/PageTransition'
import { Nav } from './components/nav/Nav'
import { PageView } from './components/PageView'
import type { LegalDoc } from './data/legal'
import { HOME, SECTIONS } from './data/pages'
import { useEscape, useReveal, useScrollLock } from './lib/hooks'
import { CONTACT_PATH, normalizePath, resolvePage } from './lib/route'
import { useLinkTransition } from './lib/useLinkTransition'

const path = normalizePath(location.pathname)
const page = resolvePage(path)
const isHome = page === HOME
const year = new Date().getFullYear()

/** Sitio público de Radiant Shadows: arma la página y maneja el menú y los modales */
export function HomeApp() {
  const ready = useReveal()
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
      <Nav sections={SECTIONS} page={page} ready={ready} menuOpen={menuOpen} onToggleMenu={() => setMenuOpen((o) => !o)} onContact={openContact} />
      {menuOpen && <MobileMenu sections={SECTIONS} page={page} onContact={openContact} />}
      <PageView page={page} isHome={isHome} ready={ready} onContact={openContact} />
      <Footer onLegal={setLegal} />
      <ContactModal open={contactOpen} onClose={closeContact} />
      <LegalModal doc={legal} onClose={() => setLegal(null)} />
      <PageTransition active={leaving} />
    </>
  )
}
