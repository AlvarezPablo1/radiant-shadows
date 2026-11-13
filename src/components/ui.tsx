import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from 'react'
import { PALETTE } from '../brand'
import { Icon } from './icons'
import { normalizeImage, pickFile, removeBackground, storeBlob } from '../lib/images'

/* ---------- primitivas ---------- */

export function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{label}</span>
      {children}
      {hint && <span className="field-hint">{hint}</span>}
    </label>
  )
}

export function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.01,
  onChange,
  fmt,
  onReset,
  isDefault,
}: {
  label: string
  value: number
  min?: number
  max?: number
  step?: number
  onChange: (v: number) => void
  fmt?: (v: number) => string
  /** si se pasa, muestra un botón para volver al valor original */
  onReset?: () => void
  isDefault?: boolean
}) {
  return (
    <div className="slider">
      <span>
        <label>{label}</label>
        <span className="slider-val">
          {onReset && !isDefault && (
            <button type="button" className="reset" title="Restablecer" aria-label={`Restablecer ${label}`} onClick={onReset}>
              <Icon name="reset" size={12} />
            </button>
          )}
          <em>{fmt ? fmt(value) : Math.round(((value - min) / (max - min)) * 100) + '%'}</em>
        </span>
      </span>
      <input type="range" aria-label={label} min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </div>
  )
}

export function Seg<T extends string | number>({ value, options, onChange }: { value: T; options: { value: T; label: ReactNode; disabled?: boolean; title?: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="seg" role="radiogroup">
      {options.map((o) => (
        <button key={String(o.value)} type="button" role="radio" aria-checked={o.value === value} className={o.value === value ? 'on' : ''} title={o.title} aria-disabled={o.disabled} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function ColorPick({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div className="colors">
      {PALETTE.map((c) => (
        <button key={c} type="button" className={'sw' + (c.toLowerCase() === value.toLowerCase() ? ' on' : '')} style={{ background: c }} title={c} aria-label={c} onClick={() => onChange(c)} />
      ))}
      <input type="color" value={value.startsWith('#') ? value : '#ffffff'} onChange={(e) => onChange(e.target.value)} title="Otro color" />
    </div>
  )
}

/* ---------- diálogos / toasts / progreso ---------- */

interface AskOpt<T> {
  title: string
  body?: ReactNode
  options: { label: string; value: T; primary?: boolean }[]
}
interface UICtx {
  ask: <T>(o: AskOpt<T>) => Promise<T | undefined>
  toast: (msg: string, kind?: 'info' | 'warn') => void
  busy: (label: string | null, progress?: number) => void
  uploadPhoto: (opts?: { askPng?: boolean }) => Promise<string | undefined>
  cutout: (src: string) => Promise<string | undefined>
}
const Ctx = createContext<UICtx>(null!)
export const useUI = () => useContext(Ctx)

export function UIProvider({ children }: { children: ReactNode }) {
  const [dialog, setDialog] = useState<(AskOpt<unknown> & { resolve: (v: unknown) => void }) | null>(null)
  const [toasts, setToasts] = useState<{ id: number; msg: string; kind: string }[]>([])
  const [busyState, setBusy] = useState<{ label: string; progress?: number } | null>(null)
  const tid = useRef(0)

  const ask = useCallback(<T,>(o: AskOpt<T>) => new Promise<T | undefined>((resolve) => setDialog({ ...(o as AskOpt<unknown>), resolve: resolve as (v: unknown) => void })), [])
  const toast = useCallback((msg: string, kind: 'info' | 'warn' = 'info') => {
    const id = ++tid.current
    setToasts((t) => [...t, { id, msg, kind }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 5200)
  }, [])
  const busy = useCallback((label: string | null, progress?: number) => setBusy(label ? { label, progress } : null), [])

  const cutout = useCallback(
    async (src: string) => {
      busy('Preparando recorte…', 0)
      try {
        return await removeBackground(src, (pr, label) => busy(label, pr))
      } catch (e) {
        console.error(e)
        toast('No se pudo quitar el fondo. Probá con otra foto o subí un PNG ya recortado.', 'warn')
        return undefined
      } finally {
        busy(null)
      }
    },
    [busy, toast],
  )

  const uploadPhoto = useCallback(
    async (opts: { askPng?: boolean } = {}) => {
      const file = await pickFile()
      if (!file) return
      const blob = await normalizeImage(file)
      const ref = await storeBlob(blob, 'photo')
      if (opts.askPng === false) return ref
      const already = await ask<boolean>({
        title: '¿Esta foto ya es PNG sin fondo?',
        body: 'Las fotos de jugadores se usan recortadas (PNG) para integrarse al diseño. Si tiene fondo, lo quitamos automáticamente.',
        options: [
          { label: 'Sí, ya está recortada', value: true },
          { label: 'No, quitale el fondo', value: false, primary: true },
        ],
      })
      if (already === undefined) return
      if (already) return ref
      return (await cutout(ref)) ?? ref
    },
    [ask, cutout],
  )

  return (
    <Ctx.Provider value={{ ask, toast, busy, uploadPhoto, cutout }}>
      {children}
      {dialog && (
        <div className="modal-back" onMouseDown={() => (dialog.resolve(undefined), setDialog(null))}>
          <div className="modal small" role="dialog" aria-modal onMouseDown={(e) => e.stopPropagation()}>
            <h3>{dialog.title}</h3>
            {dialog.body && <div className="modal-body">{dialog.body}</div>}
            <div className="modal-actions">
              {dialog.options.map((o) => (
                <button key={o.label} className={o.primary ? 'btn primary' : 'btn'} onClick={() => (dialog.resolve(o.value), setDialog(null))}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      {busyState && (
        <div className="modal-back">
          <div className="modal small busy">
            <div className="spinner" />
            <p>{busyState.label}</p>
            {busyState.progress !== undefined && busyState.progress > 0 && (
              <div className="bar">
                <i style={{ width: Math.round(busyState.progress * 100) + '%' }} />
              </div>
            )}
          </div>
        </div>
      )}
      <div className="toasts" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={'toast ' + t.kind}>
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  )
}
