import { useState } from 'react'
import { DEFAULT_GUIDES } from '../../hooks/useGuides'
import type { AppState } from '../../state'
import { FORMAT_IDS, FORMATS, type FormatId } from '../../types'
import type { Guides } from '../canvas/guides'
import { Icon } from '../icons'

interface Props {
  s: AppState
  feedOk: boolean
  storyOk: boolean
  goFormat: (f: FormatId) => void
  guides: Guides
  setGuides: (g: Guides) => void
  guidesOn: boolean
  setGuidesOn: (on: boolean) => void
  safe: boolean
  setSafe: (on: boolean) => void
}

/** barra de arriba del lienzo: formatos, guías (con su configuración), zonas seguras y restablecer */
export function CanvasBar({ s, feedOk, storyOk, goFormat, guides, setGuides, guidesOn, setGuidesOn, safe, setSafe }: Props) {
  const [menu, setMenu] = useState(false)
  const format = s.format
  return (
    <div className="canvas-bar">
      <nav className="formats" aria-label="Formato">
        {FORMAT_IDS.filter((f) => f !== 'story' || storyOk).map((f) => {
          const off = f === 'feed' && !feedOk
          return (
            <button key={f} className={(format === f ? 'on ' : '') + (off ? 'off' : '')} onClick={() => goFormat(f)} title={off ? 'Las publicaciones no tan relevantes no van en este formato' : `${FORMATS[f].w}×${FORMATS[f].h}`}>
              <i className={'ratio r-' + f} />
              {FORMATS[f].label}
            </button>
          )
        })}
      </nav>
      <div className="canvas-tools">
        <div className="guides-wrap">
          <button className={'tbtn' + (guidesOn ? ' active' : '')} onClick={() => setGuidesOn(!guidesOn)} title="Mostrar márgenes y renglones (G)">
            <Icon name="grid" />
            Guías
          </button>
          <button className={'tbtn icon' + (menu ? ' active' : '')} aria-label="Configurar guías" aria-expanded={menu} onClick={() => setMenu(!menu)}>
            <Icon name="settings" />
          </button>
          {menu && (
            <div className="popover" onMouseLeave={() => setMenu(false)}>
              <label className="num">
                <span>Márgenes</span>
                <input type="number" min={0} max={25} value={guides.margin} onChange={(e) => setGuides({ ...guides, margin: Number(e.target.value) })} />
                <em>%</em>
              </label>
              <label className="num">
                <span>Renglones</span>
                <input type="number" min={0} max={60} value={guides.rows} onChange={(e) => setGuides({ ...guides, rows: Number(e.target.value) })} />
              </label>
              <label className="num">
                <span>Columnas</span>
                <input type="number" min={0} max={12} value={guides.cols} onChange={(e) => setGuides({ ...guides, cols: Number(e.target.value) })} />
              </label>
              <label className="switch">
                <input type="checkbox" checked={guides.center} onChange={(e) => setGuides({ ...guides, center: e.target.checked })} />
                <span className="track" />
                <span>Ejes centrales</span>
              </label>
              <label className="switch">
                <input type="checkbox" checked={guides.snap} onChange={(e) => setGuides({ ...guides, snap: e.target.checked })} />
                <span className="track" />
                <span>Imantar al mover</span>
              </label>
              <button className="link" onClick={() => setGuides(DEFAULT_GUIDES)}>
                Restablecer guías
              </button>
            </div>
          )}
        </div>
        {format === 'story' && (
          <button className={'tbtn' + (safe ? ' active' : '')} onClick={() => setSafe(!safe)} title="Zonas que tapa la interfaz de Instagram">
            <Icon name="phone" />
            Zonas seguras
          </button>
        )}
        <button className="tbtn" onClick={() => s.setDoc((d) => ({ ...d, layers: { ...d.layers, [format]: undefined } }))} title="Vuelve a armar este formato desde la plantilla">
          <Icon name="reset" />
          Restablecer
        </button>
      </div>
    </div>
  )
}
