import { useState, type ReactNode } from 'react'
import { MASCOTS } from '../brand'
import { CATEGORIES, categoryOf, postType, type SubOption } from '../data/postTypes'
import { allPeople } from '../data/roster'
import { todayISO } from '../data/postTypes'
import { BG_PRESETS, makeRecipe } from '../lib/background'
import type { AppState } from '../state'
import { newDoc } from '../state'
import type { Person, PostDoc, Visual } from '../types'
import { Icon } from './icons'
import { Thumb } from './Thumb'
import { Field, Seg, Slider, useUI } from './ui'
import { DEFAULT_OVERLAP } from '../data/layouts'

export function Step({ n, title, aside, children, defaultOpen = true }: { n?: number; title: string; aside?: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className={'step' + (open ? ' open' : '')}>
      <button className="step-head" onClick={() => setOpen(!open)} aria-expanded={open}>
        {n !== undefined && <span className="step-n">{n}</span>}
        <span className="step-title">{title}</span>
        {aside && <span className="step-aside">{aside}</span>}
        <span className="chev" aria-hidden>
          <Icon name="chevron" size={14} />
        </span>
      </button>
      {open && <div className="step-body">{children}</div>}
    </section>
  )
}

const CATEGORY_GROUPS = [
  { label: 'Partidos', ids: ['matchday', 'victoria', 'derrota', 'empate'] },
  { label: 'Torneos', ids: ['podio', 'participacion', 'competencia'] },
  { label: 'Equipo y comunidad', ids: ['jugadores', 'comunidad'] },
]

const BASE_DESIGNS = [
  { value: 0, label: 'Centrado', icon: <i className="di di-center" /> },
  { value: 2, label: 'Impacto', icon: <i className="di di-impact" /> },
  { value: 3, label: 'Neón', icon: <i className="di di-neon" /> },
]
const PANELS_DESIGN = { value: 4, label: 'Paneles', icon: <i className="di di-panels" /> }
const TYPO_DESIGN = { value: 5, label: 'Tipográfico', icon: <i className="di di-typo" /> }
const MVP_DESIGNS = [
  { value: 0, label: 'Clásico', icon: <i className="di di-side" /> },
  { value: 1, label: 'Tarjeta', icon: <i className="di di-card" /> },
]

export function PostPanel({ s }: { s: AppState }) {
  const { doc, roster } = s
  const ui = useUI()
  const t = postType(doc.type)
  const cat = categoryOf(doc)
  const designs = doc.type === 'mvp' ? MVP_DESIGNS : t.people === 'many' ? [...BASE_DESIGNS, PANELS_DESIGN, TYPO_DESIGN] : [...BASE_DESIGNS, TYPO_DESIGN]

  const warnFeed = (next: PostDoc) => {
    if (s.format === 'feed' && !postType(next.type).feed(next)) {
      s.setFormat('story')
      ui.toast('Recordá que las publicaciones no tan relevantes no van en el Feed de IG.', 'warn')
    }
  }

  const choose = (o: SubOption) => {
    const sameType = o.type === doc.type
    if (sameType && o.fields) {
      // mismo tipo (ej. Victoria → Derrota): sólo cambian los datos y el fondo sugerido
      s.relayout((d) => {
        const nd = { ...d, fields: { ...d.fields, ...o.fields } }
        if (d.variant !== 3) {
          const preset = postType(o.type).bgPreset(nd)
          nd.bg = { ...d.bg, neon: 0, corners: false, ...BG_PRESETS[preset].recipe, preset }
        }
        return nd
      })
      warnFeed({ ...doc, fields: { ...doc.fields, ...o.fields } })
      return
    }
    if (sameType) return
    const nd = newDoc(o.type, doc.roster, doc)
    nd.fields = { ...nd.fields, ...o.fields }
    nd.bg = makeRecipe(postType(o.type).bgPreset(nd))
    if (doc.variant === 3 && o.type !== 'mvp') {
      nd.variant = 3
      nd.bg = makeRecipe('neon')
    }
    s.setDoc(() => nd)
    s.setSelected(null)
    warnFeed(nd)
  }

  const setField = (k: string, v: string, checkFeed = false) => {
    const next = { ...doc, fields: { ...doc.fields, [k]: v } }
    s.setDoc((d) => {
      const nd = { ...d, fields: { ...d.fields, [k]: v } }
      // victoria/derrota o puesto cambian el fondo sugerido (salvo en Neón)
      if ((k === 'place' || k === 'scoreUs' || k === 'scoreThem') && d.variant !== 3) {
        const preset = t.bgPreset(nd)
        if (preset !== d.bg.preset) nd.bg = { ...d.bg, neon: 0, corners: false, ...BG_PRESETS[preset].recipe, preset }
      }
      return nd
    })
    if (checkFeed) warnFeed(next)
  }

  const setDesign = (v: number) =>
    s.relayout((d) => {
      const neonLike = (x: number) => d.type !== 'mvp' && (x === 3 || x === 4 || x === 5)
      const bg = v === 5 ? makeRecipe('sobrio', d.bg.seed) : neonLike(v) ? makeRecipe('neon', d.bg.seed) : neonLike(d.variant) ? makeRecipe(t.bgPreset(d), d.bg.seed) : d.bg
      return { ...d, variant: v, bg: { ...bg, image: d.bg.image, imageDim: d.bg.imageDim, imageFilter: d.bg.imageFilter } }
    })

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
    s.updateRoster(doc.roster, (r) => ({
      ...r,
      players: r.players.map((x) => (x.id === p.id ? { ...x, photo: ref } : x)),
      staff: r.staff.map((x) => (x.id === p.id ? { ...x, photo: ref } : x)),
    }))
  }

  const visualOptions: { value: Visual; label: string }[] = [
    ...(t.people !== 'none' ? [{ value: 'players' as Visual, label: 'Con jugadores' }] : []),
    { value: 'mascots', label: 'Mascotas' },
    { value: 'none', label: t.people !== 'none' ? 'Sin jugadores' : 'Sin fotos' },
  ]
  // tipos sin personas: "players" equivale a mascota
  const visual: Visual = t.people === 'none' && doc.visual === 'players' ? 'mascots' : doc.visual

  return (
    <div className="panel-scroll">
      <div className="roster-top">
        <span className="field-label">Roster</span>
        <Seg
          value={doc.roster}
          options={[
            { value: 'main', label: 'MAIN' },
            { value: 'gc', label: 'GC' },
          ]}
          onChange={(v) => s.relayout((d) => ({ ...d, roster: v, people: [] }))}
        />
      </div>
      <Step n={1} title="Tipo" aside={<span className={'badge' + (t.feed(doc) ? '' : ' muted')}>{t.feed(doc) ? '3 formatos' : 'Historia + X'}</span>}>
        {CATEGORY_GROUPS.map((g) => (
          <div key={g.label} className="type-group">
            <span className="type-group-label">{g.label}</span>
            <div className="chips">
              {CATEGORIES.filter((c) => g.ids.includes(c.id)).map((c) => (
                <button key={c.id} className={'chip lg' + (c.id === cat.id ? ' on' : '')} onClick={() => choose(c.options[0])}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        ))}
        {cat.options.length > 1 && (
          <div className="type-group subtypes">
            <span className="type-group-label">Tipo de {cat.label.toLowerCase()}</span>
            <div className="chips">
              {cat.options.map((o) => (
                <button key={o.label} className={'chip lg' + (o.type === doc.type && (!o.match || o.match(doc)) ? ' on' : '')} onClick={() => choose(o)}>
                  {o.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </Step>

      <Step n={2} title="Contenido">
        {t.people !== 'none' && (
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
              <div className="spacing">
                <Slider
                  label="Separación entre jugadores"
                  value={0.6 - Number(doc.fields.rowOverlap ?? DEFAULT_OVERLAP)}
                  min={0}
                  max={0.6}
                  step={0.01}
                  fmt={(v) => (v < 0.2 ? 'Muy juntos' : v < 0.4 ? 'Juntos' : v < 0.52 ? 'Normal' : 'Separados')}
                  onChange={(v) => s.setRowOverlap(Number((0.6 - v).toFixed(2)))}
                  onReset={() => s.setRowOverlap(DEFAULT_OVERLAP)}
                  isDefault={doc.fields.rowOverlap === undefined || Math.abs(Number(doc.fields.rowOverlap) - DEFAULT_OVERLAP) < 0.005}
                />
              </div>
            )}
          </div>
        )}
        {t.fields.filter((f) => f.key !== 'outcome' && f.key !== 'place').map((f) => (
          <Field key={f.key} label={f.label} hint={f.hint}>
            {f.kind === 'textarea' ? (
              <textarea rows={3} value={doc.fields[f.key] ?? ''} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value)} />
            ) : f.kind === 'select' ? (
              <select value={doc.fields[f.key] ?? f.options![0].value} onChange={(e) => setField(f.key, e.target.value, true)}>
                {f.options!.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </select>
            ) : f.kind === 'toggle' ? (
              <label className="switch">
                <input type="checkbox" checked={doc.fields[f.key] === '1'} onChange={(e) => setField(f.key, e.target.checked ? '1' : '', true)} />
                <span className="track" />
                <span>{doc.fields[f.key] === '1' ? 'Sí' : 'No'}</span>
              </label>
            ) : f.kind === 'image' ? (
              <div className="img-field">
                <Thumb src={doc.fields[f.key]} />
                <button
                  className="btn small"
                  onClick={async () => {
                    const ref = await ui.uploadPhoto({ askPng: false })
                    if (ref) setField(f.key, ref)
                  }}
                >
                  {doc.fields[f.key] ? 'Cambiar' : 'Subir'}
                </button>
                {doc.fields[f.key] && (
                  <button className="btn small ghost" onClick={() => setField(f.key, '')}>
                    Quitar
                  </button>
                )}
              </div>
            ) : (
              <input type={f.kind} value={doc.fields[f.key] || (f.kind === 'date' && f.key !== 'deadline' ? todayISO() : '')} placeholder={f.placeholder} onChange={(e) => setField(f.key, e.target.value, f.kind === 'number')} />
            )}
          </Field>
        ))}
        <button className="btn ghost small wide" onClick={() => s.relayout((d) => d)} title="Vuelve a acomodar los elementos según los textos nuevos (los cambios manuales de posición se pierden)">
          <Icon name="refresh" size={13} /> Reacomodar con los datos nuevos
        </button>
      </Step>

      <Step n={3} title="Estilo">
        <Field label="Diseño">
          <div className="designs">
            {designs.map((d) => (
              <button key={d.value} className={'design' + (doc.variant === d.value ? ' on' : '')} onClick={() => setDesign(d.value)}>
                {d.icon}
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Imagen">
          <Seg value={visual} options={visualOptions} onChange={(v) => s.relayout((d) => ({ ...d, visual: v }))} />
        </Field>
        {visual === 'none' && doc.type !== 'comunicado' && (
          <Field label="Arte principal">
            <Seg
              value={doc.fields.noPhotoArt === 'teclas' ? 'teclas' : 'isotipo'}
              options={[
                { value: 'isotipo', label: 'Isotipo' },
                { value: 'teclas', label: 'Teclas RSWP' },
              ]}
              onChange={(v) =>
                s.relayout((d) => ({
                  ...d,
                  fields: { ...d.fields, noPhotoArt: v },
                  // las teclas van sin líneas de neón (como la placa original)
                  bg: d.variant === 3 ? { ...d.bg, neon: v === 'teclas' ? 0 : 0.85 } : d.bg,
                }))
              }
            />
          </Field>
        )}
        {visual === 'mascots' && (
          <div className="mascot-grid">
            {MASCOTS.map((m) => (
              <button key={m.id} className={'mascot' + (doc.mascot === m.id ? ' on' : '')} title={m.label} onClick={() => s.setDoc((d) => ({ ...d, mascot: m.id }))}>
                <img src={m.src} alt={m.label} />
              </button>
            ))}
          </div>
        )}
      </Step>
    </div>
  )
}
