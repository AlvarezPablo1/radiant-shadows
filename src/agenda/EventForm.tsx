import { useState, type SubmitEvent } from 'react'
import { Field } from '../admin/components/Field'
import { getField, setField, type Item } from '../admin/lib/item'
import { Kicker } from '../shared/ui/Kicker'
import { Modal } from '../shared/ui/Modal'
import { AGENDA_FIELDS, type AgendaEvent } from './types'

interface Props {
  /** evento a editar o el borrador de uno nuevo; null = cerrado */
  event: AgendaEvent | null
  isNew: boolean
  onSave: (e: AgendaEvent) => void
  onDelete: (e: AgendaEvent) => void
  onClose: () => void
}

/** Modal para agregar o editar un evento de la agenda (con los mismos campos que el admin) */
export function EventForm({ event, ...p }: Props) {
  return (
    <Modal open={!!event} onClose={p.onClose} labelledBy="agenda-form-title" wide>
      {event && <Body key={event.id} initial={event} {...p} />}
    </Modal>
  )
}

function Body({ initial, isNew, onSave, onDelete, onClose }: Omit<Props, 'event'> & { initial: AgendaEvent }) {
  const [draft, setDraft] = useState<Item>({ ...initial })
  const [confirming, setConfirming] = useState(false)

  function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    if (e.currentTarget.checkValidity()) onSave(draft as unknown as AgendaEvent)
    else e.currentTarget.reportValidity()
  }

  return (
    <form onSubmit={submit} noValidate className="flex min-w-0 flex-col gap-4">
      <div>
        <Kicker>Agenda</Kicker>
        <h2 id="agenda-form-title" className="mt-1 font-display text-[36px] leading-none tracking-[0.03em] text-white">
          {isNew ? 'AGREGAR EVENTO' : 'EDITAR EVENTO'}
        </h2>
      </div>
      {AGENDA_FIELDS.map((f) => (
        <Field key={f.key} field={f} value={getField(draft, f.key)} onChange={(v) => setDraft((d) => setField(d, f.key, v))} />
      ))}
      <div className="sticky -bottom-7.5 -mx-8 mt-2 flex items-center gap-3 border-t border-white/8 bg-night/90 px-8 py-4 backdrop-blur-md max-sm:-mx-5 max-sm:px-5">
        {!isNew &&
          (confirming ? (
            <span className="mr-auto flex items-center gap-2 text-sm text-fg">
              ¿Borrar?
              <button type="button" onClick={() => setConfirming(false)} className="cursor-pointer rounded-full px-3 py-1 text-mist hover:text-white">
                No
              </button>
              <button type="button" onClick={() => onDelete(initial)} className="cursor-pointer rounded-full border border-danger/60 px-3 py-1 text-danger hover:bg-danger/20">
                Sí, borrar
              </button>
            </span>
          ) : (
            <button type="button" onClick={() => setConfirming(true)} className="mr-auto cursor-pointer rounded-full px-3 py-2 text-sm text-muted hover:text-danger">
              Borrar
            </button>
          ))}
        <span className={isNew ? 'ml-auto flex gap-3' : 'flex gap-3'}>
          <button type="button" onClick={onClose} className="cursor-pointer rounded-full px-5 py-2.5 font-display text-[18px] tracking-[0.1em] text-mist hover:text-white">
            CANCELAR
          </button>
          <button type="submit" className="cursor-pointer rounded-full bg-cta px-6 pt-2.5 pb-2 font-display text-[18px] tracking-[0.1em] text-white shadow-cta hover:brightness-112">
            GUARDAR
          </button>
        </span>
      </div>
    </form>
  )
}
