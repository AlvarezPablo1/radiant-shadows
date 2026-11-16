import Konva from 'konva'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BackgroundPanel } from './components/BackgroundPanel'
import { BrandPanel } from './components/BrandPanel'
import { CanvasStage } from './components/CanvasStage'
import { CopyPanel } from './components/CopyPanel'
import { DownloadModal, type DownloadOpts } from './components/DownloadModal'
import { Icon } from './components/icons'
import { LayersPanel } from './components/LayersPanel'
import { PostPanel } from './components/PostPanel'
import { RosterPanel } from './components/RosterPanel'
import { useUI } from './components/uiContext'
import { CanvasBar } from './components/app/CanvasBar'
import { ExportStage } from './components/app/ExportStage'
import { useGuides } from './hooks/useGuides'
import { useShortcuts } from './hooks/useShortcuts'
import { buildLayout } from './data/layouts'
import { computeValues, postType, resolveImageBind } from './data/postTypes'
import { getBackground } from './lib/background'
import { loadImage, preloadCutoutModel, useCutoutModelStatus } from './lib/images'
import { useAppState } from './state'
import { FORMATS, type FormatId, type ImageLayer, type Layer } from './types'

type LeftTab = 'post' | 'bg' | 'roster' | 'brand'
type RightTab = 'layers' | 'copy'

export default function App() {
  const s = useAppState()
  const ui = useUI()
  const { doc, roster, format, layers } = s
  const t = postType(doc.type)
  const [left, setLeft] = useState<LeftTab>('post')
  const [right, setRight] = useState<RightTab>('layers')
  const [safe, setSafe] = useState(false)
  const [guidesOn, setGuidesOn] = useState(false)
  const [guides, setGuides] = useGuides()
  const [dl, setDl] = useState(false)
  const [exporting, setExporting] = useState<{ id: number; fmt: FormatId; layers: Layer[]; resolve: (url: string) => void; mime: string } | null>(null)
  const stageRef = useRef<Konva.Stage>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const [box, setBox] = useState({ w: 600, h: 600 })
  const cutout = useCutoutModelStatus()

  // el modelo de recorte (~80 MB la primera vez) se descarga en segundo plano al entrar, salvo con datos móviles,
  // ahorro de datos o conexión lenta: ahí se baja recién cuando se usa "quitar fondo"
  useEffect(() => {
    const net = (navigator as Navigator & { connection?: { saveData?: boolean; type?: string; effectiveType?: string } }).connection
    if (net && (net.saveData || net.type === 'cellular' || (net.effectiveType && net.effectiveType !== '4g'))) return
    const id = setTimeout(preloadCutoutModel, 1500)
    return () => clearTimeout(id)
  }, [])

  const values = useMemo(() => computeValues(doc, roster), [doc, roster])
  const imageFor = useCallback((l: ImageLayer) => (l.bind ? resolveImageBind(l.bind, doc, roster) : l.src), [doc, roster])
  const feedOk = t.feed(doc)
  const storyOk = !t.story || t.story(doc)

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
    if (f === 'story' && !storyOk) return
    s.setSelected(null)
    s.setFormat(f)
  }

  const toggleGuides = useCallback(() => setGuidesOn((g) => !g), [setGuidesOn])
  useShortcuts(s, layers, toggleGuides)

  /** Renderiza un formato en un stage oculto a tamaño real y devuelve el dataURL. */
  const exportSeq = useRef(0)
  const renderFormat = async (fmt: FormatId, mime: string) => {
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
    // cada exportación monta un stage nuevo (id distinto), aunque sea el mismo formato
    const id = ++exportSeq.current
    return new Promise<string>((resolve) => setExporting({ id, fmt, layers: ls, resolve, mime }))
  }

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
          <a className="tbtn icon logout" href="/api/logout" title="Cerrar sesión" aria-label="Cerrar sesión">
            <Icon name="logout" />
          </a>
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

      {/* clic en cualquier lugar fuera del diseño (área gris, barra de arriba): deselecciona */}
      <main className="center" onMouseDown={(e) => !(e.target as Element).closest('.konvajs-content') && s.setSelected(null)}>
        <CanvasBar s={s} feedOk={feedOk} storyOk={storyOk} goFormat={goFormat} guides={guides} setGuides={setGuides} guidesOn={guidesOn} setGuidesOn={setGuidesOn} safe={safe} setSafe={setSafe} />
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
              key={exporting.id}
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
