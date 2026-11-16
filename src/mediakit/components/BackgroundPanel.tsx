import { useEffect, useState } from 'react'
import { BG_PRESETS, forTeam, getBackground, makeRecipe } from '../lib/background'
import { FILTERS } from '../lib/filters'
import { idbKeys } from '../lib/idb'
import { normalizeImage, pickFile, storeBlob } from '../lib/images'
import type { AppState } from '../state'
import type { BgRecipe } from '../types'
import { Step } from './PostPanel'
import { Icon } from './icons'
import { Thumb } from './Thumb'
import { Field, Seg, Slider } from './ui'
import { useUI } from './uiContext'

function PresetThumb({ r }: { r: BgRecipe }) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    getBackground(r, 216, 270).then((c) => setUrl(c.toDataURL('image/jpeg', 0.8)))
  }, [r])
  return url ? <img src={url} alt="" /> : <span className="thumb-empty" />
}

const THUMBS = Object.fromEntries(Object.keys(BG_PRESETS).map((id) => [id, makeRecipe(id, 7)]))

export function BackgroundPanel({ s }: { s: AppState }) {
  const bg = s.doc.bg
  const ui = useUI()
  const set = (patch: Partial<BgRecipe>) => s.setDoc((d) => ({ ...d, bg: { ...d.bg, ...patch } }))
  const [library, setLibrary] = useState<string[]>([])
  useEffect(() => {
    idbKeys().then((k) => setLibrary(k.filter((x) => x.startsWith('bg-')).map((x) => 'idb:' + x)))
  }, [bg.image])

  return (
    <div className="panel-scroll">
      <Step title="Estilo de fondo">
        <div className="preset-grid">
          {Object.entries(BG_PRESETS).map(([id, p]) => (
            <button key={id} className={'preset' + (bg.preset === id ? ' on' : '')} onClick={() => set({ ...forTeam(makeRecipe(id, bg.seed), s.doc.roster), image: bg.image, imageDim: bg.imageDim, imageFilter: bg.imageFilter })}>
              <PresetThumb r={THUMBS[id]} />
              <span>{p.label}</span>
            </button>
          ))}
        </div>
        <button className="btn wide" onClick={() => set({ seed: Math.floor(Math.random() * 1e6) })}>
          <Icon name="refresh" size={14} /> Otra variación
        </button>
      </Step>

      <Step title="Foto de fondo" aside={bg.image ? <span className="badge">activa</span> : undefined}>
        <div className="bg-lib">
          <button className={'bg-item' + (!bg.image ? ' on' : '')} onClick={() => set({ image: undefined })}>
            <span>Ninguna</span>
          </button>
          {library.map((src) => (
            <button key={src} className={'bg-item' + (bg.image === src ? ' on' : '')} onClick={() => set({ image: src })}>
              <Thumb src={src} />
            </button>
          ))}
          <button
            className="bg-item add"
            onClick={async () => {
              const f = await pickFile()
              if (!f) return
              const ref = await storeBlob(await normalizeImage(f, 2400), 'bg')
              set({ image: ref })
              ui.toast('Fondo agregado a la biblioteca')
            }}
          >
            <span>+ Subir</span>
          </button>
        </div>
        {bg.image && (
          <>
            <Slider label="Oscurecer" value={bg.imageDim} onChange={(v) => set({ imageDim: v })} />
            <Field label="Filtro">
              <select value={bg.imageFilter} onChange={(e) => set({ imageFilter: e.target.value as BgRecipe['imageFilter'] })}>
                {FILTERS.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                  </option>
                ))}
              </select>
            </Field>
          </>
        )}
      </Step>

      <Step title="Opciones avanzadas" defaultOpen={false}>
        <Field label="Tono">
          <Seg
            value={bg.tone}
            options={[
              { value: 'deep', label: 'Profundo' },
              { value: 'violet', label: 'Violeta' },
              { value: 'shadow', label: 'Sombra' },
              { value: 'ember', label: 'Brasa' },
            ]}
            onChange={(v) => set({ tone: v })}
          />
        </Field>
        <div className="slider-group">
          <span className="group-label">Atmósfera</span>
          <Slider label="Humo" value={bg.smoke} onChange={(v) => set({ smoke: v })} />
          <Slider label="Sombras" value={bg.shadows} onChange={(v) => set({ shadows: v })} />
        </div>
        <div className="slider-group">
          <span className="group-label">Energía</span>
          <Slider label="Fuego abstracto" value={bg.fire} onChange={(v) => set({ fire: v })} />
          <Slider label="Líneas de neón" value={bg.neon ?? 0} onChange={(v) => set({ neon: v })} />
          <Slider label="Partículas" value={bg.particles} onChange={(v) => set({ particles: v })} />
          <Slider label="Brillos" value={bg.sparkles} onChange={(v) => set({ sparkles: v })} />
        </div>
        <div className="slider-group">
          <span className="group-label">Textura</span>
          <Slider label="Hexágonos" value={bg.hex} onChange={(v) => set({ hex: v })} />
          <Slider label="Escamas" value={bg.scales} onChange={(v) => set({ scales: v })} />
        </div>
        <div className="slider-group">
          <span className="group-label">Orden</span>
          <label className="switch">
            <input type="checkbox" checked={bg.lines} onChange={(e) => set({ lines: e.target.checked })} />
            <span className="track" />
            <span>Líneas angulares</span>
          </label>
          <label className="switch">
            <input type="checkbox" checked={!!bg.corners} onChange={(e) => set({ corners: e.target.checked })} />
            <span className="track" />
            <span>Esquinas</span>
          </label>
        </div>
        <Field label="Isotipo de fondo">
          <Seg
            value={bg.silhouette}
            options={[
              { value: 'none', label: 'Ninguno' },
              { value: 'rs', label: 'RS' },
              { value: 'gc', label: 'GC' },
            ]}
            onChange={(v) => set({ silhouette: v })}
          />
        </Field>
        {bg.silhouette !== 'none' && <Slider label="Intensidad del isotipo" value={bg.silhouetteOpacity} max={0.4} onChange={(v) => set({ silhouetteOpacity: v })} />}
        <p className="note">Si el recurso llama más la atención que el mensaje, está demasiado fuerte.</p>
      </Step>
    </div>
  )
}
