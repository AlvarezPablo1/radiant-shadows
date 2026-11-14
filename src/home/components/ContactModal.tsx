import { useEffect, useRef, useState, type SubmitEvent, type ReactNode } from 'react'
import { CONTACT_SUBJECTS } from '../data/contact'
import { cx } from '../lib/cx'
import { useScrollLock } from '../lib/hooks'
import { Kicker } from './Kicker'

interface Props {
  open: boolean
  onClose: () => void
}

type Status = { text: string; kind: 'ok' | 'error' | '' }
const EMPTY: Status = { text: '', kind: '' }

/** Formulario de contacto en un modal: nombre, mail, motivo y mensaje */
export function ContactModal({ open, onClose }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [status, setStatus] = useState<Status>(EMPTY)
  const [sending, setSending] = useState(false)
  // después del primer intento de envío se marcan en rojo los campos que faltan
  const [checked, setChecked] = useState(false)

  useScrollLock(open)
  useEffect(() => {
    const d = dialog.current!
    if (open && !d.open) {
      setStatus(EMPTY)
      d.showModal()
    } else if (!open && d.open) d.close()
  }, [open])

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
    <dialog
      ref={dialog}
      aria-labelledby="contact-title"
      onClose={onClose}
      // click afuera de la tarjeta cierra
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(520px,calc(100%-32px))] overflow-visible bg-transparent p-0 text-fg backdrop:bg-night/72 backdrop:backdrop-blur-[6px] open:animate-pop-in open:backdrop:animate-fade-in"
    >
      <form
        noValidate
        onSubmit={submit}
        className="relative flex max-h-[calc(100dvh-32px)] flex-col gap-3.5 overflow-y-auto rounded-[18px] border border-violet-hi/35 bg-card px-8 pt-8.5 pb-7.5 shadow-card max-sm:px-5 max-sm:pt-7 max-sm:pb-5.5"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 size-9.5 cursor-pointer rounded-full bg-white/6 text-2xl leading-none text-fg transition-colors duration-150 hover:bg-violet-hi/30"
        >
          ×
        </button>
        <Kicker>Hablemos</Kicker>
        <p className="-mt-1 mb-1.5 text-[15px] text-muted">Dejanos tus datos y te respondemos por mail.</p>

        <Field label="Nombre">
          <input name="name" autoComplete="name" required maxLength={80} className={input} />
        </Field>
        <Field label="Mail">
          <input name="email" type="email" autoComplete="email" required maxLength={120} className={input} />
        </Field>
        <Field label="Motivo">
          <select name="subject" required defaultValue="" className={cx(input, 'select-chevron cursor-pointer pr-10 invalid:text-muted')}>
            <option value="" disabled>
              Elegí por qué nos escribís
            </option>
            {CONTACT_SUBJECTS.map((o) => (
              <option key={o} className="bg-dark text-fg">
                {o}
              </option>
            ))}
          </select>
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
    </dialog>
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
