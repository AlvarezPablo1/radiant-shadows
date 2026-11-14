import { useRef, useState } from 'react'
import { uploadImage } from '../lib/api'
import { smallBtn } from './styles'

interface Props {
  id: string
  value: string
  onChange: (url: string) => void
}

/** Vista previa + subir desde la compu (va a Vercel Blob) o quitar la imagen */
export function ImageField({ id, value, onChange }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError('')
    try {
      onChange(await uploadImage(file))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  return (
    <div className="flex items-center gap-4">
      <div className="grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl border border-violet-hi/25 bg-[linear-gradient(to_bottom,rgb(122_40_226/0.3),rgb(0_0_16/0.6))]">
        {value ? <img src={value} alt="" className="max-h-full max-w-full object-contain" /> : <span className="text-xs text-muted">Sin imagen</span>}
      </div>
      <div className="flex flex-col items-start gap-2">
        <input id={id} ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex gap-2">
          <button type="button" className={smallBtn} disabled={busy} onClick={() => input.current?.click()}>
            {busy ? 'Subiendo…' : value ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          {value && !busy && (
            <button type="button" className={smallBtn} onClick={() => onChange('')}>
              Quitar
            </button>
          )}
        </div>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </div>
  )
}
