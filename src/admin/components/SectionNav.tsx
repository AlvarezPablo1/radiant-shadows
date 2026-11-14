import type { CollectionKey } from '../../home/data/collections'
import type { Content } from '../../home/data/content'
import { cx } from '../../home/lib/cx'
import { SCHEMAS } from '../schemas'

const GROUPS: { title: string; keys: CollectionKey[] }[] = [
  { title: 'Contenido', keys: ['news', 'events', 'achievements'] },
  { title: 'Equipo', keys: ['players', 'coaches', 'staff', 'creators'] },
]

interface Props {
  content: Content
  active: CollectionKey
  onPick: (key: CollectionKey) => void
  /** celular: opciones más grandes, en grilla de a dos */
  large?: boolean
}

/** Lista de secciones del panel, agrupadas, con la cantidad de elementos de cada una */
export function SectionNav({ content, active, onPick, large }: Props) {
  return (
    <nav aria-label="Secciones" className="flex flex-col gap-5">
      {GROUPS.map((g) => (
        <div key={g.title} className="flex flex-col gap-1">
          <p className="mb-1 px-3 font-display text-[13px] tracking-[0.3em] text-muted">{g.title.toUpperCase()}</p>
          <div className={cx(large ? 'grid grid-cols-2 gap-2' : 'flex flex-col gap-1')}>
            {g.keys.map((k) => {
              const s = SCHEMAS.find((x) => x.key === k)!
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => onPick(k)}
                  aria-current={active === k ? 'page' : undefined}
                  className={cx(
                    'flex cursor-pointer items-center justify-between gap-3 rounded-xl px-3 text-left font-display tracking-[0.06em] whitespace-nowrap transition-colors duration-150',
                    large ? 'border border-violet-hi/20 py-4 text-[20px]' : 'py-2.5 text-[20px]',
                    active === k ? 'bg-violet/35 text-white shadow-[inset_0_0_0_1px_rgb(142_68_255/0.5)]' : 'text-mist hover:bg-violet/15 hover:text-white',
                  )}
                >
                  {s.label.toUpperCase()}
                  <span className="rounded-full bg-night/60 px-2 text-xs text-muted">{content[k].length}</span>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </nav>
  )
}

/** Mediakit, ver el sitio y cerrar sesión */
export function PanelLinks({ className }: { className?: string }) {
  return (
    <div className={cx('flex flex-col gap-2', className)}>
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
  )
}
