import { useState } from 'react'
import { Select } from '../../shared/ui/Select'
import { DESTINATIONS } from '../lib/destinations'
import { inputCls } from './styles'

const EXTERNAL = '__externo'

interface Props {
  id: string
  value: string
  onChange: (value: string) => void
}

/** Destino de un botón: se elige de la lista de secciones; "Link externo" muestra un campo para pegar la URL */
export function LinkField({ id, value, onChange }: Props) {
  const known = DESTINATIONS.some((d) => d.value === value)
  const [external, setExternal] = useState(value !== '' && !known)

  return (
    <div className="flex flex-col gap-2">
      <Select
        id={id}
        value={external ? EXTERNAL : value}
        onChange={(v) => {
          setExternal(v === EXTERNAL)
          onChange(v === EXTERNAL ? '' : v)
        }}
        placeholder="— Sin botón —"
        options={[{ value: '', label: '— Sin botón —' }, ...DESTINATIONS, { value: EXTERNAL, label: 'Link externo (otra página)…' }]}
      />
      {external && (
        <input
          type="url"
          aria-label="Dirección del link externo"
          value={value}
          required
          placeholder="https://…"
          onChange={(e) => onChange(e.target.value)}
          className={inputCls}
        />
      )}
    </div>
  )
}
