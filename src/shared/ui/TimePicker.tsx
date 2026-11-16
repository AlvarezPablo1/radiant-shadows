import { useState } from 'react'
import { cx } from '../lib/cx'
import { usePopover } from '../lib/usePopover'

interface Props {
  id?: string
  /** "HH:MM" (24 hs) o vacío */
  value: string
  onChange: (value: string) => void
  required?: boolean
}

const VALID = /^([01]\d|2[0-3]):[0-5]\d$/

/** lo escrito → "HH:MM" en 24 hs ("2030" → "20:30", "9" → "09:00", "21:5" → "21:05"); null si no es una hora */
function normalizeTime(raw: string): string | null {
  const digits = raw.replace(/\D/g, '').slice(0, 4)
  if (!digits) return ''
  let h: number, m: number
  if (raw.includes(':')) {
    const [a, b = ''] = raw.split(':')
    h = Number(a.replace(/\D/g, '') || 0)
    m = Number(b.replace(/\D/g, '') || 0)
  } else if (digits.length <= 2) {
    h = Number(digits)
    m = 0
  } else {
    h = Number(digits.slice(0, digits.length - 2))
    m = Number(digits.slice(-2))
  }
  const out = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  return VALID.test(out) ? out : null
}

/**
 * Hora en formato 24 hs. Al tocar el campo se abre un panel con las 24 horas y los minutos (00, 15, 30, 45);
 * también se puede escribir directo ("2030" queda "20:30"). Reemplaza al selector nativo, que según el idioma
 * de la compu muestra a. m. / p. m.
 */
export function TimePicker({ id, value, onChange, required }: Props) {
  const [draft, setDraft] = useState<string | null>(null)
  const [bad, setBad] = useState(false)
  const { anchor, panel, pos, open, close } = usePopover<HTMLInputElement>(296, 250)
  const shown = draft ?? value
  const [hh, mm] = value ? value.split(':') : ['', '']

  const type = (raw: string) => {
    // sólo números y dos puntos; los dos puntos aparecen solos después de la hora
    let v = raw.replace(/[^\d:]/g, '').slice(0, 5)
    if (/^\d{3,4}$/.test(v)) v = v.slice(0, 2) + ':' + v.slice(2)
    setDraft(v)
    setBad(false)
    const t = normalizeTime(v)
    if (t !== null && (t === '' || v.length === 5)) onChange(t)
  }
  const commit = () => {
    if (draft === null) return
    const t = normalizeTime(draft)
    if (t === null) setBad(true)
    else {
      onChange(t)
      setDraft(null)
    }
  }
  const set = (t: string) => {
    onChange(t)
    setDraft(null)
    setBad(false)
  }
  // la hora deja el panel abierto para elegir los minutos; los minutos lo cierran
  const pickHour = (h: string) => set(`${h}:${mm || '00'}`)
  const pickMinute = (m: string) => {
    set(`${hh || '20'}:${m}`)
    close()
  }

  const cell = (on: boolean) =>
    cx('h-9 cursor-pointer rounded-lg text-sm tabular-nums transition-colors duration-100', on ? 'bg-violet font-semibold text-white' : 'text-fg hover:bg-violet/30')

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="relative">
        <svg viewBox="0 0 24 24" aria-hidden="true" className="pointer-events-none absolute top-1/2 left-3.5 size-4.5 -translate-y-1/2 fill-none stroke-lilac stroke-2">
          <circle cx="12" cy="12" r="8.5" />
          <path d="M12 7.5V12l3 2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <input
          ref={anchor}
          id={id}
          type="text"
          inputMode="numeric"
          autoComplete="off"
          placeholder="Elegí o escribí la hora"
          maxLength={5}
          required={required}
          pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
          title="Hora en formato 24 hs, por ejemplo 21:00"
          aria-haspopup="dialog"
          aria-expanded={pos !== null}
          value={shown}
          onFocus={() => pos === null && open()}
          onClick={() => pos === null && open()}
          onChange={(e) => type(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              commit()
              close()
            } else if (e.key === 'Tab') close()
          }}
          className={cx(
            'block min-h-11 w-full min-w-0 cursor-pointer rounded-[10px] border bg-night/60 py-2.5 pr-16 pl-10 text-base text-fg tabular-nums outline-none transition-[border-color,box-shadow] duration-150 placeholder:text-muted',
            'focus:border-violet-hi focus:shadow-[0_0_0_3px_rgb(142_68_255/0.25)]',
            bad ? 'border-[#ff6b8a]' : 'border-violet-hi/28',
          )}
        />
        <span className="pointer-events-none absolute top-1/2 right-3.5 -translate-y-1/2 text-xs font-semibold tracking-[0.08em] text-muted">24 HS</span>
      </div>
      {bad && <p className="text-xs text-[#ff6b8a]">Escribí una hora de 00:00 a 23:59.</p>}

      {pos && (
        <div
          ref={panel}
          role="dialog"
          aria-label="Elegir hora"
          style={{ position: 'fixed', ...pos, width: 296 }}
          // que tocar el panel no le saque el foco al campo (así no se cierra ni se pierde lo escrito)
          onPointerDown={(e) => e.preventDefault()}
          className="z-100 animate-fade-in rounded-2xl border border-violet-hi/35 bg-[#0d0524] p-3 shadow-[0_18px_40px_rgb(0_0_0/0.6)]"
        >
          <p className="mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted">HORA</p>
          <div className="grid grid-cols-6 gap-1">
            {Array.from({ length: 24 }, (_, h) => String(h).padStart(2, '0')).map((h) => (
              <button key={h} type="button" onClick={() => pickHour(h)} className={cell(h === hh)}>
                {h}
              </button>
            ))}
          </div>
          <p className="mt-3 mb-1.5 text-[11px] font-semibold tracking-[0.08em] text-muted">MINUTOS</p>
          <div className="grid grid-cols-4 gap-1">
            {['00', '15', '30', '45'].map((m) => (
              <button key={m} type="button" onClick={() => pickMinute(m)} className={cell(m === mm)}>
                :{m}
              </button>
            ))}
          </div>
          {value && !required && (
            <button type="button" onClick={() => (set(''), close())} className="mt-3 w-full cursor-pointer rounded-lg py-1.5 text-[13px] text-muted hover:bg-violet/20 hover:text-white">
              Sin hora
            </button>
          )}
        </div>
      )}
    </div>
  )
}
