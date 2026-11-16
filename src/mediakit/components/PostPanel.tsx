import { useState, type ReactNode } from 'react'
import { swapMascot } from '../brand'
import { CATEGORIES, categoryOf, postType, type SubOption } from '../data/postTypes'
import { BG_PRESETS, forTeam, makeRecipe } from '../lib/background'
import type { AppState } from '../state'
import { newDoc } from '../state'
import type { PostDoc, Visual } from '../types'
import { Icon } from './icons'
import { designOf, designsFor } from '../data/designs'
import { MascotPicker } from './post/MascotPicker'
import { PeoplePicker } from './post/PeoplePicker'
import { PostFields } from './post/PostFields'
import { Advanced, Field, Seg } from './ui'
import { useUI } from './uiContext'

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
  { label: 'Torneos', ids: ['podio', 'participacion'] },
  { label: 'Equipo y comunidad', ids: ['jugadores', 'comunidad'] },
]

const DESIGNS = [
  { value: 0, label: 'Centrado', icon: <i className="di di-center" /> },
  { value: 3, label: 'Neón', icon: <i className="di di-neon" /> },
  { value: 6, label: 'Póster', icon: <i className="di di-poster" /> },
  { value: 7, label: 'Marco', icon: <i className="di di-frame" /> },
  { value: 8, label: 'Contorno', icon: <i className="di di-contour" /> },
  { value: 9, label: 'Transmisión', icon: <i className="di di-broadcast" /> },
]
const MVP_DESIGNS = [
  { value: 2, label: 'Afiche', icon: <i className="di di-poster" /> },
  { value: 3, label: 'Datos', icon: <i className="di di-panels" /> },
  { value: 0, label: 'Clásico', icon: <i className="di di-side" /> },
]

export function PostPanel({ s }: { s: AppState }) {
  const { doc } = s
  const ui = useUI()
  const t = postType(doc.type)
  const cat = categoryOf(doc)
  // sólo los diseños que tiene esta publicación (en ese orden; el primero es el de por defecto)
  const allowed = designsFor(doc.type, doc.fields)
  const designs = allowed.map((v) => (doc.type === 'mvp' ? MVP_DESIGNS : DESIGNS).find((x) => x.value === v)!).filter(Boolean)
  const shownVariant = designOf(doc)

  const warnFeed = (next: PostDoc) => {
    const nt = postType(next.type)
    if (s.format === 'feed' && !nt.feed(next)) {
      s.setFormat('story')
      ui.toast('Recordá que las publicaciones no tan relevantes no van en el Feed de IG.', 'warn')
    } else if (s.format === 'story' && nt.story && !nt.story(next)) {
      // bienvenidas y despedidas no se suben a historias
      s.setFormat('feed')
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
          nd.bg = forTeam({ ...d.bg, neon: 0, corners: false, ...BG_PRESETS[preset].recipe, preset }, d.roster)
        }
        return nd
      })
      warnFeed({ ...doc, fields: { ...doc.fields, ...o.fields } })
      return
    }
    if (sameType) return
    const nd = newDoc(o.type, doc.roster, doc)
    nd.fields = { ...nd.fields, ...o.fields }
    nd.bg = forTeam(makeRecipe(postType(o.type).bgPreset(nd)), nd.roster)
    // se mantiene el diseño elegido al cambiar de tipo si la nueva publicación también lo tiene
    nd.variant = designOf({ ...nd, variant: doc.variant })
    if (nd.variant === 3 && o.type !== 'mvp') nd.bg = makeRecipe('neon')
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
        if (preset !== d.bg.preset) nd.bg = forTeam({ ...d.bg, neon: 0, corners: false, ...BG_PRESETS[preset].recipe, preset }, d.roster)
      }
      return nd
    })
    if (checkFeed) warnFeed(next)
  }

  const setDesign = (v: number) =>
    s.relayout((d) => {
      const neonLike = (x: number) => d.type !== 'mvp' && (x === 3 || x === 4 || x === 5)
      const bg = v === 5 ? makeRecipe('sobrio', d.bg.seed) : neonLike(v) ? makeRecipe('neon', d.bg.seed) : neonLike(d.variant) ? forTeam(makeRecipe(t.bgPreset(d), d.bg.seed), d.roster) : d.bg
      return { ...d, variant: v, bg: { ...bg, image: d.bg.image, imageDim: d.bg.imageDim, imageFilter: d.bg.imageFilter } }
    })

  const storyOk = !t.story || t.story(doc)
  const formatsLabel = t.feed(doc) && storyOk ? '3 formatos' : t.feed(doc) ? 'Feed + X' : 'Historia + X'

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
          onChange={(v) => s.relayout((d) => ({ ...d, roster: v, people: [], mascot: swapMascot(d.mascot, v), bg: forTeam(d.bg, v) }))}
        />
      </div>
      <Step n={1} title="Tipo" aside={<span className={'badge' + (t.feed(doc) ? '' : ' muted')}>{formatsLabel}</span>}>
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
        <PeoplePicker s={s} />
        <PostFields s={s} setField={setField} />
        <Advanced>
          <button className="btn ghost small wide" onClick={() => s.relayout((d) => d)} title="Vuelve a acomodar los elementos según los textos nuevos (los cambios manuales de posición se pierden)">
            <Icon name="refresh" size={13} /> Reacomodar con los datos nuevos
          </button>
        </Advanced>
      </Step>

      <Step n={3} title="Estilo">
        <Field label="Diseño">
          <div className="designs">
            {designs.map((d) => (
              <button key={d.value} className={'design' + (shownVariant === d.value ? ' on' : '')} onClick={() => setDesign(d.value)}>
                {d.icon}
                <span>{d.label}</span>
              </button>
            ))}
          </div>
        </Field>
        <Field label="Imagen">
          <Seg value={visual} options={visualOptions} onChange={(v) => s.relayout((d) => ({ ...d, visual: v }))} />
        </Field>
        {visual === 'none' && doc.type !== 'comunicado' && doc.type !== 'stream' && (
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
        {visual === 'mascots' && <MascotPicker s={s} />}
      </Step>
    </div>
  )
}
