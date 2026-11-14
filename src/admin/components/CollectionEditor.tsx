import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { useEffect, useState } from 'react'
import { ActionButton } from '../../shared/ui/ActionButton'
import { cx } from '../../shared/lib/cx'
import { saveCollection } from '../lib/api'
import type { Item } from '../lib/item'
import type { CollectionSchema } from '../schemas'
import { ItemForm } from './ItemForm'
import { ItemRow } from './ItemRow'

interface Props {
  schema: CollectionSchema
  items: Item[]
  /** se llama con la lista nueva después de guardarla */
  onSaved: (items: Item[]) => void
}

type Status = { kind: 'idle' | 'saving' | 'ok' | 'error'; text?: string }

/** id estable de cada fila (sale del contenido, no de la posición, así no cambia al arrastrar) */
function rowIds(items: Item[]) {
  const seen = new Map<string, number>()
  return items.map((it) => {
    const base = JSON.stringify(it)
    const n = (seen.get(base) ?? 0) + 1
    seen.set(base, n)
    return `${base}#${n}`
  })
}

/** Lista de una sección: agregar, editar (tocando la fila), borrar y reordenar arrastrando. Cada cambio se guarda al momento. */
export function CollectionEditor({ schema, items, onSaved }: Props) {
  const [editing, setEditing] = useState<{ item: Item; index: number | null } | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const ids = rowIds(items)
  const saving = status.kind === 'saving'

  // el aviso de "guardado" se va solo; los errores quedan hasta la próxima acción
  useEffect(() => {
    if (status.kind !== 'ok') return
    const t = setTimeout(() => setStatus({ kind: 'idle' }), 2500)
    return () => clearTimeout(t)
  }, [status])

  async function commit(next: Item[], done: string) {
    setStatus({ kind: 'saving' })
    try {
      await saveCollection(schema.key, next)
      onSaved(next)
      setStatus({ kind: 'ok', text: done })
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message })
    }
  }

  const save = (item: Item) => {
    const next = editing?.index == null ? [...items, item] : items.map((it, i) => (i === editing.index ? item : it))
    setEditing(null)
    commit(next, editing?.index == null ? 'Agregado' : 'Cambios guardados')
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    commit(arrayMove(items, ids.indexOf(String(active.id)), ids.indexOf(String(over.id))), 'Orden guardado')
  }
  const add = () => setEditing({ item: schema.blank(), index: null })

  return (
    <section aria-labelledby="section-title" className="flex flex-col gap-5 pb-24 md:pb-0">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 id="section-title" className="font-brand-title text-[clamp(22px,2.8vw,35px)] text-white max-md:hidden">
            {schema.label.toUpperCase()}
          </h1>
          <p className="mt-2 max-w-150 text-[14px] text-body max-md:mt-0">{schema.description}</p>
        </div>
        <ActionButton onClick={add} className="max-md:hidden">
          AGREGAR
        </ActionButton>
      </header>

      {items.length > 1 && <p className="-mt-2 text-xs text-muted">Arrastrá desde ⠿ para cambiar el orden. Tocá una fila para editarla.</p>}

      {items.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-violet-hi/30 px-6 py-12 text-center text-muted">Todavía no hay nada cargado. Tocá "Agregar" para sumar {schema.singular}.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2.5">
              {items.map((item, i) => (
                <ItemRow
                  key={ids[i]}
                  id={ids[i]}
                  item={item}
                  schema={schema}
                  disabled={saving}
                  onEdit={() => setEditing({ item, index: i })}
                  onDelete={() => commit(items.filter((_, j) => j !== i), 'Borrado')}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}

      {/* aviso de guardado: abajo, flotante */}
      {status.kind !== 'idle' && (
        <p
          role="status"
          className={cx(
            'fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border px-5 py-2.5 text-sm whitespace-nowrap shadow-[0_10px_30px_rgb(0_0_0/0.5)] backdrop-blur-md max-md:bottom-24',
            status.kind === 'error' ? 'border-danger/50 bg-night/90 text-danger' : status.kind === 'ok' ? 'border-success/40 bg-night/90 text-success' : 'border-violet-hi/40 bg-night/90 text-mist',
          )}
        >
          {status.kind === 'saving' ? 'Guardando…' : status.kind === 'ok' ? `✓ ${status.text}` : status.text}
        </p>
      )}

      {/* celular: botón flotante para agregar */}
      <button
        type="button"
        onClick={add}
        aria-label={`Agregar ${schema.singular}`}
        className="fixed right-5 bottom-[calc(20px+env(safe-area-inset-bottom,0px))] z-20 hidden size-15 cursor-pointer place-items-center rounded-full bg-cta text-white shadow-cta max-md:grid"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7 fill-none stroke-current stroke-[2.5]">
          <path d="M12 5v14M5 12h14" strokeLinecap="round" />
        </svg>
      </button>

      <ItemForm schema={schema} item={editing?.item ?? null} isNew={editing?.index == null} onSave={save} onClose={() => setEditing(null)} />
    </section>
  )
}
