import { HOME, SECTIONS } from '../data/pages'
import type { Page } from '../types'

/** /contacto no es una pantalla: muestra la home con el formulario abierto encima */
export const CONTACT_PATH = '/contacto'

export const normalizePath = (pathname: string) => pathname.replace(/\/+$/, '') || '/'

const PAGES = SECTIONS.flatMap((s) => s.children ?? [s])

export function resolvePage(path: string): Page {
  if (path === CONTACT_PATH) return HOME
  return PAGES.find((p) => p.path === path) ?? HOME
}

/** La sección es la página actual o contiene a la página actual */
export const isActive = (section: Page, page: Page) => section === page || !!section.children?.includes(page)
