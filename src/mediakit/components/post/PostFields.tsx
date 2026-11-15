import { postType, todayISO } from '../../data/postTypes'
import type { AppState } from '../../state'
import { Field } from '../ui'
import { LogoField } from './LogoField'

/** Los datos propios del tipo de publicación (rival, torneo, fecha…) */
export function PostFields({ s, setField }: { s: AppState; setField: (k: string, v: string, checkFeed?: boolean) => void }) {
  const { doc } = s
  const t = postType(doc.type)
  return (
    <>
      {t.fields.filter((f) => f.key !== 'outcome' && f.key !== 'place').map((f) => (
        <Field key={f.key} label={f.label} hint={f.hint}>
          {f.kind === 'textarea' ? (
            <textarea rows={3} value={doc.fields[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value)} />
          ) : f.kind === 'select' ? (
            <select value={doc.fields[f.key] ?? f.options![0].value} onChange={(e) => setField(f.key, e.target.value, true)}>
              {f.options!.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          ) : f.kind === 'toggle' ? (
            <label className="switch">
              <input type="checkbox" checked={doc.fields[f.key] === '1'} onChange={(e) => setField(f.key, e.target.checked ? '1' : '', true)} />
              <span className="track" />
              <span>{doc.fields[f.key] === '1' ? 'Sí' : 'No'}</span>
            </label>
          ) : f.kind === 'image' ? (
            <LogoField value={doc.fields[f.key]} onChange={(ref) => setField(f.key, ref)} />
          ) : (
            f.prefix ? (
              // dirección fija delante: sólo se escribe el canal (si pegan la dirección completa, se le saca el principio)
              <div className="prefixed">
                <span>{f.prefix}</span>
                <input type="text" value={doc.fields[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value.replace(/^(https?:\/\/)?(www\.)?twitch\.tv\//i, ''))} />
              </div>
            ) : (
              <input type={f.kind} value={doc.fields[f.key] || (f.kind === 'date' && f.key !== 'deadline' ? todayISO() : '')} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value, f.kind === 'number')} />
            )
          )}
        </Field>
      ))}
    </>
  )
}
