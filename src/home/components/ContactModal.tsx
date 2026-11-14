import { useState, type ReactNode, type SubmitEvent } from 'react'
import { CONTACT_SUBJECTS } from '../data/contact'
import { cx } from '../lib/cx'
import { Kicker } from './Kicker'
import { Modal } from './Modal'
import { Select } from './Select'

interface Props {
  open: boolean
  onClose: () => void
}

type Status = { text: string; kind: 'ok' | 'error' | '' }
const EMPTY: Status = { text: '', kind: '' }

/** Formulario de contacto en un modal: nombre, mail, motivo y mensaje */
export function ContactModal({ open, onClose }: Props) {
  const [status, setStatus] = useState<Status>(EMPTY)
  const [sending, setSending] = useState(false)
  // después del primer intento de envío se marcan en rojo los campos que faltan
  const [checked, setChecked] = useState(false)
  const [subject, setSubject] = useState('')

  // al cerrar se limpia el aviso, así la próxima vez arranca sin mensajes viejos
  const close = () => {
    setStatus(EMPTY)
    onClose()
  }

  async function submit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    if (!form.checkValidity()) {
      setChecked(true)
      const bad = form.querySelector<HTMLInputElement>(':invalid')
      bad?.focus()
      const text = bad?.type === 'email' && bad.value ? 'Revisá el mail, parece que le falta algo.' : 'Completá los campos marcados.'
      setStatus({ text, kind: 'error' })
      return
    }
    setSending(true)
    setStatus(EMPTY)
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      })
      if (!res.ok) throw new Error(String(res.status))
      form.reset()
      setSubject('')
      setChecked(false)
      setStatus({ text: '¡Gracias! Recibimos tu mensaje y te vamos a responder pronto.', kind: 'ok' })
    } catch {
      setStatus({ text: 'No pudimos enviar el mensaje. Probá de nuevo en un rato.', kind: 'error' })
    } finally {
      setSending(false)
    }
  }

  const input = cx(
    'w-full rounded-[10px] border border-violet-hi/28 bg-night/60 px-3.5 py-3 text-base text-fg outline-none transition-[border-color,box-shadow] duration-150',
    'focus:border-violet-hi focus:shadow-[0_0_0_3px_rgb(142_68_255/0.25)]',
    checked && 'invalid:border-[#ff6b8a]',
  )

  return (
    <Modal open={open} onClose={close} labelledBy="contact-title">
      <form noValidate onSubmit={submit} aria-label="Formulario de contacto" className="flex flex-col gap-3.5">
        <Kicker>Hablemos</Kicker>
        <p className="-mt-1 mb-1.5 text-[15px] text-muted">Dejanos tus datos y te respondemos por mail.</p>

        <Field label="Nombre">
          <input name="name" autoComplete="name" required maxLength={80} className={input} />
        </Field>
        <Field label="Mail">
          <input name="email" type="email" autoComplete="email" required maxLength={120} className={input} />
        </Field>
        <Field label="Motivo">
          <Select
            name="subject"
            required
            invalid={checked}
            value={subject}
            onChange={setSubject}
            placeholder="Elegí por qué nos escribís"
            options={CONTACT_SUBJECTS.map((o) => ({ value: o, label: o }))}
          />
        </Field>
        <Field label="Mensaje" hint="(opcional)">
          <textarea name="message" rows={4} maxLength={2000} placeholder="Contanos un poco más" className={cx(input, 'h-24 resize-none')} />
        </Field>
        {/* trampa para bots: las personas no lo ven */}
        <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="absolute left-[-9999px] size-px opacity-0" />

        <p role="status" className={cx('min-h-[1.3em] text-sm', status.kind === 'ok' ? 'text-success' : status.kind === 'error' ? 'text-danger' : 'text-muted')}>
          {status.text}
        </p>
        <button
          type="submit"
          disabled={sending}
          className="mt-0.5 cursor-pointer rounded-full bg-cta pt-3.5 pb-2.75 font-display text-2xl tracking-[0.08em] text-white shadow-[0_8px_26px_rgb(122_40_226/0.45)] transition-[filter,translate] duration-150 not-disabled:hover:-translate-y-px not-disabled:hover:brightness-112 disabled:cursor-wait disabled:opacity-60"
        >
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </Modal>
  )
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-[13px] font-semibold tracking-[0.04em] text-mist">
        {label} {hint && <em className="font-normal text-muted not-italic">{hint}</em>}
      </span>
      {children}
    </label>
  )
}
