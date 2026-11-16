import { C, MASCOTS } from '../../brand'
import { I, S as Shape, T } from '../../data/layouts'
import type { AppState } from '../../state'
import { FORMATS, type Layer, type ShapeLayer } from '../../types'
import { Icon } from '../icons'
import { useUI } from '../uiContext'

/** Botones para sumar elementos al diseño */
export function AddBar({ s }: { s: AppState }) {
  const ui = useUI()
  const { w, h } = FORMATS[s.format]
  const add = (l: Layer) => s.addLayer(l)
  return (
    <section className="addbar">
      <div className="add-row">
        <button className="tool" title="Agregar título" onClick={() => add(T('Texto', undefined, 'NUEVO TEXTO', w * 0.1, h * 0.45, w * 0.8, 'condensada', w * 0.08))}>
          <Icon name="text" size={18} />
          <span>Título</span>
        </button>
        <button className="tool" title="Agregar frase" onClick={() => add(T('Frase', undefined, 'Frase', w * 0.1, h * 0.45, w * 0.8, 'alma', w * 0.06))}>
          <span className="tool-glyph">Aa</span>
          <span>Frase</span>
        </button>
        <button
          className="tool"
          title="Agregar imagen"
          onClick={async () => {
            const ref = await ui.uploadPhoto()
            if (ref) add(I('Imagen', undefined, ref, w * 0.2, h * 0.2, w * 0.6, h * 0.5, { glow: 0.2 }))
          }}
        >
          <Icon name="image" size={18} />
          <span>Imagen</span>
        </button>
        <button className="tool" title="Agregar logo" onClick={() => add(I('Logo', 'logo:team', '', w / 2 - w * 0.1, h * 0.1, w * 0.2, w * 0.2, { glow: 0.3 }))}>
          <Icon name="sparkle" size={18} />
          <span>Logo</span>
        </button>
        <label className="tool" title="Agregar mascota">
          <Icon name="dragon" size={18} />
          <span>Mascota</span>
          <select
            value=""
            aria-label="Agregar mascota"
            onChange={(e) => {
              const m = MASCOTS.find((x) => x.id === e.target.value)
              if (m) add(I(m.label, undefined, m.src, w * 0.25, h * 0.3, w * 0.5, h * 0.5, { glow: 0.2, fadeBottom: 0.1 }))
            }}
          >
            <option value="">Mascota…</option>
            {MASCOTS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
        <label className="tool" title="Agregar forma">
          <Icon name="shape" size={18} />
          <span>Forma</span>
          <select
            value=""
            aria-label="Agregar forma"
            onChange={(e) => {
              const k = e.target.value as ShapeLayer['shape']
              if (!k) return
              const base = {
                line: Shape('Línea', 'line', w * 0.3, h / 2, w * 0.4, 0, { strokeWidth: 4 }),
                corner: Shape('Corte angular', 'corner', w * 0.1, h / 2, w * 0.3, w * 0.03, { strokeWidth: 4 }),
                rect: Shape('Recuadro', 'rect', w * 0.1, h * 0.4, w * 0.8, h * 0.15, { fill: 'rgba(0,0,16,0.55)', strokeWidth: 2 }),
                hex: Shape('Hexágono', 'hex', w * 0.4, h * 0.4, w * 0.2, w * 0.2, { strokeWidth: 3 }),
                slash: Shape('Panel', 'slash', 0, h * 0.62, w, h * 0.3, { fill: 'rgba(0,0,16,0.6)', strokeWidth: 3 }),
                frame: Shape('Esquinas', 'frame', w * 0.2, h * 0.2, w * 0.6, h * 0.4, { stroke: C.ember, strokeWidth: 3 }),
              }[k]
              add(base)
            }}
          >
            <option value="">Forma…</option>
            <option value="line">Línea</option>
            <option value="corner">Corte angular</option>
            <option value="rect">Recuadro</option>
            <option value="slash">Panel angular</option>
            <option value="hex">Hexágono</option>
            <option value="frame">Esquinas (marco)</option>
          </select>
        </label>
      </div>
    </section>
  )
}
