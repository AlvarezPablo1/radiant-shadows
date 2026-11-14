import { useEffect, useState } from 'react'
import { Background } from '../home/components/Background'
import type { Content } from '../home/data/content'
import { Dashboard } from './Dashboard'
import { LoginScreen } from './LoginScreen'
import { hasSession, loadContent } from './lib/api'

const YEAR = new Date().getFullYear()

type State = { kind: 'loading' } | { kind: 'login' } | { kind: 'ready'; content: Content } | { kind: 'error'; message: string }

/** Panel /admin: si hay sesión muestra el panel con el contenido actual; si no, el login */
export function AdminApp() {
  const [state, setState] = useState<State>({ kind: 'loading' })

  useEffect(() => {
    hasSession()
      .then(async (ok) => {
        if (!ok) return setState({ kind: 'login' })
        history.replaceState(null, '', '/admin') // saca el ?error=1 si venía del login
        setState({ kind: 'ready', content: await loadContent() })
      })
      .catch((e: Error) => setState({ kind: 'error', message: e.message }))
  }, [])

  return (
    <>
      <Background year={YEAR} />
      {state.kind === 'loading' && <p className="relative z-2 grid min-h-svh place-items-center font-display text-[24px] tracking-[0.2em] text-muted">CARGANDO…</p>}
      {state.kind === 'login' && <LoginScreen />}
      {state.kind === 'error' && (
        <p className="relative z-2 grid min-h-svh place-items-center px-4 text-center text-danger">
          {state.message}. Si estás probando en local, el panel necesita `vercel dev` (con `npm run dev` no hay APIs).
        </p>
      )}
      {state.kind === 'ready' && <Dashboard initial={state.content} />}
    </>
  )
}
