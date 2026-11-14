import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useState } from 'react'
import { cx } from '../../home/lib/cx'
import type { Item } from '../lib/item'
import type { CollectionSchema } from '../schemas'
import { smallBtn } from './styles'

interface Props {
  id: string
  item: Item
  schema: CollectionSchema
  disabled: boolean
  onEdit: () => void
  onDelete: () => void
}

/** Una fila de la lista: se arrastra desde la manija, se toca para editar y tiene su botón de borrar */
export function ItemRow({ id, item, schema, disabled, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled })
  const [confirming, setConfirming] = useState(false)
  const image = schema.image?.(item)

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={cx(
        'relative flex items-center gap-3 rounded-2xl border bg-night/70 p-2.5 pr-3 backdrop-blur-md transition-[border-color,box-shadow]',
        isDragging ? 'z-10 border-violet-hi shadow-[0_18px_40px_rgb(0_0_0/0.5),0_0_24px_rgb(142_68_255/0.35)]' : 'border-violet-hi/20',
      )}
    >
      {/* manija para arrastrar: funciona con mouse y con el dedo */}
      <button
        ref={setActivatorNodeRef}
        type="button"
        aria-label={`Mover ${schema.title(item)}`}
        {...attributes}
        {...listeners}
        className="grid h-12 w-8 shrink-0 cursor-grab touch-none place-items-center rounded-lg text-muted hover:bg-violet/20 hover:text-white active:cursor-grabbing disabled:cursor-default disabled:opacity-30"
      >
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-current">
          {[6, 12, 18].flatMap((y) => [9, 15].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" />))}
        </svg>
      </button>

      {/* el resto de la fila abre el formulario */}
      <button type="button" onClick={onEdit} className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left">
        {schema.image && (
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-[linear-gradient(to_bottom,rgb(122_40_226/0.3),rgb(0_0_16/0.6))]">
            {image ? <img src={image} alt="" className="max-h-full max-w-full object-contain" /> : <img src="/brand/logos/rs-positive.png" alt="" className="w-7 opacity-50" />}
          </span>
        )}
        <span className="min-w-0">
          <span className="block truncate font-display text-[22px] leading-tight tracking-[0.04em] text-white max-sm:line-clamp-2 max-sm:text-[19px] max-sm:whitespace-normal">{schema.title(item) || '(sin título)'}</span>
          <span className="block truncate text-[13px] text-muted">{schema.subtitle(item)}</span>
        </span>
      </button>

      <button type="button" aria-label="Borrar" disabled={disabled} onClick={() => setConfirming(true)} className="grid size-10 shrink-0 cursor-pointer place-items-center rounded-full text-muted hover:bg-danger/15 hover:text-danger disabled:opacity-30">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5 fill-none stroke-current stroke-2">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* confirmación encima de la fila */}
      {confirming && (
        <div className="absolute inset-0 z-1 flex items-center justify-end gap-2 rounded-2xl bg-night/95 px-4">
          <span className="mr-auto truncate text-sm text-fg">¿Borrar “{schema.title(item)}”?</span>
          <button type="button" className={smallBtn} onClick={() => setConfirming(false)}>
            No
          </button>
          <button
            type="button"
            className={smallBtn + ' border-danger/60 text-danger hover:bg-danger/20'}
            onClick={() => {
              setConfirming(false)
              onDelete()
            }}
          >
            Sí, borrar
          </button>
        </div>
      )}
    </li>
  )
}
