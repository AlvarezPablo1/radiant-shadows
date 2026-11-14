import type { FieldDef } from '../schemas'
import { Select } from '../../home/components/Select'
import { ImageField } from './ImageField'
import { LinkField } from './LinkField'
import { inputCls } from './styles'

interface Props {
  field: FieldDef
  value: unknown
  onChange: (value: unknown) => void
}

/** Un campo del formulario según su tipo (texto, número, fecha, desplegable, imagen…) */
export function Field({ field, value, onChange }: Props) {
  const id = `f-${field.key.replace('.', '-')}`
  const text = value == null ? '' : String(value)

  if (field.type === 'checkbox') {
    return (
      <label htmlFor={id} className="flex cursor-pointer items-center gap-3 text-[15px] text-fg">
        <input id={id} type="checkbox" checked={value === true} onChange={(e) => onChange(e.target.checked)} className="size-4.5 accent-violet-hi" />
        {field.label}
      </label>
    )
  }

  let control
  if (field.type === 'image') control = <ImageField id={id} value={text} onChange={onChange} cutout={field.cutout} />
  else if (field.type === 'link') control = <LinkField id={id} value={text} onChange={onChange} />
  else if (field.type === 'textarea')
    control = <textarea id={id} rows={3} value={text} required={field.required} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} className={inputCls + ' resize-y'} />
  else if (field.type === 'select')
    control = (
      <Select
        id={id}
        value={text}
        onChange={onChange}
        required={field.required}
        placeholder={field.required ? 'Elegí una opción' : '—'}
        options={field.required ? (field.options ?? []) : [{ value: '', label: '—' }, ...(field.options ?? [])]}
      />
    )
  else
    control = (
      <input
        id={id}
        type={field.type}
        step={field.step}
        value={text}
        required={field.required}
        placeholder={field.placeholder}
        onChange={(e) => onChange(field.type === 'number' ? (e.target.value === '' ? '' : Number(e.target.value)) : e.target.value)}
        className={inputCls}
      />
    )

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold tracking-[0.04em] text-mist">
        {field.label}
        {field.required && <span className="text-lilac"> *</span>}
      </label>
      {control}
      {field.help && <p className="text-xs text-muted">{field.help}</p>}
    </div>
  )
}
