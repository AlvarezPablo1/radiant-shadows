import { postType, todayISO } from '../../data/postTypes'
import type { AppState } from '../../state'
import { Thumb } from '../Thumb'
import { Field, useUI } from '../ui'

/** Los datos propios del tipo de publicación (rival, torneo, fecha…) */
export function PostFields({ s, setField }: { s: AppState; setField: (k: string, v: string, checkFeed?: boolean) => void }) {
  const { doc } = s
  const ui = useUI()
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
            <div className="img-field">
              <Thumb src={doc.fields[f.key]} />
              <button
                className="btn small"
                onClick={async () => {
                  const ref = await ui.uploadPhoto({ askPng: false })
                  if (ref) setField(f.key, ref)
                }}
              >
                {doc.fields[f.key] ? 'Cambiar' : 'Subir'}
              </button>
              {doc.fields[f.key] && (
                <button className="btn small ghost" onClick={() => setField(f.key, '')}>
                  Quitar
                </button>
              )}
            </div>
          ) : (
            <input type={f.kind} value={doc.fields[f.key] || (f.kind === 'date' && f.key !== 'deadline' ? todayISO() : '')} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value, f.kind === 'number')} />
          )}
        </Field>
      ))}
    </>
  )
}
