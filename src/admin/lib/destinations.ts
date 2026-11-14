import { CONTACT_PATH } from '../../home/lib/route'
import { HOME, SECTIONS } from '../../home/data/pages'

/** valor especial que abre el formulario de contacto (lo entiende el botón de las noticias) */
export const CONTACT_DESTINATION = 'contacto'

/** Destinos para los botones: todas las secciones del sitio y el formulario de contacto */
export const DESTINATIONS: { value: string; label: string }[] = [
  { value: HOME.path, label: 'Inicio' },
  ...SECTIONS.flatMap((s) =>
    s.children
      ? s.children.map((c) => ({ value: c.path, label: `${s.label} · ${c.label}` }))
      : s.path === CONTACT_PATH
        ? []
        : [{ value: s.path, label: s.label }],
  ),
  { value: CONTACT_DESTINATION, label: 'Formulario de contacto (abre el modal)' },
]
