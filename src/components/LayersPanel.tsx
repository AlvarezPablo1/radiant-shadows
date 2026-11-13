import { useState } from 'react'
import { C, FONT_ROLES, MASCOTS, type FontRole } from '../brand'
import { I, S as Shape, T, newId } from '../data/layouts'
import { FILTERS } from '../lib/filters'
import { customFonts, fontFamily, useFontsVersion } from '../lib/fonts'
import type { AppState } from '../state'
import { FORMATS, type ImageLayer, type Layer, type ShapeLayer, type TextLayer } from '../types'
import { Icon } from './icons'
import { ColorPick, Field, Seg, Slider, useUI } from './ui'

const BIND_LABEL: Record<string, string> = { 'logo:team': 'logo automático (cambia con roster y resultado)', 'logo:rival': 'logo del rival', mascot: 'mascota elegida' }
const TYPE_LABEL = { text: 'Texto', image: 'Imagen', shape: 'Forma' }

/** caja aproximada de un elemento (en coordenadas del diseño) */
function bbox(l: Layer, values: Record<string, string>) {
  if (l.type === 'text') {
    const v = (l.bind ? values[l.bind] : l.text) ?? ''
    const lines = Math.max(1, v.split('\n').length)
    return { x: l.x, y: l.y, w: l.width, h: lines * l.fontSize * l.lineHeight }
  }
  return { x: l.x, y: l.y, w: l.width, h: Math.max(l.height, 1) }
}

export function LayersPanel({ s, values }: { s: AppState; values: Record<string, string> }) {
  const { layers, selection } = s
  const sel = layers.filter((l) => selection.includes(l.id))
  const [drag, setDrag] = useState<string | null>(null)
  const [over, setOver] = useState<string | null>(null)

  /** mueve `id` a la posición de `target` (la lista se muestra invertida: arriba = adelante) */
  const reorder = (id: string, target: string) =>
    s.setLayers((ls) => {
      const from = ls.findIndex((l) => l.id === id)
      const to = ls.findIndex((l) => l.id === target)
      if (from < 0 || to < 0) return ls
      const c = [...ls]
      const [x] = c.splice(from, 1)
      c.splice(to, 0, x)
      return c
    })
  const move = (id: string, dir: number) =>
    s.setLayers((ls) => {
      const i = ls.findIndex((l) => l.id === id)
      const j = Math.max(0, Math.min(ls.length - 1, i + dir))
      if (i === j) return ls
      const c = [...ls]
      const [x] = c.splice(i, 1)
      c.splice(j, 0, x)
      return c
    })

  return (
    <div className="panel-scroll">
      <AddBar s={s} />
      {sel.length === 1 && <Props s={s} l={sel[0]} values={values} />}
      {sel.length > 1 && <MultiProps s={s} sel={sel} values={values} />}
      <section className="layers-sec">
        <h4>
          Capas <span className="h-hint">arrastrá para ordenar · Shift + clic para elegir varias</span>
        </h4>
        <ul className="layers">
          {[...layers].reverse().map((l) => (
            <li
              key={l.id}
              draggable
              onDragStart={(e) => {
                setDrag(l.id)
                e.dataTransfer.effectAllowed = 'move'
              }}
              onDragOver={(e) => {
                e.preventDefault()
                if (drag && drag !== l.id) setOver(l.id)
              }}
              onDragLeave={() => setOver((o) => (o === l.id ? null : o))}
              onDrop={(e) => {
                e.preventDefault()
                if (drag && drag !== l.id) reorder(drag, l.id)
                setDrag(null)
                setOver(null)
              }}
              onDragEnd={() => {
                setDrag(null)
                setOver(null)
              }}
              className={(selection.includes(l.id) ? 'on ' : '') + (l.visible ? '' : 'hidden ') + (over === l.id ? 'drop ' : '') + (drag === l.id ? 'dragging' : '')}
              onClick={(e) => (e.shiftKey || e.metaKey || e.ctrlKey ? s.toggleSelected(l.id) : s.setSelected(l.id))}
            >
              <span className="grip" aria-hidden>
                <Icon name="grip" size={14} />
              </span>
              <span className={'kind ' + l.type}>
                <Icon name={l.type === 'text' ? 'text' : l.type === 'image' ? 'image' : 'shape'} size={12} />
              </span>
              <span className="lname">
                {l.name}
                {l.type === 'text' && <small>{(l.bind ? values[l.bind] : l.text)?.slice(0, 28)}</small>}
              </span>
              <span className="row-actions">
                <button className="ico" title="Traer adelante" aria-label="Traer adelante" onClick={(e) => (e.stopPropagation(), move(l.id, 1))}>
                  <Icon name="up" size={14} />
                </button>
                <button className="ico" title="Enviar atrás" aria-label="Enviar atrás" onClick={(e) => (e.stopPropagation(), move(l.id, -1))}>
                  <Icon name="down" size={14} />
                </button>
              </span>
              <button className={'ico' + (l.visible ? '' : ' active')} title={l.visible ? 'Ocultar' : 'Mostrar'} aria-label={l.visible ? 'Ocultar' : 'Mostrar'} onClick={(e) => (e.stopPropagation(), s.updateLayer(l.id, { visible: !l.visible }))}>
                <Icon name={l.visible ? 'eye' : 'eyeOff'} size={14} />
              </button>
              <button className={'ico' + (l.locked ? ' active' : '')} title={l.locked ? 'Desbloquear' : 'Bloquear'} aria-label={l.locked ? 'Desbloquear' : 'Bloquear'} onClick={(e) => (e.stopPropagation(), s.updateLayer(l.id, { locked: !l.locked }))}>
                <Icon name={l.locked ? 'lock' : 'unlock'} size={14} />
              </button>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}

function AddBar({ s }: { s: AppState }) {
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

/* ---------- alineación en 9 puntos ---------- */

const POINTS = [
  ['tl', 'Arriba a la izquierda'],
  ['tc', 'Arriba al centro'],
  ['tr', 'Arriba a la derecha'],
  ['ml', 'Centro a la izquierda'],
  ['mc', 'Centro'],
  ['mr', 'Centro a la derecha'],
  ['bl', 'Abajo a la izquierda'],
  ['bc', 'Abajo al centro'],
  ['br', 'Abajo a la derecha'],
] as const

function AlignGrid({ onAlign }: { onAlign: (pt: string) => void }) {
  return (
    <div className="align-grid" role="group" aria-label="Alinear en el lienzo">
      {POINTS.map(([id, label]) => (
        <button key={id} title={label} aria-label={label} onClick={() => onAlign(id)}>
          <i />
        </button>
      ))}
    </div>
  )
}

/** delta para llevar una caja al punto elegido dentro de los márgenes */
function alignDelta(b: { x: number; y: number; w: number; h: number }, pt: string, W: number, H: number, safeTop: number, safeBottom: number) {
  const m = Math.min(W, H) * 0.07
  const top = m + safeTop,
    bottom = H - m - safeBottom
  const tx = pt[1] === 'l' ? m : pt[1] === 'r' ? W - m - b.w : (W - b.w) / 2
  const ty = pt[0] === 't' ? top : pt[0] === 'b' ? bottom - b.h : (top + bottom - b.h) / 2
  return { dx: tx - b.x, dy: ty - b.y }
}

function Props({ s, l, values }: { s: AppState; l: Layer; values: Record<string, string> }) {
  const ui = useUI()
  const up = (patch: Partial<Layer>) => s.updateLayer(l.id, patch)
  const { w: W, h: H } = FORMATS[s.format]
  const safeTop = s.format === 'story' ? 210 : 0
  const safeBottom = s.format === 'story' ? 250 : 0
  const tpl = s.templateOf(l)
  const b = bbox(l, values)

  const dup = () => {
    const c = { ...l, id: newId(), key: undefined, name: l.name + ' (copia)', x: l.x + 30, y: l.y + 30 } as Layer
    s.addLayer(c)
  }

  // tamaño relativo a la plantilla (o al tamaño con el que se agregó)
  const baseW = tpl && 'width' in tpl ? tpl.width : l.type === 'text' ? l.width : l.width
  const scaleNow = l.type === 'text' ? l.fontSize / ((tpl as TextLayer | undefined)?.fontSize ?? l.fontSize) : l.width / (baseW || l.width)
  const setScale = (k: number) => {
    // escala desde la esquina superior izquierda: el elemento no se mueve de lugar
    if (l.type === 'text') {
      const t = (tpl as TextLayer | undefined) ?? l
      up({ fontSize: t.fontSize * k, width: t.width * k } as Partial<TextLayer>)
    } else {
      const ratio = l.height / l.width || 1
      const width = (baseW || l.width) * k
      const height = l.type === 'shape' && l.shape === 'line' ? 0 : width * ratio
      up({ width, height } as Partial<ImageLayer>)
    }
  }
  /** cambia el lugar de un jugador dentro de su fila (el reacomodo hace el resto) */
  const rowMove = (dir: number) => {
    const row = s.layers
      .filter((x): x is ImageLayer => x.type === 'image' && !!x.row && x.row.role === 'photo' && x.visible)
      .sort((a, b) => a.x + a.width / 2 - (b.x + b.width / 2))
    const i = row.findIndex((x) => x.id === l.id)
    const nb = row[i + dir]
    if (!nb || l.type !== 'image') return
    const target = nb.x + nb.width / 2 + dir
    up({ x: target - l.width / 2 })
  }
  const resetGeom = (keys: ('x' | 'y' | 'rotation' | 'size')[]) => {
    const patch: Record<string, number> = {}
    for (const k of keys) {
      if (k === 'rotation') patch.rotation = tpl?.rotation ?? 0
      else if (tpl && k === 'size') {
        patch.width = (tpl as ImageLayer).width
        if ('height' in tpl) patch.height = (tpl as ImageLayer).height
        if (tpl.type === 'text') patch.fontSize = tpl.fontSize
        patch.x = tpl.x
        patch.y = tpl.y
      } else if (tpl && (k === 'x' || k === 'y')) patch[k] = tpl[k]
    }
    up(patch as Partial<Layer>)
  }

  return (
    <section className="props">
      <div className="props-head">
        <div className="props-title">
          <strong>{l.name}</strong>
          <span>{TYPE_LABEL[l.type]}</span>
        </div>
        <button className="ico" title="Duplicar" aria-label="Duplicar" onClick={dup}>
          <Icon name="copy" />
        </button>
        <button className="ico danger" title="Eliminar" aria-label="Eliminar" onClick={() => s.removeLayers([l.id])}>
          <Icon name="trash" />
        </button>
      </div>

      {l.type === 'text' && <TextProps s={s} l={l} up={up} values={values} />}
      {l.type === 'image' && (
        <ImageProps
          l={l}
          up={up}
          onReplace={async () => {
            const ref = await ui.uploadPhoto()
            if (ref) up({ src: ref, bind: undefined } as Partial<ImageLayer>)
          }}
          onCutout={async (src) => {
            const ref = await ui.cutout(src)
            if (ref) up({ src: ref, bind: undefined } as Partial<ImageLayer>)
          }}
        />
      )}
      {l.type === 'shape' && <ShapeProps l={l} up={up} />}

      <div className="prop-group">
        <span className="group-label">Posición y tamaño</span>
        {!l.row && <div className="pos-row">
          <AlignGrid
            onAlign={(pt) => {
              const { dx, dy } = alignDelta(b, pt, W, H, safeTop, safeBottom)
              up({ x: l.x + dx, y: l.y + dy })
            }}
          />
          <div className="pos-sliders">
            <Slider
              label="Tamaño"
              value={scaleNow}
              min={0.2}
              max={3}
              step={0.01}
              fmt={(v) => Math.round(v * 100) + '%'}
              onChange={setScale}
              onReset={tpl ? () => resetGeom(['size']) : undefined}
              isDefault={Math.abs(scaleNow - 1) < 0.005}
            />
          </div>
        </div>}
        {l.row ? (
          <div className="row-order">
            <p className="info-line">
              <Icon name="info" size={13} />
              Es parte de la fila de jugadores: al moverlo u ocultarlo, el resto se reacomoda solo.
            </p>
            <div className="two">
              <button className="btn small" onClick={() => rowMove(-1)}>
                <Icon name="left" size={14} /> Mover a la izquierda
              </button>
              <button className="btn small" onClick={() => rowMove(1)}>
                Mover a la derecha <Icon name="right" size={14} />
              </button>
            </div>
          </div>
        ) : (
        <Slider label="Horizontal (X)" value={l.x} min={-W * 0.5} max={W} step={1} fmt={(v) => Math.round(v) + 'px'} onChange={(v) => up({ x: v })} onReset={tpl ? () => resetGeom(['x']) : undefined} isDefault={!tpl || Math.abs(l.x - tpl.x) < 0.5} />
        )}
        {!l.row && <Slider label="Vertical (Y)" value={l.y} min={-H * 0.5} max={H} step={1} fmt={(v) => Math.round(v) + 'px'} onChange={(v) => up({ y: v })} onReset={tpl ? () => resetGeom(['y']) : undefined} isDefault={!tpl || Math.abs(l.y - tpl.y) < 0.5} />}
        <Slider label="Rotación" value={l.rotation} min={-180} max={180} step={1} fmt={(v) => Math.round(v) + '°'} onChange={(v) => up({ rotation: v })} onReset={() => resetGeom(['rotation'])} isDefault={l.rotation === (tpl?.rotation ?? 0)} />
        <Slider label="Opacidad" value={l.opacity} onChange={(v) => up({ opacity: v })} onReset={() => up({ opacity: tpl?.opacity ?? 1 })} isDefault={l.opacity === (tpl?.opacity ?? 1)} />
      </div>
    </section>
  )
}

function MultiProps({ s, sel, values }: { s: AppState; sel: Layer[]; values: Record<string, string> }) {
  const { w: W, h: H } = FORMATS[s.format]
  const boxes = sel.map((l) => bbox(l, values))
  const x0 = Math.min(...boxes.map((b) => b.x)),
    y0 = Math.min(...boxes.map((b) => b.y))
  const group = { x: x0, y: y0, w: Math.max(...boxes.map((b) => b.x + b.w)) - x0, h: Math.max(...boxes.map((b) => b.y + b.h)) - y0 }
  return (
    <section className="props">
      <div className="props-head">
        <div className="props-title">
          <strong>{sel.length} elementos</strong>
          <span>Arrastrá cualquiera para mover el bloque</span>
        </div>
        <button className="ico danger" title="Eliminar todos" aria-label="Eliminar seleccionados" onClick={() => s.removeLayers(sel.map((l) => l.id))}>
          <Icon name="trash" />
        </button>
      </div>
      <div className="prop-group">
        <span className="group-label">Alinear el bloque</span>
        <AlignGrid
          onAlign={(pt) => {
            const { dx, dy } = alignDelta(group, pt, W, H, s.format === 'story' ? 210 : 0, s.format === 'story' ? 250 : 0)
            s.updateLayers(sel.filter((l) => !l.locked).map((l) => ({ id: l.id, patch: { x: l.x + dx, y: l.y + dy } })))
          }}
        />
      </div>
    </section>
  )
}

function TextProps({ s, l, up, values }: { s: AppState; l: TextLayer; up: (p: Partial<TextLayer>) => void; values: Record<string, string> }) {
  const value = l.bind ? (values[l.bind] ?? l.text) : l.text
  const overridden = l.bind && s.doc.fields['t:' + l.bind] !== undefined
  const setText = (v: string) => {
    if (l.bind) s.setDoc((d) => ({ ...d, fields: { ...d.fields, ['t:' + l.bind]: v } }))
    else up({ text: v })
  }
  return (
    <>
      <Field label="Texto">
        <textarea rows={Math.min(6, value.split('\n').length + 1)} value={value} onChange={(e) => setText(e.target.value)} />
      </Field>
      {overridden && (
        <button
          className="link"
          onClick={() =>
            s.setDoc((d) => {
              const f = { ...d.fields }
              delete f['t:' + l.bind]
              return { ...d, fields: f }
            })
          }
        >
          Volver al texto automático
        </button>
      )}
      <Field label="Fuente">
        <FontPicker value={l.font} onChange={(v) => up({ font: v })} />
      </Field>
      <Field label="Tamaño de letra" hint={l.autoFit ? 'Con "Ajustar al ancho" activo, el texto se achica si no entra en su caja' : undefined}>
        <div className="size-field">
          <button className="tbtn icon" aria-label="Achicar letra" onClick={() => up({ fontSize: Math.max(6, Math.round(l.fontSize) - 2) })}>
            <Icon name="minus" size={14} />
          </button>
          <input type="number" min={6} max={1000} value={Math.round(l.fontSize)} onChange={(e) => e.target.value && up({ fontSize: Math.max(6, Number(e.target.value)) })} aria-label="Tamaño de letra en píxeles" />
          <span className="unit">px</span>
          <button className="tbtn icon" aria-label="Agrandar letra" onClick={() => up({ fontSize: Math.round(l.fontSize) + 2 })}>
            <Icon name="plus" size={14} />
          </button>
        </div>
      </Field>
      <Field label="Alineación del texto">
        <Seg
          value={l.align}
          options={[
            { value: 'left', label: 'Izquierda' },
            { value: 'center', label: 'Centro' },
            { value: 'right', label: 'Derecha' },
          ]}
          onChange={(v) => up({ align: v })}
        />
      </Field>
      <Field label="Color">
        <ColorPick value={l.fill === 'transparent' ? C.white : l.fill} onChange={(v) => up({ fill: v })} />
      </Field>
      <Slider label="Espaciado" value={l.letterSpacing} min={-5} max={40} step={0.5} fmt={(v) => v.toFixed(1)} onChange={(v) => up({ letterSpacing: v })} />
      <Slider label="Interlineado" value={l.lineHeight} min={0.7} max={2} step={0.05} fmt={(v) => v.toFixed(2)} onChange={(v) => up({ lineHeight: v })} />
      <Slider label="Brillo violeta" value={l.glow} onChange={(v) => up({ glow: v })} />
      <div className="checks">
        <label className="switch">
          <input type="checkbox" checked={l.uppercase} onChange={(e) => up({ uppercase: e.target.checked })} />
          <span className="track" />
          <span>Mayúsculas</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={l.italic} onChange={(e) => up({ italic: e.target.checked })} />
          <span className="track" />
          <span>Itálica</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={!!l.autoFit} onChange={(e) => up({ autoFit: e.target.checked })} />
          <span className="track" />
          <span>Ajustar al ancho</span>
        </label>
        <label className="switch">
          <input type="checkbox" checked={!!l.strokeWidth} onChange={(e) => up({ strokeWidth: e.target.checked ? 3 : 0, stroke: C.violet })} />
          <span className="track" />
          <span>Contorno</span>
        </label>
      </div>
    </>
  )
}

function ImageProps({ l, up, onReplace, onCutout }: { l: ImageLayer; up: (p: Partial<ImageLayer>) => void; onReplace: () => void; onCutout: (src: string) => void }) {
  const bindLabel = l.bind ? (BIND_LABEL[l.bind] ?? (l.bind.startsWith('person:') ? 'foto del roster' : '')) : ''
  return (
    <>
      {bindLabel && (
        <p className="info-line">
          <Icon name="info" size={13} />
          {bindLabel}
        </p>
      )}
      <div className="two">
        <button className="btn small" onClick={onReplace}>
          Reemplazar
        </button>
        {!l.bind && l.src.startsWith('idb:') && (
          <button className="btn small" onClick={() => onCutout(l.src)}>
            Quitar fondo
          </button>
        )}
      </div>
      <Field label="Filtro">
        <div className="filter-grid">
          {FILTERS.map((f) => (
            <button key={f.id} className={'chip' + (l.filter === f.id ? ' on' : '')} onClick={() => up({ filter: f.id })}>
              {f.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Ajuste">
        <Seg
          value={l.fit}
          options={[
            { value: 'contain', label: 'Completa' },
            { value: 'cover', label: 'Rellenar caja' },
          ]}
          onChange={(v) => up({ fit: v })}
        />
      </Field>
      <Slider label="Brillo violeta (borde)" value={l.glow} onChange={(v) => up({ glow: v })} />
      <Slider label="Fundido inferior" value={l.fadeBottom} max={0.8} onChange={(v) => up({ fadeBottom: v })} />
      <label className="switch">
        <input type="checkbox" checked={l.flipX} onChange={(e) => up({ flipX: e.target.checked })} />
        <span className="track" />
        <span>Espejar</span>
      </label>
    </>
  )
}

function ShapeProps({ l, up }: { l: ShapeLayer; up: (p: Partial<ShapeLayer>) => void }) {
  return (
    <>
      <Field label="Color de línea">
        <ColorPick value={l.stroke} onChange={(v) => up({ stroke: v })} />
      </Field>
      <Slider label="Grosor" value={l.strokeWidth} min={0} max={20} step={1} fmt={(v) => v + 'px'} onChange={(v) => up({ strokeWidth: v })} />
      {(l.shape === 'rect' || l.shape === 'slash' || l.shape === 'hex') && (
        <Field label="Relleno">
          <Seg
            value={l.fill === 'transparent' ? 'none' : l.fill.startsWith('rgba(0,0,16') ? 'dark' : 'violet'}
            options={[
              { value: 'none', label: 'Sin relleno' },
              { value: 'dark', label: 'Oscuro' },
              { value: 'violet', label: 'Violeta' },
            ]}
            onChange={(v) => up({ fill: v === 'none' ? 'transparent' : v === 'dark' ? 'rgba(0,0,16,0.6)' : 'rgba(122,40,226,0.85)' })}
          />
        </Field>
      )}
      <Slider label="Brillo" value={l.glow} onChange={(v) => up({ glow: v })} />
    </>
  )
}

function FontPicker({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  useFontsVersion()
  const roles = Object.keys(FONT_ROLES) as FontRole[]
  const extra = customFonts()
  const isRole = (f: string): f is FontRole => (roles as string[]).includes(f)
  return (
    <div className="font-pick">
      {[...roles, ...extra].map((f) => (
        <button key={f} className={'fp' + (value === f ? ' on' : '')} onClick={() => onChange(f)} title={isRole(f) ? FONT_ROLES[f].use : 'Fuente agregada'}>
          <span style={{ fontFamily: fontFamily(f), fontWeight: isRole(f) ? Number(FONT_ROLES[f].weight) : 400 }}>Aa</span>
          <em>{isRole(f) ? FONT_ROLES[f].label : f}</em>
        </button>
      ))}
    </div>
  )
}
