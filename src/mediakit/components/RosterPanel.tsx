import { useState } from 'react'
import type { AppState } from '../state'
import type { Person, RosterId } from '../types'
import { Icon } from './icons'
import { Thumb } from './Thumb'
import { Seg, useUI } from './ui'

/**
 * Roster: los jugadores y el cuerpo técnico vienen de /admin (una sola fuente para la web y el mediakit).
 * Acá sólo se elige quién es titular y, si hace falta, una foto distinta para las placas (queda en este navegador).
 */
export function RosterPanel({ s }: { s: AppState }) {
  const [rid, setRid] = useState<RosterId>(s.doc.roster)
  const r = s.rosters[rid]
  const ui = useUI()
  const generic = r.players.every((p) => /^Jugador \d$/.test(p.name))

  const row = (p: Person, staff: boolean) => {
    const ownPhoto = !!s.tweaks[p.id]?.photo
    return (
      <div key={p.id} className={'roster-row' + (!staff && !p.active ? ' off' : '')}>
        <div className="roster-photo">
          <button
            className="photo-btn"
            title="Usar otra foto en las placas"
            onClick={async () => {
              const ref = await ui.uploadPhoto()
              if (ref) s.tweakPerson(p.id, { photo: ref })
            }}
          >
            <Thumb src={p.photo ?? '/brand/player-placeholder.png'} />
            <span>
              <Icon name="camera" size={12} />
            </span>
          </button>
          {ownPhoto && (
            <button className="mini" title="Volver a la foto cargada en /admin" onClick={() => s.tweakPerson(p.id, { photo: undefined })}>
              Foto de /admin
            </button>
          )}
        </div>
        <div className="roster-fields">
          <div className="roster-name">
            <strong>{p.name || p.role}</strong>
            <span>{[p.role, p.realName, p.ig, p.x].filter(Boolean).join(' · ')}</span>
          </div>
          {!staff && (
            <label className="switch">
              <input type="checkbox" checked={p.active} onChange={(e) => s.tweakPerson(p.id, { active: e.target.checked })} />
              <span className="track" />
              <span>Titular (aparece por defecto)</span>
            </label>
          )}
        </div>
      </div>
    )
  }

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
          <span>
            Los jugadores y el staff se cargan en{' '}
            <a href="/admin" target="_blank" rel="noopener noreferrer">
              /admin
            </a>{' '}
            (nombres, fotos, rol, redes). Acá elegís los titulares y, si querés, otra foto para las placas.
          </span>
        </p>
        {generic && (
          <p className="info-line">
            <Icon name="info" size={13} />
            Este equipo todavía no tiene jugadores cargados: las placas usan lugares genéricos.
          </p>
        )}
      </section>
      <section>
        <h4>Jugadores</h4>
        {r.players.map((p) => row(p, false))}
      </section>
      {r.staff.length > 0 && (
        <section>
          <h4>Cuerpo técnico</h4>
          {r.staff.map((p) => row(p, true))}
          <p className="info-line">
            <Icon name="info" size={13} />
            En los copys cada rol aparece como [COACH], [ASSISTANT]… seguido de su @.
          </p>
        </section>
      )}
    </div>
  )
}
