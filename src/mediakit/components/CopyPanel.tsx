import { useEffect, useState } from 'react'
import { DEFAULT_HASHTAGS, HASHTAGS } from '../brand'
import { COPY_VARIANTS, generateCopy, type Network } from '../data/copy'
import type { AppState } from '../state'
import { FORMATS } from '../types'
import { useUI } from './ui'
import { Icon } from './icons'

export function CopyPanel({ s }: { s: AppState }) {
  const ui = useUI()
  const [net, setNet] = useState<Network>(FORMATS[s.format].network)
  const [variant, setVariant] = useState(0)
  const [tags, setTags] = useState<string[]>(s.doc.roster === 'gc' ? ['#SomosDRAGONAS', '#ElFuegoSigue', '#VamosDRAGONES'] : DEFAULT_HASHTAGS)
  const generated = generateCopy(s.doc, s.roster, net, variant, tags)
  const [text, setText] = useState(generated)
  const [dirty, setDirty] = useState(false)

  useEffect(() => setNet(FORMATS[s.format].network), [s.format])
  useEffect(() => {
    if (!dirty) setText(generated)
  }, [generated, dirty])

  const limit = net === 'x' ? 280 : 2200
  return (
    <div className="panel-scroll">
      <section>
        <h4>Copy</h4>
        <div className="two">
          <div className="seg">
            {(['ig', 'x'] as Network[]).map((n) => (
              <button key={n} className={net === n ? 'on' : ''} onClick={() => setNet(n)}>
                {n === 'ig' ? 'Instagram' : 'X'}
              </button>
            ))}
          </div>
          <button
            className="btn"
            onClick={() => {
              setDirty(false)
              setVariant((v) => (v + 1) % COPY_VARIANTS)
            }}
          >
            <Icon name="refresh" size={14} /> Otra versión
          </button>
        </div>
        <textarea
          className="copy-text"
          rows={14}
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            setDirty(true)
          }}
        />
        <div className="copy-meta">
          <span className={text.length > limit ? 'over' : ''}>
            {text.length} / {limit}
          </span>
          {dirty && (
            <button className="link" onClick={() => setDirty(false)}>
              descartar cambios
            </button>
          )}
        </div>
        <button
          className="btn primary wide"
          onClick={() => navigator.clipboard.writeText(text).then(() => ui.toast('Copy copiado al portapapeles'))}
        >
          Copiar texto
        </button>
        <p className="note">Sin negritas a propósito (en IG/X se verían los asteriscos). Lo que esté entre [CORCHETES] falta completar: torneo, rival o el @ de alguien en Roster.</p>
      </section>
      <section>
        <h4>Hashtags</h4>
        <div className="filter-grid">
          {HASHTAGS.map((h) => (
            <button key={h} className={'chip' + (tags.includes(h) ? ' on' : '')} onClick={() => setTags((t) => (t.includes(h) ? t.filter((x) => x !== h) : [...t, h]))}>
              {h}
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
