import { useState } from 'react'
import type { AppState } from '../state'
import { Icon } from './icons'
import { AddBar } from './layers/AddBar'
import { LayerProps, MultiProps } from './layers/LayerProps'

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
      {sel.length === 1 && <LayerProps s={s} l={sel[0]} values={values} />}
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
