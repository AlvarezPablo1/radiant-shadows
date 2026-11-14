export interface LegalDoc {
  id: string
  label: string
  title: string
}

/** Páginas legales del footer; por ahora cada una abre un modal con "Próximamente" */
export const LEGAL_DOCS: LegalDoc[] = [
  { id: 'terminos', label: 'Términos', title: 'TÉRMINOS Y CONDICIONES' },
  { id: 'privacidad', label: 'Privacidad', title: 'POLÍTICA DE PRIVACIDAD' },
  { id: 'aviso-legal', label: 'Aviso legal', title: 'AVISO LEGAL' },
]
