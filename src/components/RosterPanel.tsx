import { useState } from 'react'
import { PLAYER_ROLES, STAFF_ROLES } from '../data/roster'
import type { AppState } from '../state'
import type { Person, RosterId } from '../types'
import { Thumb } from './Thumb'
import { Seg, useUI } from './ui'
import { Icon } from './icons'

export function RosterPanel({ s }: { s: AppState }) {
  const [rid, setRid] = useState<RosterId>(s.doc.roster)
  const r = s.rosters[rid]
  const ui = useUI()

  const upd = (id: string, patch: Partial<Person>) =>
    s.updateRoster(rid, (ro) => ({
      ...ro,
      players: ro.players.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      staff: ro.staff.map((p) => (p.id === id ? { ...p, ...patch } : p)),
    }))

  const row = (p: Person, staff: boolean) => (
    <div key={p.id} className={'roster-row' + (!staff && !p.active ? ' off' : '')}>
      <div className="roster-photo">
        <button
          className="photo-btn"
          title="Subir / cambiar foto"
          onClick={async () => {
            const ref = await ui.uploadPhoto()
            if (ref) upd(p.id, { photo: ref })
          }}
        >
          <Thumb src={p.photo ?? '/brand/player-placeholder.png'} />
          <span>
            <Icon name="camera" size={12} />
          </span>
        </button>
        {p.photo && (
          <button
            className="mini"
            title="Quitar el fondo de la foto actual"
            onClick={async () => {
              const ref = await ui.cutout(p.photo!)
              if (ref) upd(p.id, { photo: ref })
            }}
          >
            Quitar fondo
          </button>
        )}
      </div>
      <div className="roster-fields">
        <div className="two">
          <input value={p.name} placeholder={staff ? 'Nombre (opcional)' : 'Nick'} onChange={(e) => upd(p.id, { name: e.target.value })} aria-label="Nombre" />
          {staff ? (
            <select value={p.role} onChange={(e) => upd(p.id, { role: e.target.value })} aria-label="Rol">
              {STAFF_ROLES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          ) : (
            <select value={p.role} onChange={(e) => upd(p.id, { role: e.target.value })} aria-label="Rol">
              {PLAYER_ROLES.map((x) => (
                <option key={x}>{x}</option>
              ))}
            </select>
          )}
        </div>
        {!staff && (
          <input className="realname" value={p.realName ?? ''} placeholder="Nombre y apellido (se usa en MVP)" onChange={(e) => upd(p.id, { realName: e.target.value })} aria-label="Nombre y apellido" />
        )}
        <div className="two">
          <input value={p.ig} placeholder="@ Instagram" onChange={(e) => upd(p.id, { ig: e.target.value.trim() })} aria-label="Instagram" />
          <input value={p.x} placeholder="@ X" onChange={(e) => upd(p.id, { x: e.target.value.trim() })} aria-label="X" />
        </div>
        {!staff && (
          <label className="switch">
            <input type="checkbox" checked={p.active} onChange={(e) => upd(p.id, { active: e.target.checked })} />
            <span className="track" />
            <span>Titular (aparece por defecto)</span>
          </label>
        )}
      </div>
    </div>
  )

  return (
    <div className="panel-scroll">
      <section>
        <Seg
          value={rid}
          options={[
            { value: 'main', label: 'Roster MAIN' },
            { value: 'gc', label: 'Roster GC' },
          ]}
          onChange={setRid}
        />
        <p className="info-line">
          <Icon name="info" size={13} />
          Las fotos quedan precargadas. Al subir una te preguntamos si ya es PNG; si no, le quitamos el fondo.
        </p>
      </section>
      <section>
        <h4>Jugadores (5 + 1 opcional)</h4>
        {r.players.map((p) => row(p, false))}
        {r.players.length < 6 && (
          <button className="btn ghost wide" onClick={() => s.updateRoster(rid, (ro) => ({ ...ro, players: [...ro.players, { id: `${rid}-p${Date.now()}`, name: 'Jugador', role: 'Suplente', ig: '', x: '', active: false }] }))}>
            <Icon name="plus" size={13} /> Agregar jugador
          </button>
        )}
      </section>
      <section>
        <h4>Staff</h4>
        {r.staff.map((p) => row(p, true))}
        <p className="info-line">
          <Icon name="info" size={13} />
          En los copys cada rol aparece como [COACH], [ASSISTANT]… seguido de su @.
        </p>
      </section>
    </div>
  )
}
