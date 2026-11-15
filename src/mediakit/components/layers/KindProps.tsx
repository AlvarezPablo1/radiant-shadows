import { C, FONT_ROLES, type FontRole } from '../../brand'
import { FILTERS } from '../../lib/filters'
import { customFonts, fontFamily, useFontsVersion } from '../../lib/fonts'
import type { AppState } from '../../state'
import type { ImageLayer, ShapeLayer, TextLayer } from '../../types'
import { Icon } from '../icons'
import { ColorPick, Field, Seg, Slider } from '../ui'

/** 'basic' = lo que se usa siempre; 'advanced' = lo que va dentro de "Opciones avanzadas" */
type Part = 'basic' | 'advanced'

const BIND_LABEL: Record<string, string> = { 'logo:team': 'logo automático (cambia con roster y resultado)', 'logo:rival': 'logo del rival', mascot: 'mascota elegida' }

function Switch({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="switch">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="track" />
      <span>{label}</span>
    </label>
  )
}

export function TextProps({ s, l, up, values, part }: { s: AppState; l: TextLayer; up: (p: Partial<TextLayer>) => void; values: Record<string, string>; part: Part }) {
  if (part === 'advanced')
    return (
      <>
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
        <Slider label="Espaciado" value={l.letterSpacing} min={-5} max={40} step={0.5} fmt={(v) => v.toFixed(1)} onChange={(v) => up({ letterSpacing: v })} />
        <Slider label="Interlineado" value={l.lineHeight} min={0.7} max={2} step={0.05} fmt={(v) => v.toFixed(2)} onChange={(v) => up({ lineHeight: v })} />
        <Slider label="Brillo violeta" value={l.glow} onChange={(v) => up({ glow: v })} />
        <div className="checks">
          <Switch label="Mayúsculas" checked={l.uppercase} onChange={(v) => up({ uppercase: v })} />
          <Switch label="Itálica" checked={l.italic} onChange={(v) => up({ italic: v })} />
          <Switch label="Ajustar al ancho" checked={!!l.autoFit} onChange={(v) => up({ autoFit: v })} />
          <Switch label="Contorno" checked={!!l.strokeWidth} onChange={(v) => up({ strokeWidth: v ? 3 : 0, stroke: C.violet })} />
        </div>
      </>
    )

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
      <Field label="Tamaño de letra" hint={l.autoFit ? 'Si el texto no entra en su caja, se achica solo' : undefined}>
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
      <Field label="Color">
        <ColorPick value={l.fill === 'transparent' ? C.white : l.fill} onChange={(v) => up({ fill: v })} />
      </Field>
    </>
  )
}

export function ImageProps({ l, up, onReplace, onCutout, part }: { l: ImageLayer; up: (p: Partial<ImageLayer>) => void; onReplace: () => void; onCutout: (src: string) => void; part: Part }) {
  if (part === 'advanced')
    return (
      <>
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
      </>
    )

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
      <Switch label="Espejar" checked={l.flipX} onChange={(v) => up({ flipX: v })} />
    </>
  )
}

export function ShapeProps({ l, up, part }: { l: ShapeLayer; up: (p: Partial<ShapeLayer>) => void; part: Part }) {
  if (part === 'basic')
    return (
      <Field label="Color">
        <ColorPick value={l.stroke} onChange={(v) => up({ stroke: v })} />
      </Field>
    )
  return (
    <>
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
            onChange={(v) => up({ fill: v === 'none' ? 'transparent' : v === 'dark' ? 'rgba(0,0,16,0.6)' : 'rgba(116,21,193,0.85)' })}
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
