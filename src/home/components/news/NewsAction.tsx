import type { NewsItem } from '../../data/news'

/** Botón de la noticia: "contacto" abre el formulario; los links externos, en otra pestaña */
export function NewsAction({ action, onContact }: { action: NonNullable<NewsItem['action']>; onContact: () => void }) {
  const cls =
    'mt-auto inline-flex w-fit cursor-pointer items-center gap-1.5 font-display text-[18px] tracking-[0.12em] text-lilac transition-colors duration-150 hover:text-white'
  const label = (
    <>
      {(action.label || 'Ver más').toUpperCase()}
      <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 fill-none stroke-current stroke-[2.5]">
        <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </>
  )
  return action.href === 'contacto' ? (
    <button type="button" onClick={onContact} className={cls}>
      {label}
    </button>
  ) : action.href.startsWith('http') ? (
    <a href={action.href} target="_blank" rel="noopener noreferrer" className={cls}>
      {label}
    </a>
  ) : (
    <a href={action.href} className={cls}>
      {label}
    </a>
  )
}
