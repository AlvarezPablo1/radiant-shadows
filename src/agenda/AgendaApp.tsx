import { useEffect, useState } from 'react'
import { cx } from '../shared/lib/cx'
import { Background } from '../shared/ui/Background'
import { Kicker } from '../shared/ui/Kicker'
import { AgendaCalendar } from './AgendaCalendar'
import { loadAgenda, saveAgenda } from './api'
import { EventForm } from './EventForm'
import type { AgendaEvent } from './types'

/** el año del costado del fondo (se calcula al cargar la página) */
const YEAR = new Date().getFullYear()

type Status = { kind: 'idle' | 'saving' | 'ok' | 'error'; text?: string }

/** /agenda: calendario de contenido del staff (sólo con la sesión del admin; no se comparte con la web) */
export function AgendaApp() {
  const [events, setEvents] = useState<AgendaEvent[] | null>(null)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState<{ event: AgendaEvent; isNew: boolean } | null>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })

  useEffect(() => {
    loadAgenda()
      .then((list) => (list === null ? location.replace('/admin') : setEvents(list)))
      .catch((e: Error) => setError(e.message))
  }, [])
  useEffect(() => {
    if (status.kind !== 'ok') return
    const t = setTimeout(() => setStatus({ kind: 'idle' }), 2500)
    return () => clearTimeout(t)
  }, [status])

  async function commit(next: AgendaEvent[], done: string) {
    setEditing(null)
    setStatus({ kind: 'saving' })
    try {
      await saveAgenda(next)
      setEvents(next)
      setStatus({ kind: 'ok', text: done })
    } catch (e) {
      setStatus({ kind: 'error', text: (e as Error).message })
    }
  }

  const add = (date: string) => setEditing({ event: { id: Date.now().toString(36), date, title: '', type: 'publicacion' }, isNew: true })
  const save = (e: AgendaEvent) => {
    const list = events ?? []
    const isNew = !list.some((x) => x.id === e.id)
    commit(isNew ? [...list, e] : list.map((x) => (x.id === e.id ? e : x)), isNew ? 'Agregado' : 'Cambios guardados')
  }

  return (
    <>
      <Background year={YEAR} />
      <main className="relative z-2 mx-auto min-h-svh w-full max-w-page pt-10 pb-24 max-md:pt-6 max-md:pb-16">
        <header className="flex items-center gap-4 px-16 max-lg:px-10 max-md:px-4">
          <img src="/brand/logos/rs-nav.webp" alt="" className="size-12 drop-shadow-[0_0_14px_rgb(142_68_255/0.5)]" />
          <div>
            <Kicker>Sólo para el staff</Kicker>
            <h1 className="mt-1 font-brand-title text-[clamp(24px,3vw,40px)] text-white">AGENDA</h1>
          </div>
        </header>

        {error ? (
          <p className="mt-16 px-4 text-center text-danger">{error}. Si estás probando en local, necesitás `npm run dev:full`.</p>
        ) : events === null ? (
          <p className="mt-24 text-center font-display text-[24px] tracking-[0.2em] text-muted">CARGANDO…</p>
        ) : (
          <AgendaCalendar events={events} onAdd={add} onEdit={(e) => setEditing({ event: e, isNew: false })} />
        )}
      </main>

      <EventForm
        event={editing?.event ?? null}
        isNew={!!editing?.isNew}
        onSave={save}
        onDelete={(e) => commit((events ?? []).filter((x) => x.id !== e.id), 'Borrado')}
        onClose={() => setEditing(null)}
      />

      {status.kind !== 'idle' && (
        <p
          role="status"
          className={cx(
            'fixed bottom-6 left-1/2 z-30 -translate-x-1/2 rounded-full border bg-night/90 px-5 py-2.5 text-sm whitespace-nowrap shadow-[0_10px_30px_rgb(0_0_0/0.5)] backdrop-blur-md',
            status.kind === 'error' ? 'border-danger/50 text-danger' : status.kind === 'ok' ? 'border-success/40 text-success' : 'border-violet-hi/40 text-mist',
          )}
        >
          {status.kind === 'saving' ? 'Guardando…' : status.kind === 'ok' ? `✓ ${status.text}` : status.text}
        </p>
      )}
    </>
  )
}
