import { allPeople } from '../../data/roster'
import { DEFAULT_OVERLAP } from '../../data/layouts'
import { postType } from '../../data/postTypes'
import type { AppState } from '../../state'
import type { Person } from '../../types'
import { Icon } from '../icons'
import { Thumb } from '../Thumb'
import { Slider } from '../ui'
import { useUI } from '../uiContext'

/** Quién aparece en la placa: elegir, ordenar y cambiar la foto. En filas, también la separación. */
export function PeoplePicker({ s }: { s: AppState }) {
  const { doc, roster } = s
  const ui = useUI()
  const t = postType(doc.type)
  const visual = doc.visual
  const people = allPeople(roster).filter((p) => p.name || roster.players.includes(p))
  const many = t.people === 'many'
  const chosen = many ? (doc.people.length ? doc.people : roster.players.filter((p) => p.active).map((p) => p.id)) : [doc.people[0] ?? roster.players[0]?.id]

  /** cambia el orden (de izquierda a derecha) en que aparecen en la placa */
  const shift = (id: string, dir: number) => {
    const i = chosen.indexOf(id)
    const j = i + dir
    if (i < 0 || j < 0 || j >= chosen.length) return
    const next = [...chosen]
    ;[next[i], next[j]] = [next[j], next[i]]
    s.relayout((d) => ({ ...d, people: next }))
  }

  const changePhoto = async (p: Person) => {
    const ref = await ui.uploadPhoto()
    if (!ref) return
    s.tweakPerson(p.id, { photo: ref })
  }

  if (t.people === 'none') return null
  return (
    <div className="field">
      <span className="field-label">{many ? 'Quiénes aparecen' : 'Quién'}</span>
      <div className="people-grid">
        {people.map((p) => {
          const on = chosen.includes(p.id)
          const isStaff = roster.staff.includes(p)
          return (
            <div key={p.id} className={'pcard' + (on ? ' on' : '')}>
              <button
                className="pcard-photo"
                title="Cambiar foto"
                onClick={() => changePhoto(p)}
                aria-label={`Cambiar foto de ${p.name || p.role}`}
              >
                <Thumb src={p.photo ?? '/brand/player-placeholder.png'} />
                <span className="cam">
                  <Icon name="camera" size={13} />
                </span>
              </button>
              <button
                className="pcard-name"
                aria-pressed={on}
                onClick={() =>
                  many
                    ? s.relayout((d) => ({ ...d, people: on ? chosen.filter((x) => x !== p.id) : [...chosen, p.id] }))
                    : s.setDoc((d) => ({ ...d, people: [p.id] }))
                }
              >
                <strong>{p.name || p.role}</strong>
                <em>{isStaff ? 'Staff' : p.role}</em>
              </button>
              {many && on && chosen.length > 1 && (
                <div className="pcard-order">
                  <button title="Mover a la izquierda en la placa" aria-label={`Mover a ${p.name} a la izquierda`} disabled={chosen.indexOf(p.id) === 0} onClick={() => shift(p.id, -1)}>
                    <Icon name="left" size={12} />
                  </button>
                  <span>{chosen.indexOf(p.id) + 1}</span>
                  <button title="Mover a la derecha en la placa" aria-label={`Mover a ${p.name} a la derecha`} disabled={chosen.indexOf(p.id) === chosen.length - 1} onClick={() => shift(p.id, 1)}>
                    <Icon name="right" size={12} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
      <span className="field-hint">Tocá la foto para cambiarla · las flechas cambian el orden en la placa</span>
      {many && visual === 'players' && s.layers.some((l) => l.row?.kind === 'stage') && (
        <label className="switch">
          <input type="checkbox" checked={doc.fields.rowSnap === '1'} onChange={(e) => s.setDoc((d) => ({ ...d, fields: { ...d.fields, rowSnap: e.target.checked ? '1' : '' } }))} />
          <span className="track" />
          <span>Mantener la formación al mover jugadores</span>
        </label>
      )}
      {many && visual === 'players' && s.layers.some((l) => l.row?.kind === 'stage') && (
        <div className="spacing">
          <Slider
            label="Separación entre jugadores"
            value={0.6 - Number(doc.fields.rowOverlap ?? DEFAULT_OVERLAP)}
            min={0}
            max={0.6}
            step={0.01}
            fmt={(v) => (v < 0.1 ? 'Muy juntos' : v < 0.17 ? 'Juntos' : v < 0.3 ? 'Normal' : 'Separados')}
            onChange={(v) => s.setRowOverlap(Number((0.6 - v).toFixed(2)))}
            onReset={() => s.setRowOverlap(DEFAULT_OVERLAP)}
            isDefault={doc.fields.rowOverlap === undefined || Math.abs(Number(doc.fields.rowOverlap) - DEFAULT_OVERLAP) < 0.005}
          />
        </div>
      )}
    </div>
  )
}
