import { useState } from 'react'
import { C, FONT_ROLES, LOGOS, type FontRole } from '../brand'
import { addCustomFont, customFonts, fileFontName, fontFamily, hasOfficial, removeCustomFont, removeRoleFont, roleFontName, uploadRoleFont, useFontsVersion } from '../lib/fonts'
import { pickFile } from '../lib/images'
import { Icon } from './icons'
import { Field } from './ui'
import { useUI } from './uiContext'

const FONT_FILES = '.otf,.ttf,.woff,.woff2'

export function BrandPanel() {
  useFontsVersion()
  const ui = useUI()
  const roles = Object.keys(FONT_ROLES) as FontRole[]
  const extra = customFonts()
  const [modal, setModal] = useState<{ use: FontRole | 'otra' } | null>(null)

  return (
    <div className="panel-scroll">
      <section>
        <h4>Fuentes en uso</h4>
        <ul className="font-list">
          {roles.map((r) => {
            const f = FONT_ROLES[r]
            return (
              <li key={r}>
                <span className="font-sample" style={{ fontFamily: fontFamily(r), fontWeight: Number(f.weight) }}>
                  {f.sample}
                </span>
                <span className="font-meta">
                  <strong>{f.label}</strong>
                  <em>{roleFontName(r)}</em>
                </span>
                <button className="btn small ghost" title={`Reemplazar la fuente de ${f.label}`} onClick={() => setModal({ use: r })}>
                  Cambiar
                </button>
                {hasOfficial(r) && (
                  <button className="ico" title="Volver a la fuente por defecto" aria-label="Volver a la fuente por defecto" onClick={() => removeRoleFont(r)}>
                    <Icon name="reset" size={14} />
                  </button>
                )}
              </li>
            )
          })}
          {extra.map((name) => (
            <li key={name}>
              <span className="font-sample" style={{ fontFamily: `"${name}"` }}>
                Aa
              </span>
              <span className="font-meta">
                <strong>{name}</strong>
                <em>Agregada</em>
              </span>
              <button className="ico" title="Quitar fuente" aria-label="Quitar fuente" onClick={() => removeCustomFont(name)}>
                <Icon name="trash" size={14} />
              </button>
            </li>
          ))}
        </ul>
        <button className="btn wide" onClick={() => setModal({ use: 'otra' })}>
          <Icon name="plus" size={14} /> Agregar fuente
        </button>
      </section>

      <section>
        <h4>Paleta</h4>
        <div className="palette">
          {[
            ['Violeta Radiant', C.violet],
            ['Negro profundo', C.black],
            ['Gris oscuro', C.dark],
            ['Púrpura sombra', C.shadow],
            ['Blanco', C.white],
            ['Ámbar (datos)', C.ember],
          ].map(([n, c]) => (
            <button key={c} className="pal" title="Copiar código" onClick={() => navigator.clipboard?.writeText(c).then(() => ui.toast(c + ' copiado'))}>
              <i style={{ background: c }} />
              <span>{n}</span>
              <code>{c}</code>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h4>Logos</h4>
        <div className="logo-row">
          {[LOGOS.main.positive, LOGOS.main.negative, LOGOS.gc.positive, LOGOS.gc.negative].map((l) => (
            <img key={l} src={l} alt="" />
          ))}
        </div>
        <p className="note">Se eligen solos: MAIN o GC según el roster; violeta en victorias, blanco en derrotas.</p>
      </section>
      {modal && (
        <FontModal
          initialUse={modal.use}
          onClose={() => setModal(null)}
          onSave={async (file, use, name) => {
            try {
              if (use === 'otra') await addCustomFont(file, name)
              else await uploadRoleFont(use, file, name)
              ui.toast(use === 'otra' ? `Fuente "${name}" agregada: elegila desde cualquier texto` : `${FONT_ROLES[use].label} ahora usa "${name}"`)
              setModal(null)
            } catch {
              ui.toast('No se pudo leer el archivo de la fuente', 'warn')
            }
          }}
        />
      )}
    </div>
  )
}

function FontModal({ initialUse, onClose, onSave }: { initialUse: FontRole | 'otra'; onClose: () => void; onSave: (file: File, use: FontRole | 'otra', name: string) => void }) {
  const [file, setFile] = useState<File>()
  const [name, setName] = useState('')
  const [use, setUse] = useState<FontRole | 'otra'>(initialUse)
  const roles = Object.keys(FONT_ROLES) as FontRole[]
  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div className="modal small" role="dialog" aria-modal aria-labelledby="font-modal-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="font-modal-title">Agregar fuente</h3>
        <Field label="Archivo (.otf, .ttf, .woff)">
          <button
            className="btn file-btn"
            onClick={async () => {
              const f = await pickFile(FONT_FILES)
              if (!f) return
              setFile(f)
              if (!name) setName(fileFontName(f))
            }}
          >
            <Icon name="plus" size={14} />
            {file ? file.name : 'Elegir archivo'}
          </button>
        </Field>
        <Field label="Nombre identificatorio" hint="Así va a aparecer en el selector de fuentes">
          <input value={name} placeholder="Ej: Cooper BT Bold" onChange={(e) => setName(e.target.value)} />
        </Field>
        <Field label="¿Para qué se usa?">
          <div className="use-list">
            {roles.map((r) => (
              <label key={r} className={'use-opt' + (use === r ? ' on' : '')}>
                <input type="radio" name="font-use" checked={use === r} onChange={() => setUse(r)} />
                <span>
                  <strong>{FONT_ROLES[r].label}</strong>
                  <em>{FONT_ROLES[r].use} · reemplaza a la actual</em>
                </span>
              </label>
            ))}
            <label className={'use-opt' + (use === 'otra' ? ' on' : '')}>
              <input type="radio" name="font-use" checked={use === 'otra'} onChange={() => setUse('otra')} />
              <span>
                <strong>Otro uso</strong>
                <em>Se suma como opción extra en el selector de fuentes</em>
              </span>
            </label>
          </div>
        </Field>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          <button className="btn primary" disabled={!file || !name.trim()} onClick={() => file && onSave(file, use, name.trim())}>
            Guardar fuente
          </button>
        </div>
      </div>
    </div>
  )
}
