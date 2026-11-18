import { useState } from 'react'
import { postType } from '../data/postTypes'
import type { AppState } from '../state'
import { NEWS_SIZE_IDS, NEWS_SIZES, type NewsSize } from '../data/newsSizes'
import { FORMAT_IDS, FORMATS, type FormatId } from '../types'

export interface DownloadOpts {
  formats: FormatId[]
  /** imágenes para las noticias de la web (salen del diseño de X) */
  news: NewsSize[]
  type: 'png' | 'jpg'
}

export function DownloadModal({ s, onClose, onDownload }: { s: AppState; onClose: () => void; onDownload: (o: DownloadOpts) => void }) {
  const t = postType(s.doc.type)
  const allowed = FORMAT_IDS.filter((f) => f !== 'feed' || t.feed(s.doc))
  const [checks, setChecks] = useState<Record<string, boolean>>({})
  const [formats, setFormats] = useState<FormatId[]>([s.format])
  const [news, setNews] = useState<NewsSize[]>([])
  const [type, setType] = useState<'png' | 'jpg'>('png')
  const total = formats.length + news.length
  const done = t.checklist.every((c) => checks[c])

  return (
    <div className="modal-back" onMouseDown={onClose}>
      <div className="modal" role="dialog" aria-modal aria-labelledby="dl-title" onMouseDown={(e) => e.stopPropagation()}>
        <h3 id="dl-title">Antes de publicar</h3>
        <div className="dl-grid">
          <div>
            <h4>Checklist · {t.label}</h4>
            <ul className="checklist">
              {t.checklist.map((c) => (
                <li key={c}>
                  <label>
                    <input type="checkbox" checked={!!checks[c]} onChange={(e) => setChecks((x) => ({ ...x, [c]: e.target.checked }))} />
                    <span>{c}</span>
                  </label>
                </li>
              ))}
            </ul>
            <button className="link" onClick={() => setChecks(Object.fromEntries(t.checklist.map((c) => [c, true])))}>
              Marcar todo
            </button>
            <p className="note">El logo del rival es opcional y no forma parte del checklist.</p>
          </div>
          <div>
            <h4>Formatos</h4>
            {FORMAT_IDS.map((f) => {
              const ok = allowed.includes(f)
              return (
                <label key={f} className={'toggle' + (ok ? '' : ' disabled')} title={ok ? '' : 'Las publicaciones no tan relevantes no van en este formato'}>
                  <input type="checkbox" disabled={!ok} checked={formats.includes(f)} onChange={(e) => setFormats((x) => (e.target.checked ? [...x, f] : x.filter((y) => y !== f)))} />
                  <span>
                    {FORMATS[f].label} <em>{FORMATS[f].w}×{FORMATS[f].h}</em>
                  </span>
                </label>
              )
            })}
            <h4>Noticias de la web</h4>
            {NEWS_SIZE_IDS.map((n) => (
              <label key={n} className="toggle" title="Se arma con el diseño de X, entero y centrado">
                <input type="checkbox" checked={news.includes(n)} onChange={(e) => setNews((x) => (e.target.checked ? [...x, n] : x.filter((y) => y !== n)))} />
                <span>
                  {NEWS_SIZES[n].label} <em>{NEWS_SIZES[n].w}×{NEWS_SIZES[n].h}</em>
                </span>
              </label>
            ))}
            <p className="note">Salen del diseño de X.</p>
            <h4>Archivo</h4>
            <div className="seg">
              {(['png', 'jpg'] as const).map((x) => (
                <button key={x} className={type === x ? 'on' : ''} onClick={() => setType(x)}>
                  {x.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn ghost" onClick={onClose}>
            Cancelar
          </button>
          {!done && (
            <button className="btn" disabled={!total} onClick={() => onDownload({ formats, news, type })} title="Descargar aunque falten ítems del checklist">
              Descargar sin completar
            </button>
          )}
          <button className="btn primary" disabled={!done || !total} onClick={() => onDownload({ formats, news, type })}>
            Descargar {total > 1 ? `${total} imágenes` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
