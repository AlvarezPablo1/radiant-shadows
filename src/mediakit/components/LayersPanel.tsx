import { Fragment, useState, type ReactNode } from 'react'
import type { Layer } from '../types'
import type { AppState } from '../state'
import { Icon } from './icons'
import { AddBar } from './layers/AddBar'
import { entries, groupOf, moveBlock, moveInGroup } from './layers/groups'
import { LayerProps, MultiProps } from './layers/LayerProps'

export function LayersPanel({ s, values }: { s: AppState; values: Record<string, string> }) {
  const { layers, selection } = s
  const sel = layers.filter((l) => selection.includes(l.id))
  const [drag, setDrag] = useState<string | null>(null)
  // si lo que se arrastra es un elemento de adentro de un grupo
  const [dragNested, setDragNested] = useState(false)
  const [over, setOver] = useState<string | null>(null)

  const [open, setOpen] = useState<string | null>(null)
  const idsOf = (key: string) => (key.startsWith('g:') ? layers.filter((l) => groupOf(l) === key.slice(2)).map((l) => l.id) : [key])
  /** arrastrar una capa (o grupo) sobre otra: queda en su lugar (la lista se muestra invertida: arriba = adelante) */
  const reorder = (key: string, target: string) => s.setLayers((ls) => moveBlock(ls, idsOf(key), 1, idsOf(target)[0]))
  const move = (key: string, dir: number) => s.setLayers((ls) => moveBlock(ls, idsOf(key), dir))
  // un elemento de adentro de un grupo sólo se mueve entre los de su grupo
  const groupKey = (key: string) => {
    const l = layers.find((x) => x.id === key)
    return l ? groupOf(l) : null
  }
  // un elemento de un grupo sólo se suelta sobre otro del mismo grupo; los de afuera, sólo entre ellos
  const canDrop = (to: string, nested: boolean) => !!drag && drag !== to && (nested ? dragNested && groupKey(drag) === groupKey(to) : !dragNested)
  const moveNested = (id: string, dir: number) => s.setLayers((ls) => moveInGroup(ls, id, dir))

  const row = (key: string, members: Layer[], label: ReactNode, sub: string | undefined, kind: string, nested = false) => {
    const all = members.map((l) => l.id)
    const on = all.every((id) => selection.includes(id))
    const visible = members.some((l) => l.visible)
    const locked = members.every((l) => l.locked)
    return (
      <li
        key={key}
        draggable
        onDragStart={(e) => {
          e.stopPropagation()
          setDrag(key)
          setDragNested(nested)
          e.dataTransfer.effectAllowed = 'move'
        }}
        onDragOver={(e) => {
          e.preventDefault()
          if (canDrop(key, nested)) setOver(key)
        }}
        onDragLeave={() => setOver((o) => (o === key ? null : o))}
        onDrop={(e) => {
          e.preventDefault()
          if (drag && canDrop(key, nested)) reorder(drag, key)
          setDrag(null)
          setOver(null)
        }}
        onDragEnd={() => {
          setDrag(null)
          setOver(null)
        }}
        className={(on ? 'on ' : '') + (visible ? '' : 'hidden ') + (over === key ? 'drop ' : '') + (drag === key ? 'dragging ' : '') + (nested ? 'nested' : '')}
        onClick={(e) => (e.shiftKey || e.metaKey || e.ctrlKey ? all.forEach((id) => s.toggleSelected(id)) : s.setSelection(all))}
      >
        <span className="grip" aria-hidden>
          <Icon name="grip" size={14} />
        </span>
        <span className={'kind ' + kind}>
          <Icon name={kind === 'text' ? 'text' : kind === 'image' ? 'image' : kind === 'group' ? 'copy' : 'shape'} size={12} />
        </span>
        <span className="lname">
          {label}
          {sub && <small>{sub}</small>}
        </span>
        <span className="row-actions">
          <button className="ico" title="Traer adelante" aria-label="Traer adelante" onClick={(e) => (e.stopPropagation(), nested ? moveNested(key, 1) : move(key, 1))}>
            <Icon name="up" size={14} />
          </button>
          <button className="ico" title="Enviar atrás" aria-label="Enviar atrás" onClick={(e) => (e.stopPropagation(), nested ? moveNested(key, -1) : move(key, -1))}>
            <Icon name="down" size={14} />
          </button>
        </span>
        <button className={'ico' + (visible ? '' : ' active')} title={visible ? 'Ocultar' : 'Mostrar'} aria-label={visible ? 'Ocultar' : 'Mostrar'} onClick={(e) => (e.stopPropagation(), s.updateLayers(members.map((l) => ({ id: l.id, patch: { visible: !visible } }))))}>
          <Icon name={visible ? 'eye' : 'eyeOff'} size={14} />
        </button>
        <button className={'ico' + (locked ? ' active' : '')} title={locked ? 'Desbloquear' : 'Bloquear'} aria-label={locked ? 'Desbloquear' : 'Bloquear'} onClick={(e) => (e.stopPropagation(), s.updateLayers(members.map((l) => ({ id: l.id, patch: { locked: !locked } }))))}>
          <Icon name={locked ? 'lock' : 'unlock'} size={14} />
        </button>
      </li>
    )
  }
  const textOf = (l: Layer) => (l.type === 'text' ? (l.bind ? values[l.bind] : l.text)?.slice(0, 28) : undefined)

  return (
    <div className="panel-scroll">
      <AddBar s={s} />
      {sel.length === 1 && <LayerProps s={s} l={sel[0]} values={values} />}
      {sel.length > 1 && <MultiProps s={s} sel={sel} values={values} />}
      <section className="layers-sec">
        <h4>
          Capas <span className="h-hint">arrastrá para ordenar · los elementos que van juntos están agrupados</span>
        </h4>
        <ul className="layers">
          {entries(layers).map((en) =>
            en.kind === 'one' ? (
              row(en.layer.id, [en.layer], en.layer.name, textOf(en.layer), en.layer.type)
            ) : (
              <Fragment key={'g:' + en.name}>
                {row(
                  'g:' + en.name,
                  en.layers,
                  <span className="group-name">
                    <button className="group-toggle" aria-expanded={open === en.name} aria-label={open === en.name ? 'Cerrar grupo' : 'Ver los elementos del grupo'} onClick={(e) => (e.stopPropagation(), setOpen((o) => (o === en.name ? null : en.name)))}>
                      <Icon name="chevron" size={12} />
                    </button>
                    {en.name}
                  </span>,
                  `${en.layers.length} elementos`,
                  'group',
                )}
                {open === en.name && [...en.layers].reverse().map((l) => row(l.id, [l], l.name, textOf(l), l.type, true))}
              </Fragment>
            ),
          )}
        </ul>
      </section>
    </div>
  )
}
