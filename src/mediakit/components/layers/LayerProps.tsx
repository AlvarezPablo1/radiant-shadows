import { newId } from '../../data/layouts'
import type { AppState } from '../../state'
import { FORMATS, type ImageLayer, type Layer, type TextLayer } from '../../types'
import { Icon } from '../icons'
import { Advanced, Slider, useUI } from '../ui'
import { AlignGrid, alignDelta, bbox } from './align'
import { ImageProps, ShapeProps, TextProps } from './KindProps'

const TYPE_LABEL = { text: 'Texto', image: 'Imagen', shape: 'Forma' }
const safeOf = (fmt: string) => (fmt === 'story' ? { top: 210, bottom: 250 } : { top: 0, bottom: 0 })

/** Propiedades del elemento elegido: arriba lo de siempre, el resto en "Opciones avanzadas" */
export function LayerProps({ s, l, values }: { s: AppState; l: Layer; values: Record<string, string> }) {
  const ui = useUI()
  const up = (patch: Partial<Layer>) => s.updateLayer(l.id, patch)
  const { w: W, h: H } = FORMATS[s.format]
  const safe = safeOf(s.format)
  const tpl = s.templateOf(l)

  const dup = () => s.addLayer({ ...l, id: newId(), key: undefined, name: l.name + ' (copia)', x: l.x + 30, y: l.y + 30 } as Layer)

  // "Tamaño" (de 0 a 100%): relativo al tamaño original del elemento (el de la plantilla o, si se agregó a mano,
  // el que tenía la primera vez que se lo achicó). En la fila de jugadores es la escala propia de esa foto.
  // con "Mantener la formación" apagado, cada jugador se maneja como una imagen suelta
  const inRow = !!l.row && s.doc.fields.rowSnap === '1'
  const rowScale = l.type === 'image' && inRow ? (l.row!.scale ?? 1) : null
  const ref = tpl && 'width' in tpl ? { width: tpl.width, height: 'height' in tpl ? tpl.height : undefined, fontSize: tpl.type === 'text' ? tpl.fontSize : undefined } : (l.base ?? { width: l.width, height: 'height' in l ? l.height : undefined, fontSize: l.type === 'text' ? l.fontSize : undefined })
  const scaleNow = Math.min(1, rowScale ?? (l.type === 'text' ? l.fontSize / (ref.fontSize || l.fontSize) : l.width / (ref.width || l.width)))
  const setScale = (k: number) => {
    k = Math.max(0.02, Math.min(1, k))
    if (rowScale !== null) return up({ width: (l.width * k) / rowScale } as Partial<ImageLayer>)
    // se guarda la referencia la primera vez (así achicar varias veces no se va acumulando)
    const base = tpl ? undefined : (l.base ?? ref)
    // escala desde la esquina superior izquierda: el elemento no se mueve de lugar
    if (l.type === 'text') return up({ fontSize: (ref.fontSize ?? l.fontSize) * k, width: ref.width * k, ...(base && { base }) } as Partial<TextLayer>)
    const width = ref.width * k
    const height = l.type === 'shape' && l.shape === 'line' ? 0 : (ref.height ?? width * (l.height / l.width || 1)) * k
    up({ width, height, ...(base && { base }) } as Partial<ImageLayer>)
  }
  /** cambia el lugar de un jugador dentro de su fila (el reacomodo hace el resto) */
  const rowMove = (dir: number) => {
    const row = s.layers.filter((x): x is ImageLayer => x.type === 'image' && !!x.row && x.row.role === 'photo' && x.visible).sort((a, b) => a.x + a.width / 2 - (b.x + b.width / 2))
    const nb = row[row.findIndex((x) => x.id === l.id) + dir]
    if (nb && l.type === 'image') up({ x: nb.x + nb.width / 2 + dir - l.width / 2 })
  }
  const resetSize = () => {
    if (rowScale !== null) return setScale(1)
    if (!tpl) return
    const patch: Record<string, number> = { x: tpl.x, y: tpl.y, width: (tpl as ImageLayer).width }
    if ('height' in tpl) patch.height = tpl.height
    if (tpl.type === 'text') patch.fontSize = tpl.fontSize
    up(patch as Partial<Layer>)
  }

  const kind = (part: 'basic' | 'advanced') =>
    l.type === 'text' ? (
      <TextProps s={s} l={l} up={up} values={values} part={part} />
    ) : l.type === 'image' ? (
      <ImageProps
        l={l}
        up={up}
        part={part}
        onReplace={async () => {
          const ref = await ui.uploadPhoto()
          if (ref) up({ src: ref, bind: undefined } as Partial<ImageLayer>)
        }}
        onCutout={async (src) => {
          const ref = await ui.cutout(src)
          if (ref) up({ src: ref, bind: undefined } as Partial<ImageLayer>)
        }}
      />
    ) : (
      <ShapeProps l={l} up={up} part={part} />
    )

  const sizeSlider = (
    <Slider label="Tamaño" value={scaleNow} min={0} max={1} step={0.01} fmt={(v) => Math.round(v * 100) + '%'} onChange={setScale} onReset={tpl || rowScale !== null ? resetSize : undefined} isDefault={Math.abs(scaleNow - 1) < 0.005} />
  )

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

      {kind('basic')}

      <div className="prop-group">
        <span className="group-label">Posición y tamaño</span>
        {inRow ? (
          <div className="row-order">
            {sizeSlider}
            <p className="info-line">
              <Icon name="info" size={13} />
              Es parte de la fila de jugadores: al moverlo u ocultarlo, el resto se reacomoda solo.
            </p>
            <div className="two">
              <button className="btn small" onClick={() => rowMove(-1)}>
                <Icon name="left" size={14} /> A la izquierda
              </button>
              <button className="btn small" onClick={() => rowMove(1)}>
                A la derecha <Icon name="right" size={14} />
              </button>
            </div>
          </div>
        ) : (
          <div className="pos-row">
            <AlignGrid
              onAlign={(pt) => {
                const { dx, dy } = alignDelta(bbox(l, values), pt, W, H, safe.top, safe.bottom)
                up({ x: l.x + dx, y: l.y + dy })
              }}
            />
            <div className="pos-sliders">{sizeSlider}</div>
          </div>
        )}
      </div>

      <Advanced>
        {kind('advanced')}
        {!inRow && <Slider label="Horizontal (X)" value={l.x} min={-W * 0.5} max={W} step={1} fmt={(v) => Math.round(v) + 'px'} onChange={(v) => up({ x: v })} onReset={tpl ? () => up({ x: tpl.x }) : undefined} isDefault={!tpl || Math.abs(l.x - tpl.x) < 0.5} />}
        {!inRow && <Slider label="Vertical (Y)" value={l.y} min={-H * 0.5} max={H} step={1} fmt={(v) => Math.round(v) + 'px'} onChange={(v) => up({ y: v })} onReset={tpl ? () => up({ y: tpl.y }) : undefined} isDefault={!tpl || Math.abs(l.y - tpl.y) < 0.5} />}
        <Slider label="Rotación" value={l.rotation} min={-180} max={180} step={1} fmt={(v) => Math.round(v) + '°'} onChange={(v) => up({ rotation: v })} onReset={() => up({ rotation: tpl?.rotation ?? 0 })} isDefault={l.rotation === (tpl?.rotation ?? 0)} />
        <Slider label="Opacidad" value={l.opacity} onChange={(v) => up({ opacity: v })} onReset={() => up({ opacity: tpl?.opacity ?? 1 })} isDefault={l.opacity === (tpl?.opacity ?? 1)} />
      </Advanced>
    </section>
  )
}

/** Varios elementos elegidos: sólo alinear el bloque y borrar */
export function MultiProps({ s, sel, values }: { s: AppState; sel: Layer[]; values: Record<string, string> }) {
  const { w: W, h: H } = FORMATS[s.format]
  const safe = safeOf(s.format)
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
            const { dx, dy } = alignDelta(group, pt, W, H, safe.top, safe.bottom)
            s.updateLayers(sel.filter((l) => !l.locked).map((l) => ({ id: l.id, patch: { x: l.x + dx, y: l.y + dy } })))
          }}
        />
      </div>
    </section>
  )
}
