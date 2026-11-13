import Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BackgroundPanel } from './components/BackgroundPanel'
import { BrandPanel } from './components/BrandPanel'
import { CanvasStage, type Guides } from './components/CanvasStage'
import { CopyPanel } from './components/CopyPanel'
import { DownloadModal, type DownloadOpts } from './components/DownloadModal'
import { Icon } from './components/icons'
import { LayersPanel } from './components/LayersPanel'
import { PostPanel } from './components/PostPanel'
import { RosterPanel } from './components/RosterPanel'
import { useUI } from './components/ui'
import { buildLayout } from './data/layouts'
import { computeValues, postType, resolveImageBind } from './data/postTypes'
import { getBackground } from './lib/background'
import { loadImage, preloadCutoutModel, useCutoutModelStatus } from './lib/images'
import { useAppState } from './state'
import { FORMAT_IDS, FORMATS, type FormatId, type ImageLayer, type Layer } from './types'

type LeftTab = 'post' | 'bg' | 'roster' | 'brand'
type RightTab = 'layers' | 'copy'

const DEFAULT_GUIDES: Guides = { margin: 7, rows: 12, cols: 2, center: true, snap: true }

export default function App() {
  const s = useAppState()
  const ui = useUI()
  const { doc, roster, format, layers } = s
  const t = postType(doc.type)
  const [left, setLeft] = useState<LeftTab>('post')
  const [right, setRight] = useState<RightTab>('layers')
  const [safe, setSafe] = useState(false)
  const [guidesOn, setGuidesOn] = useState(false)
  const [guidesMenu, setGuidesMenu] = useState(false)
  const [guides, setGuides] = useState<Guides>(() => {
    try {
      return { ...DEFAULT_GUIDES, ...JSON.parse(localStorage.getItem('rs-guides') || '{}') }
    } catch {
      return DEFAULT_GUIDES
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('rs-guides', JSON.stringify(guides))
    } catch {
      /* sin storage */
    }
  }, [guides])
  const [dl, setDl] = useState(false)
  const [exporting, setExporting] = useState<{ fmt: FormatId; layers: Layer[]; resolve: (url: string) => void; mime: string } | null>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 600, h: 600 })
  const cutout = useCutoutModelStatus()

  // el modelo de recorte se descarga en segundo plano al entrar
  useEffect(() => {
    const id = setTimeout(preloadCutoutModel, 1500)
    return () => clearTimeout(id)
  }, [])

  const values = useMemo(() => computeValues(doc, roster), [doc, roster])
  const imageFor = useCallback((l: ImageLayer) => (l.bind ? resolveImageBind(l.bind, doc, roster) : l.src), [doc, roster])
  const feedOk = t.feed(doc)

  useEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const { w: W, h: H } = FORMATS[format]
  const scale = Math.max(0.05, Math.min((box.w - 40) / W, (box.h - 40) / H))

  const goFormat = (f: FormatId) => {
    if (f === 'feed' && !feedOk) {
      ui.toast('Recordá que las publicaciones no tan relevantes no van en este formato (Feed IG).', 'warn')
      return
    }
    s.setSelected(null)
    s.setFormat(f)
  }

  // atajos de teclado
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return
      const mod = e.metaKey || e.ctrlKey
      if (!mod && e.key.toLowerCase() === 'g') {
        setGuidesOn((g) => !g)
        return
      }
      if (mod && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) s.redo()
        else s.undo()
        return
      }
      if (mod && e.key.toLowerCase() === 'a') {
        e.preventDefault()
        s.setSelection(layers.filter((l) => l.visible && !l.locked).map((l) => l.id))
        return
      }
      const sel = layers.filter((x) => s.selection.includes(x.id))
      if (!sel.length) return
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        s.removeLayers(sel.map((l) => l.id))
      } else if (e.key.startsWith('Arrow')) {
        e.preventDefault()
        const d = e.shiftKey ? 20 : 2
        const dx = e.key === 'ArrowLeft' ? -d : e.key === 'ArrowRight' ? d : 0
        const dy = e.key === 'ArrowUp' ? -d : e.key === 'ArrowDown' ? d : 0
        s.updateLayers(sel.filter((l) => !l.locked).map((l) => ({ id: l.id, patch: { x: l.x + dx, y: l.y + dy } })))
      } else if (e.key === 'Escape') s.setSelected(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [s, layers])

  /** Renderiza un formato en un stage oculto a tamaño real y devuelve el dataURL. */
  const renderFormat = useCallback(
    async (fmt: FormatId, mime: string) => {
      const ls = doc.layers[fmt] ?? buildLayout(doc, roster, fmt)
      const { w, h } = FORMATS[fmt]
      await Promise.all([
        getBackground(doc.bg, w, h),
        ...ls.filter((l): l is ImageLayer => l.type === 'image' && l.visible).map((l) => {
          const src = imageFor(l)
          return src ? loadImage(src).catch(() => undefined) : undefined
        }),
        document.fonts.ready,
      ])
      return new Promise<string>((resolve) => setExporting({ fmt, layers: ls, resolve, mime }))
    },
    [doc, roster, imageFor],
  )

  const download = async (o: DownloadOpts) => {
    setDl(false)
    ui.busy('Generando imágenes…')
    try {
      const mime = o.type === 'jpg' ? 'image/jpeg' : 'image/png'
      for (const f of o.formats) {
        const url = await renderFormat(f, mime)
        const a = document.createElement('a')
        a.href = url
        const date = new Date().toISOString().slice(0, 10)
        a.download = `RS_${doc.type}_${FORMATS[f].label.replace(/\s+/g, '-')}_${date}.${o.type}`
        a.click()
        await new Promise((r) => setTimeout(r, 250))
      }
      ui.toast(o.formats.length > 1 ? `${o.formats.length} imágenes descargadas` : 'Imagen descargada')
    } finally {
      ui.busy(null)
    }
  }

  return (
    <div className="app">
      <aside className="left">
        <div className="side-head">
          <img src={doc.roster === 'gc' ? '/brand/logos/gc-positive.png' : '/brand/logos/rs-positive.png'} alt="" />
          <div>
            <strong>RADIANT SHADOWS</strong>
            <span>Creador de publicaciones</span>
          </div>
        </div>
        <div className="tabs">
          {(
            [
              ['post', 'Publicación'],
              ['bg', 'Fondo'],
              ['roster', 'Roster'],
              ['brand', 'Marca'],
            ] as [LeftTab, string][]
          ).map(([k, label]) => (
            <button key={k} className={left === k ? 'on' : ''} onClick={() => setLeft(k)}>
              {label}
            </button>
          ))}
        </div>
        {left === 'post' && <PostPanel s={s} />}
        {left === 'bg' && <BackgroundPanel s={s} />}
        {left === 'roster' && <RosterPanel s={s} />}
        {left === 'brand' && <BrandPanel />}
      </aside>

      <main className="center">
        <div className="canvas-bar">
          <nav className="formats" aria-label="Formato">
            {FORMAT_IDS.map((f) => {
              const off = f === 'feed' && !feedOk
              return (
                <button key={f} className={(format === f ? 'on ' : '') + (off ? 'off' : '')} onClick={() => goFormat(f)} title={off ? 'Las publicaciones no tan relevantes no van en este formato' : `${FORMATS[f].w}×${FORMATS[f].h}`}>
                  <i className={'ratio r-' + f} />
                  {FORMATS[f].label}
                </button>
              )
            })}
          </nav>
          <div className="canvas-tools">
            <div className="guides-wrap">
              <button className={'tbtn' + (guidesOn ? ' active' : '')} onClick={() => setGuidesOn(!guidesOn)} title="Mostrar márgenes y renglones (G)">
                <Icon name="grid" />
                Guías
              </button>
              <button className={'tbtn icon' + (guidesMenu ? ' active' : '')} aria-label="Configurar guías" aria-expanded={guidesMenu} onClick={() => setGuidesMenu(!guidesMenu)}>
                <Icon name="settings" />
              </button>
              {guidesMenu && (
                <div className="popover" onMouseLeave={() => setGuidesMenu(false)}>
                  <label className="num">
                    <span>Márgenes</span>
                    <input type="number" min={0} max={25} value={guides.margin} onChange={(e) => setGuides({ ...guides, margin: Number(e.target.value) })} />
                    <em>%</em>
                  </label>
                  <label className="num">
                    <span>Renglones</span>
                    <input type="number" min={0} max={60} value={guides.rows} onChange={(e) => setGuides({ ...guides, rows: Number(e.target.value) })} />
                  </label>
                  <label className="num">
                    <span>Columnas</span>
                    <input type="number" min={0} max={12} value={guides.cols} onChange={(e) => setGuides({ ...guides, cols: Number(e.target.value) })} />
                  </label>
                  <label className="switch">
                    <input type="checkbox" checked={guides.center} onChange={(e) => setGuides({ ...guides, center: e.target.checked })} />
                    <span className="track" />
                    <span>Ejes centrales</span>
                  </label>
                  <label className="switch">
                    <input type="checkbox" checked={guides.snap} onChange={(e) => setGuides({ ...guides, snap: e.target.checked })} />
                    <span className="track" />
                    <span>Imantar al mover</span>
                  </label>
                  <button className="link" onClick={() => setGuides(DEFAULT_GUIDES)}>
                    Restablecer guías
                  </button>
                </div>
              )}
            </div>
            {format === 'story' && (
              <button className={'tbtn' + (safe ? ' active' : '')} onClick={() => setSafe(!safe)} title="Zonas que tapa la interfaz de Instagram">
                <Icon name="phone" />
                Zonas seguras
              </button>
            )}
            <button className="tbtn" onClick={() => s.setDoc((d) => ({ ...d, layers: { ...d.layers, [format]: undefined } }))} title="Vuelve a armar este formato desde la plantilla">
              <Icon name="reset" />
              Restablecer
            </button>
          </div>
        </div>
        <div className="canvas-wrap" ref={wrapRef}>
          <div className="canvas-frame" style={{ width: W * scale, height: H * scale }}>
            <CanvasStage
              ref={stageRef}
              width={W}
              height={H}
              scale={scale}
              bg={doc.bg}
              layers={layers}
              values={values}
              imageFor={imageFor}
              selection={s.selection}
              onSelect={(id, additive) => {
                if (id && additive) s.toggleSelected(id)
                else s.setSelected(id)
                if (id) setRight('layers')
              }}
              onSelectMany={(ids) => {
                s.setSelection(ids)
                if (ids.length) setRight('layers')
              }}
              onChange={s.updateLayer}
              onChangeMany={s.updateLayers}
              onTextEdit={() => setRight('layers')}
              safeZone={safe && format === 'story'}
              guides={guides}
              showGuides={guidesOn}
            />
          </div>
        </div>
        <p className="hint">
          Shift + clic o arrastrar un recuadro para seleccionar varios · flechas para ajustar · G guías · Supr borrar
          <span className={'model-status ' + cutout}>
            <Icon name="sparkle" size={12} />
            {cutout === 'ready' ? 'Recorte IA listo' : cutout === 'loading' ? 'Preparando recorte IA…' : cutout === 'error' ? 'Recorte IA no disponible' : ''}
          </span>
        </p>
      </main>

      <aside className="right">
        <div className="side-head actions">
          <a className="tbtn icon" href="/api/logout" title="Cerrar sesión" aria-label="Cerrar sesión">
            <Icon name="logout" />
          </a>
          <button className="tbtn icon" onClick={s.undo} disabled={!s.canUndo} title="Deshacer (⌘Z)" aria-label="Deshacer">
            <Icon name="undo" />
          </button>
          <button className="tbtn icon" onClick={s.redo} disabled={!s.canRedo} title="Rehacer (⇧⌘Z)" aria-label="Rehacer">
            <Icon name="redo" />
          </button>
          <button className="btn primary dl" onClick={() => (s.setSelected(null), setDl(true))}>
            <Icon name="download" />
            Descargar
          </button>
        </div>
        <div className="tabs">
          <button className={right === 'layers' ? 'on' : ''} onClick={() => setRight('layers')}>
            Edición
          </button>
          <button className={right === 'copy' ? 'on' : ''} onClick={() => setRight('copy')}>
            Copy
          </button>
        </div>
        {right === 'layers' ? <LayersPanel s={s} values={values} /> : <CopyPanel s={s} />}
      </aside>

      {dl && <DownloadModal s={s} onClose={() => setDl(false)} onDownload={download} />}

      {exporting &&
        createPortal(
          <div className="export-host" aria-hidden>
            <ExportStage
              key={exporting.fmt + Date.now()}
              {...exporting}
              bg={doc.bg}
              values={values}
              imageFor={imageFor}
              onDone={(url) => {
                exporting.resolve(url)
                setExporting(null)
              }}
            />
          </div>,
          document.body,
        )}
    </div>
  )
}

function ExportStage(p: { fmt: FormatId; layers: Layer[]; mime: string; bg: Parameters<typeof CanvasStage>[0]['bg']; values: Record<string, string>; imageFor: (l: ImageLayer) => string | undefined; onDone: (url: string) => void }) {
  const ref = useRef<Konva.Stage>(null)
  const { w, h } = FORMATS[p.fmt]
  useEffect(() => {
    // los assets ya están cargados y en caché: esperamos a que React/Konva pinten
    const id = setTimeout(() => {
      const st = ref.current!
      st.find('.overlay').forEach((n) => n.hide())
      p.onDone(st.toDataURL({ pixelRatio: 1, mimeType: p.mime, quality: 0.95 }))
    }, 450)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return <CanvasStage ref={ref} width={w} height={h} scale={1} bg={p.bg} layers={p.layers} values={p.values} imageFor={p.imageFor} selection={[]} onSelect={() => {}} onChange={() => {}} interactive={false} />
}
