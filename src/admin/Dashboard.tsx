import { useState } from 'react'
import type { CollectionKey } from '../shared/content/collections'
import type { Content } from '../shared/content/content'
import { useScrollLock } from '../shared/lib/hooks'
import { CollectionEditor } from './components/CollectionEditor'
import { PanelLinks, SectionNav } from './components/SectionNav'
import type { Item } from './lib/item'
import { SCHEMAS } from './schemas'

/** Panel: en escritorio, menú de secciones a la izquierda; en celular, barra arriba con menú desplegable */
export function Dashboard({ initial }: { initial: Content }) {
  const [content, setContent] = useState(initial)
  const [active, setActive] = useState<CollectionKey>('news')
  const [menuOpen, setMenuOpen] = useState(false)
  const schema = SCHEMAS.find((s) => s.key === active)!
  useScrollLock(menuOpen)

  const pick = (k: CollectionKey) => {
    setActive(k)
    setMenuOpen(false)
    scrollTo({ top: 0 })
  }

  // marca del panel (no es un link: no lleva a la web)
  const logo = (
    <div className="flex items-center gap-3">
      <img src="/brand/logos/rs-positive.webp" alt="" className="size-11 drop-shadow-[0_0_14px_rgb(142_68_255/0.5)]" />
      <span className="font-display text-[24px] leading-none tracking-[0.05em] text-white">
        RS <span className="text-lilac">ADMIN</span>
      </span>
    </div>
  )

  return (
    <>
      {/* celular: barra fija con la sección actual y el menú */}
      <header className="sticky top-0 z-30 hidden items-center justify-between gap-3 border-b border-violet-hi/20 bg-night/90 px-4 py-3 backdrop-blur-md max-md:flex">
        <img src="/brand/logos/rs-positive.webp" alt="" className="size-9" />
        <span className="min-w-0 flex-1 truncate font-brand-title text-[18px] text-white">{schema.label.toUpperCase()}</span>
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="grid size-11 cursor-pointer place-items-center rounded-xl border border-violet-hi/30 text-white"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" className="size-6 fill-none stroke-current stroke-2">
            <path d={menuOpen ? 'M6 6l12 12M18 6 6 18' : 'M4 7h16M4 12h16M4 17h16'} strokeLinecap="round" />
          </svg>
        </button>
      </header>
      {menuOpen && (
        <div className="fixed inset-x-0 top-[69px] bottom-0 z-20 hidden animate-fade-in flex-col gap-6 overflow-y-auto bg-night px-4 pt-5 pb-10 max-md:flex">
          <SectionNav content={content} active={active} onPick={pick} large />
          <PanelLinks className="border-t border-white/8 pt-5" />
        </div>
      )}

      <div className="relative z-2 mx-auto grid min-h-svh w-full max-w-page grid-cols-[260px_minmax(0,1fr)] gap-10 px-10 py-10 max-lg:gap-6 max-lg:px-6 max-md:block max-md:px-4 max-md:py-5">
        <aside className="flex flex-col gap-6 self-start md:sticky md:top-10 max-md:hidden">
          {logo}
          <SectionNav content={content} active={active} onPick={pick} />
          <PanelLinks className="border-t border-white/8 pt-5" />
        </aside>

        <main className="min-w-0">
          <CollectionEditor key={active} schema={schema} items={content[active] as unknown as Item[]} onSaved={(items) => setContent((c) => ({ ...c, [active]: items }))} />
        </main>
      </div>
    </>
  )
}
