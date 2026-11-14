import { useState } from 'react'
import { ActionButton } from '../../home/components/home/ActionButton'
import { cx } from '../../home/lib/cx'
import { saveCollection } from '../lib/api'
import type { Item } from '../lib/item'
import type { CollectionSchema } from '../schemas'
import { ItemForm } from './ItemForm'
import { iconBtn, smallBtn } from './styles'

interface Props {
  schema: CollectionSchema
  items: Item[]
  /** se llama con la lista nueva después de guardarla */
  onSaved: (items: Item[]) => void
}

type Status = { kind: 'idle' | 'saving' | 'ok' | 'error'; text?: string }

/** Lista de una sección: agregar, editar, borrar y reordenar. Cada cambio se guarda al momento. */
export function CollectionEditor({ schema, items, onSaved }: Props) {
  const [editing, setEditing] = useState<{ item: Item; index: number | null } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

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
  const remove = (index: number) => {
    setConfirmDelete(null)
    commit(items.filter((_, i) => i !== index), 'Borrado')
  }
  const move = (index: number, by: -1 | 1) => {
    const next = [...items]
    ;[next[index], next[index + by]] = [next[index + by], next[index]]
    commit(next, 'Orden guardado')
  }

  return (
    <section aria-labelledby="section-title" className="flex flex-col gap-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <h1 id="section-title" className="font-brand-title text-[clamp(24px,2.8vw,35px)] text-white">
            {schema.label.toUpperCase()}
          </h1>
          <p className="mt-2 max-w-150 text-[15px] text-body">{schema.description}</p>
        </div>
        <ActionButton onClick={() => setEditing({ item: schema.blank(), index: null })}>AGREGAR</ActionButton>
      </header>

      <p role="status" className={cx('min-h-5 text-sm', status.kind === 'error' ? 'text-danger' : status.kind === 'ok' ? 'text-success' : 'text-muted')}>
        {status.kind === 'saving' ? 'Guardando…' : status.kind === 'ok' ? `✓ ${status.text}. La web se actualiza en hasta un minuto.` : status.text}
      </p>

      {items.length === 0 ? (
        <p className="rounded-3xl border border-dashed border-violet-hi/30 px-6 py-12 text-center text-muted">Todavía no hay nada cargado. Tocá "Agregar" para sumar {schema.singular}.</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {items.map((item, i) => (
            <li key={i} className="flex items-center gap-4 rounded-2xl border border-violet-hi/20 bg-night/55 p-3 pr-4 backdrop-blur-md max-sm:flex-wrap">
              {schema.image && (
                <span className="grid size-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(to_bottom,rgb(122_40_226/0.3),rgb(0_0_16/0.6))]">
                  {schema.image(item) ? <img src={schema.image(item)} alt="" className="max-h-full max-w-full object-contain" /> : <img src="/brand/logos/rs-positive.png" alt="" className="w-8 opacity-50" />}
                </span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-display text-[24px] leading-tight tracking-[0.04em] text-white">{schema.title(item) || '(sin título)'}</span>
                <span className="block truncate text-sm text-muted">{schema.subtitle(item)}</span>
              </span>

              {confirmDelete === i ? (
                <span className="flex items-center gap-2 text-sm">
                  <span className="text-danger">¿Borrar?</span>
                  <button type="button" className={smallBtn + ' border-danger/60 text-danger'} onClick={() => remove(i)}>
                    Sí, borrar
                  </button>
                  <button type="button" className={smallBtn} onClick={() => setConfirmDelete(null)}>
                    No
                  </button>
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <button type="button" className={iconBtn} aria-label="Subir" disabled={i === 0 || status.kind === 'saving'} onClick={() => move(i, -1)}>
                    ↑
                  </button>
                  <button type="button" className={iconBtn} aria-label="Bajar" disabled={i === items.length - 1 || status.kind === 'saving'} onClick={() => move(i, 1)}>
                    ↓
                  </button>
                  <button type="button" className={smallBtn} onClick={() => setEditing({ item, index: i })}>
                    Editar
                  </button>
                  <button type="button" className={smallBtn} onClick={() => setConfirmDelete(i)}>
                    Borrar
                  </button>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}

      <ItemForm schema={schema} item={editing?.item ?? null} isNew={editing?.index == null} onSave={save} onClose={() => setEditing(null)} />
    </section>
  )
}
