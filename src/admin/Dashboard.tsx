import { useState } from 'react'
import type { CollectionKey } from '../home/data/collections'
import type { Content } from '../home/data/content'
import { cx } from '../home/lib/cx'
import { CollectionEditor } from './components/CollectionEditor'
import type { Item } from './lib/item'
import { SCHEMAS } from './schemas'

const GROUPS: { title: string; keys: CollectionKey[] }[] = [
  { title: 'Contenido', keys: ['news', 'events', 'achievements'] },
  { title: 'Equipo', keys: ['players', 'coaches', 'staff', 'creators'] },
]

/** Panel: menú de secciones a la izquierda (arriba en celular) y el editor de la sección elegida */
export function Dashboard({ initial }: { initial: Content }) {
  const [content, setContent] = useState(initial)
  const [active, setActive] = useState<CollectionKey>('news')
  const schema = SCHEMAS.find((s) => s.key === active)!

  return (
    <div className="relative z-2 mx-auto grid min-h-svh w-full max-w-page grid-cols-[260px_minmax(0,1fr)] gap-10 px-10 py-10 max-lg:gap-6 max-lg:px-6 max-md:grid-cols-1 max-md:px-4 max-md:py-6">
      <aside className="flex flex-col gap-6 md:sticky md:top-10 md:self-start">
        <a href="/" className="flex items-center gap-3">
          <img src="/brand/logos/rs-positive.png" alt="" className="size-12 drop-shadow-[0_0_14px_rgb(142_68_255/0.5)]" />
          <span className="font-display text-[26px] leading-none tracking-[0.05em] text-white">
            RS <span className="text-lilac">ADMIN</span>
          </span>
        </a>

        <nav aria-label="Secciones" className="flex flex-col gap-5 max-md:flex-row max-md:gap-3 max-md:overflow-x-auto max-md:pb-1">
          {GROUPS.map((g) => (
            <div key={g.title} className="flex flex-col gap-1 max-md:flex-row max-md:gap-1">
              <p className="mb-1 px-3 font-display text-[13px] tracking-[0.3em] text-muted max-md:hidden">{g.title.toUpperCase()}</p>
              {g.keys.map((k) => {
                const s = SCHEMAS.find((x) => x.key === k)!
                return (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setActive(k)}
                    aria-current={active === k ? 'page' : undefined}
                    className={cx(
                      'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-left font-display text-[20px] tracking-[0.06em] whitespace-nowrap transition-colors duration-150',
                      active === k ? 'bg-violet/35 text-white shadow-[inset_0_0_0_1px_rgb(142_68_255/0.5)]' : 'text-mist hover:bg-violet/15 hover:text-white',
                    )}
                  >
                    {s.label.toUpperCase()}
                    <span className="rounded-full bg-night/60 px-2 text-xs text-muted">{content[k].length}</span>
                  </button>
                )
              })}
            </div>
          ))}
        </nav>

        <div className="flex flex-col gap-2 border-t border-white/8 pt-5 max-md:flex-row max-md:flex-wrap">
          <a href="/mediakit" target="_blank" rel="noopener noreferrer" className="rounded-xl bg-cta px-4 pt-2.5 pb-2 text-center font-display text-[19px] tracking-[0.1em] text-white shadow-cta hover:brightness-112">
            ABRIR MEDIAKIT ↗
          </a>
          <a href="/" target="_blank" rel="noopener noreferrer" className="rounded-xl px-4 py-2 text-center text-sm text-mist hover:text-white">
            Ver el sitio ↗
          </a>
          <a href="/api/logout" className="rounded-xl px-4 py-2 text-center text-sm text-muted hover:text-white">
            Cerrar sesión
          </a>
        </div>
      </aside>

      <main className="min-w-0">
        <CollectionEditor key={active} schema={schema} items={content[active] as unknown as Item[]} onSaved={(items) => setContent((c) => ({ ...c, [active]: items }))} />
      </main>
    </div>
  )
}
