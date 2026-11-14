import { useState, type SubmitEvent } from 'react'
import { Modal } from '../../home/components/Modal'
import { Kicker } from '../../home/components/Kicker'
import { getField, setField, type Item } from '../lib/item'
import type { CollectionSchema } from '../schemas'
import { Field } from './Field'

interface Props {
  schema: CollectionSchema
  /** el elemento a editar, o null si el modal está cerrado */
  item: Item | null
  isNew: boolean
  onSave: (item: Item) => void
  onClose: () => void
}

/** Modal con el formulario de un elemento: los campos salen de la definición de la sección */
export function ItemForm({ schema, item, isNew, onSave, onClose }: Props) {
  return (
    <Modal open={!!item} onClose={onClose} labelledBy="item-title" wide>
      {/* el formulario se vuelve a montar con cada elemento, así arranca con sus datos */}
      {item && <FormBody key={JSON.stringify(item)} schema={schema} initial={item} isNew={isNew} onSave={onSave} onClose={onClose} />}
    </Modal>
  )
}

function FormBody({ schema, initial, isNew, onSave, onClose }: Omit<Props, 'item'> & { initial: Item }) {
  // lo que falte (p. ej. el equipo en jugadores cargados antes de que existiera el campo) toma el valor por defecto de la sección
  const [draft, setDraft] = useState<Item>(() => ({ ...schema.blank(), ...initial }))

  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (e.currentTarget.checkValidity()) onSave(draft)
    else e.currentTarget.reportValidity()
  }

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      <div>
        <Kicker>{schema.label}</Kicker>
        <h2 id="item-title" className="mt-1 font-display text-[36px] leading-none tracking-[0.03em] text-white">
          {isNew ? `AGREGAR ${schema.singular.replace(/^una? /, '').toUpperCase()}` : `EDITAR: ${schema.title(initial).toUpperCase()}`}
        </h2>
      </div>
      {schema.fields.map((f) => (
        <Field key={f.key} field={f} value={getField(draft, f.key)} onChange={(v) => setDraft((d) => setField(d, f.key, v))} />
      ))}
      <div className="sticky -bottom-7.5 -mx-8 mt-2 flex justify-end gap-3 border-t border-white/8 bg-night/90 px-8 py-4 backdrop-blur-md max-sm:-mx-5 max-sm:px-5">
        <button type="button" onClick={onClose} className="cursor-pointer rounded-full px-5 py-2.5 font-display text-[18px] tracking-[0.1em] text-mist hover:text-white">
          CANCELAR
        </button>
        <button type="submit" className="cursor-pointer rounded-full bg-cta px-6 pt-2.5 pb-2 font-display text-[18px] tracking-[0.1em] text-white shadow-cta hover:brightness-112">
          GUARDAR
        </button>
      </div>
    </form>
  )
}
