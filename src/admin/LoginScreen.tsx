import { useState } from 'react'
import { Kicker } from '../shared/ui/Kicker'
import { inputCls } from './components/styles'

/** Login del staff: el formulario va directo a /api/login, que vuelve a /admin (con ?error=1 si falla) */
export function LoginScreen() {
  const [error] = useState(() => new URLSearchParams(location.search).has('error'))
  const [show, setShow] = useState(false)
  return (
    <main className="relative z-2 grid min-h-svh place-items-center px-4 py-10">
      <section
        className={
          'flex w-full max-w-105 flex-col items-center rounded-[22px] border border-violet-hi/35 bg-card px-9 pt-10 pb-8 text-center shadow-card max-sm:px-6 ' +
          (error ? 'animate-[shake_0.4s]' : '')
        }
      >
        <img src="/brand/logos/rs-positive.webp" alt="Radiant Shadows" className="size-20 drop-shadow-[0_0_20px_rgb(142_68_255/0.6)]" />
        <Kicker className="mt-5">Radiant Shadows</Kicker>
        <h1 className="mt-2 font-brand-title text-[35px] text-white">
          PANEL <span className="text-lilac">ADMIN</span>
        </h1>
        <span className="mt-2 -rotate-3 font-script text-[18px] text-ember">el fuego sigue</span>

        <form method="post" action="/api/login" className="mt-7 flex w-full flex-col gap-3 text-left">
          {error && (
            <p role="alert" className="rounded-lg bg-danger/12 px-3 py-2 text-sm text-danger">
              Contraseña incorrecta. Probá de nuevo.
            </p>
          )}
          <label htmlFor="password" className="text-[13px] font-semibold tracking-[0.04em] text-mist">
            Contraseña
          </label>
          <div className="relative">
            <input id="password" name="password" type={show ? 'text' : 'password'} autoComplete="current-password" required autoFocus className={inputCls + ' pr-12'} />
            <button
              type="button"
              onClick={() => setShow((s) => !s)}
              aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={show}
              className="absolute top-1/2 right-2 grid size-8 -translate-y-1/2 cursor-pointer place-items-center rounded-full text-muted hover:text-white"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4.5 fill-none stroke-current stroke-[1.7]">
                <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button type="submit" className="mt-2 cursor-pointer rounded-full bg-cta pt-3 pb-2.5 font-display text-[22px] tracking-[0.12em] text-white shadow-cta hover:brightness-112">
            ENTRAR
          </button>
        </form>
      </section>
    </main>
  )
}
