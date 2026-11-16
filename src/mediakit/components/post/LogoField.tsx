import { useState } from 'react'
import { removeFlatBackground } from '../../lib/flatBackground'
import { normalizeImage, pickFile, storeBlob } from '../../lib/images'
import { Icon } from '../icons'
import { Thumb } from '../Thumb'
import { useUI } from '../uiContext'

const LS_LOGOS = 'rs-logos-v1'

/** logos subidos antes (quedan guardados en este navegador, más nuevos primero) */
function readLogos(): string[] {
  try {
    return JSON.parse(localStorage.getItem(LS_LOGOS) ?? '[]') as string[]
  } catch {
    return []
  }
}
function writeLogos(list: string[]) {
  try {
    localStorage.setItem(LS_LOGOS, JSON.stringify(list.slice(0, 40)))
  } catch {
    /* sin almacenamiento: el logo se usa igual, sólo no queda en la lista */
  }
}

/**
 * Logo (del rival o del torneo): se sube con la opción de quitarle el fondo y queda guardado
 * para volver a elegirlo después con un toque.
 */
export function LogoField({ value, onChange }: { value?: string; onChange: (ref: string) => void }) {
  const ui = useUI()
  const [logos, setLogos] = useState(readLogos)
  const remember = (ref: string) => {
    const next = [ref, ...logos.filter((x) => x !== ref)]
    setLogos(next)
    writeLogos(next)
  }
  const forget = (ref: string) => {
    const next = logos.filter((x) => x !== ref)
    setLogos(next)
    writeLogos(next)
  }

  const upload = async () => {
    const file = await pickFile()
    if (!file) return
    const ref = await storeBlob(await normalizeImage(file, 1200), 'logo')
    const removeBg = await ui.ask<boolean>({
      title: '¿Le quitamos el fondo al logo?',
      body: 'Si el logo viene sobre un fondo liso (blanco, negro o de color), lo quitamos para que quede limpio sobre la placa.',
      options: [
        { label: 'No, dejalo así', value: false },
        { label: 'Sí, quitale el fondo', value: true, primary: true },
      ],
    })
    if (removeBg === undefined) return
    const final = removeBg ? await removeFlatBackground(ref).catch(() => ref) : ref
    remember(final)
    onChange(final)
  }

  return (
    <div className="logo-field">
      <div className="img-field">
        <Thumb src={value} />
        <button className="btn small" onClick={upload}>
          {value ? 'Subir otro' : 'Subir'}
        </button>
        {value && (
          <button className="btn small ghost" onClick={() => onChange('')}>
            Quitar
          </button>
        )}
      </div>
      {logos.length > 0 && (
        <div className="logo-library" aria-label="Logos guardados">
          {logos.map((ref) => (
            <div key={ref} className={'logo-pick' + (ref === value ? ' on' : '')}>
              <button title="Usar este logo" onClick={() => onChange(ref)}>
                <Thumb src={ref} />
              </button>
              <button className="logo-forget" title="Sacar de la lista" aria-label="Sacar de la lista" onClick={() => forget(ref)}>
                <Icon name="close" size={10} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
