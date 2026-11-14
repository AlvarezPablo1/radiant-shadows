import { useRef, useState } from 'react'
import { uploadImage } from '../lib/api'
import { removeBackground, useCutoutStatus } from '../lib/cutout'
import { smallBtn } from './styles'

interface Props {
  id: string
  value: string
  onChange: (url: string) => void
  /** ofrecer quitar el fondo (fotos de personas); viene activado al subir */
  cutout?: boolean
}

/** Vista previa + subir desde la compu o el celular (con opción de quitar el fondo), quitar fondo a la actual o sacarla */
export function ImageField({ id, value, onChange, cutout }: Props) {
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState('')
  const [error, setError] = useState('')
  const [removeBg, setRemoveBg] = useState(!!cutout)
  const tool = useCutoutStatus()

  async function run(task: () => Promise<string>) {
    setError('')
    try {
      onChange(await task())
    } catch (e) {
      setError((e as Error).message || 'No se pudo procesar la imagen')
    } finally {
      setBusy('')
      if (input.current) input.current.value = ''
    }
  }

  const pick = (file: File | undefined) =>
    file &&
    run(async () => {
      const ready = removeBg ? await removeBackground(file, file.name, setBusy) : file
      setBusy('Subiendo…')
      return uploadImage(ready)
    })

  // a una foto ya subida (p. ej. con fondo) también se le puede sacar el fondo
  const cutCurrent = () =>
    run(async () => {
      setBusy('Preparando la foto…')
      const blob = await (await fetch(value)).blob()
      const ready = await removeBackground(blob, value.split('/').pop() ?? 'foto', setBusy)
      setBusy('Subiendo…')
      return uploadImage(ready)
    })

  return (
    <div className="flex items-start gap-4 max-sm:flex-col">
      <div className="grid size-28 shrink-0 place-items-center overflow-hidden rounded-xl border border-violet-hi/25 bg-[repeating-conic-gradient(rgb(255_255_255/0.04)_0_25%,transparent_0_50%)] bg-[length:16px_16px] max-sm:size-36">
        {busy ? (
          <span className="size-8 animate-spin rounded-full border-2 border-violet-hi/30 border-t-violet-hi" aria-hidden="true" />
        ) : value ? (
          <img src={value} alt="" className="max-h-full max-w-full object-contain" />
        ) : (
          <span className="text-xs text-muted">Sin imagen</span>
        )}
      </div>

      <div className="flex min-w-0 flex-col items-start gap-2.5">
        <input id={id} ref={input} type="file" accept="image/png,image/jpeg,image/webp,image/gif" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        <div className="flex flex-wrap gap-2">
          <button type="button" className={smallBtn} disabled={!!busy} onClick={() => input.current?.click()}>
            {value ? 'Cambiar imagen' : 'Subir imagen'}
          </button>
          {value && cutout && (
            <button type="button" className={smallBtn} disabled={!!busy} onClick={cutCurrent}>
              Quitar fondo
            </button>
          )}
          {value && (
            <button type="button" className={smallBtn} disabled={!!busy} onClick={() => onChange('')}>
              Sacar
            </button>
          )}
        </div>

        {cutout && (
          <label className="flex cursor-pointer items-center gap-2 text-[13px] text-mist">
            <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} className="size-4 accent-violet-hi" />
            Quitar el fondo al subir
          </label>
        )}

        <p role="status" className="min-h-4 text-xs text-muted">
          {busy || (error ? '' : cutout && removeBg && tool === 'loading' ? 'Preparando la herramienta para quitar fondos…' : '')}
        </p>
        {error && <p className="text-xs text-danger">{error}</p>}
      </div>
    </div>
  )
}
