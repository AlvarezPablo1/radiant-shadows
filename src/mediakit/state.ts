import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useRosters } from './useRosters'
import { postType } from './data/postTypes'
import { buildLayout } from './data/layouts'
import { FORMAT_IDS, FORMATS, type FormatId, type Layer, type PostDoc } from './types'
import { newId, reflowRow } from './data/layouts'
import { GEOMETRY, keyOf, loadDoc, LS_DOC } from './data/doc'
import { relayoutKeeping } from './data/relayout'

export { GEOMETRY, newDoc } from './data/doc'

export function useAppState() {
  const [doc, setDocRaw] = useState<PostDoc>(loadDoc)
  const { rosters, ready: rostersReady, tweaks, tweakPerson, setCaptain } = useRosters()
  const [format, setFormat] = useState<FormatId>('story')
  const [selection, setSelection] = useState<string[]>([])
  const selected = selection.length ? selection[selection.length - 1] : null
  const setSelected = useCallback((id: string | null) => setSelection(id ? [id] : []), [])
  const toggleSelected = useCallback((id: string) => setSelection((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id])), [])
  const past = useRef<PostDoc[]>([])
  const future = useRef<PostDoc[]>([])
  const lastPush = useRef(0)
  const [, force] = useState(0)

  const roster = rosters[doc.roster]

  // si cambian los titulares, las piezas que muestran "a todos" se rearman con los nuevos
  const activeKey = roster.players
    .filter((p) => p.active)
    .map((p) => p.id + (p.photo ?? '') + (p.captain ? '*' : ''))
    .join(',')
  // se compara recién cuando llegó el roster de /admin: esa primera carga no borra el borrador
  const lastActive = useRef<string | null>(null)
  useEffect(() => {
    if (!rostersReady) return
    if (lastActive.current === null || lastActive.current === activeKey) {
      lastActive.current = activeKey
      return
    }
    lastActive.current = activeKey
    if (postType(doc.type).people === 'many') setDocRaw((d) => ({ ...d, people: [], layers: {} }))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeKey, rostersReady])

  useEffect(() => {
    const id = setTimeout(() => localStorage.setItem(LS_DOC, JSON.stringify(doc)), 300)
    return () => clearTimeout(id)
  }, [doc])

  /** Cambia el documento guardando historial (agrupa cambios seguidos de <600ms, ej. arrastrar un slider). */
  const setDoc = useCallback((fn: (d: PostDoc) => PostDoc) => {
    setDocRaw((d) => {
      const nd = fn(d)
      if (nd === d) return d
      const now = Date.now()
      if (now - lastPush.current > 600) {
        past.current.push(d)
        if (past.current.length > 80) past.current.shift()
      }
      lastPush.current = now
      future.current = []
      return nd
    })
  }, [])

  const undo = useCallback(() => {
    const p = past.current.pop()
    if (!p) return
    setDocRaw((d) => {
      future.current.push(d)
      return p
    })
    lastPush.current = 0
    force((x) => x + 1)
  }, [])
  const redo = useCallback(() => {
    const n = future.current.pop()
    if (!n) return
    setDocRaw((d) => {
      past.current.push(d)
      return n
    })
    lastPush.current = 0
    force((x) => x + 1)
  }, [])

  // capas del formato actual: si no existen se generan con la plantilla
  const layers: Layer[] = useMemo(() => doc.layers[format] ?? buildLayout(doc, roster, format), [doc, roster, format])
  useEffect(() => {
    if (!doc.layers[format]) setDocRaw((d) => (d.layers[format] ? d : { ...d, layers: { ...d.layers, [format]: layers } }))
  }, [doc.layers, format, layers])

  const setLayers = useCallback(
    (fn: (ls: Layer[]) => Layer[]) => setDoc((d) => ({ ...d, layers: { ...d.layers, [format]: fn(d.layers[format] ?? layers) } })),
    [setDoc, format, layers],
  )
  /** asegura que existan las capas de los 3 formatos (para poder sincronizar) */
  const ensureAll = useCallback(
    (d: PostDoc): Record<FormatId, Layer[]> => Object.fromEntries(FORMAT_IDS.map((f) => [f, d.layers[f] ?? buildLayout(d, roster, f)])) as Record<FormatId, Layer[]>,
    [roster],
  )

  /**
   * Actualiza varias capas. La posición/tamaño cambia sólo en el formato actual;
   * los cambios de estilo (color, fuente, filtro, brillo, visibilidad…) se replican
   * en el mismo elemento de los otros formatos.
   */
  const updateLayers = useCallback(
    (patches: { id: string; patch: Partial<Layer> }[]) =>
      setDoc((d) => {
        const all = ensureAll(d)
        const cur = all[format]
        for (const { id, patch } of patches) {
          const src = cur.find((l) => l.id === id)
          if (!src) continue
          const style = Object.fromEntries(Object.entries(patch).filter(([k]) => !GEOMETRY.has(k)))
          const hasStyle = Object.keys(style).length > 0
          for (const f of FORMAT_IDS) {
            all[f] = all[f].map((l) => {
              if (l.id === id) return { ...l, ...patch } as Layer
              if (hasStyle && f !== format && keyOf(l) === keyOf(src)) return { ...l, ...style } as Layer
              return l
            })
          }
          // fila de jugadores: al ocultar/mostrar (en los 3 formatos) o mover en X (en este) se reacomoda sola.
          // Si se le cambió el tamaño, se guarda su escala y queda donde lo dejaste (antes lo movía y le devolvía el tamaño)
          // "Mantener la formación" (opcional): si está apagado, cada jugador se mueve y se agranda libremente
          const snap = d.fields.rowSnap === '1'
          const resized = src.type === 'image' && 'width' in patch && typeof patch.width === 'number'
          if (!snap) {
            /* sin reacomodo automático */
          } else if (src.row && resized) {
            const k = ((src.row.scale ?? 1) * (patch.width as number)) / src.width
            all[format] = all[format].map((l) => (l.id === id ? ({ ...l, row: { ...l.row!, scale: k } } as Layer) : l))
          } else if (src.row && 'visible' in patch) for (const f of FORMAT_IDS) all[f] = reflowRow(all[f])
          else if (src.row && 'x' in patch) all[format] = reflowRow(all[format])
        }
        return { ...d, layers: all }
      }),
    [setDoc, ensureAll, format],
  )
  const updateLayer = useCallback((id: string, patch: Partial<Layer>) => updateLayers([{ id, patch }]), [updateLayers])

  /** agrega un elemento en los 3 formatos (posición proporcional) */
  const addLayer = useCallback(
    (l: Layer) => {
      const key = l.key && l.key !== l.name ? l.key : 'u-' + l.id
      setDoc((d) => {
        const all = ensureAll(d)
        const from = FORMATS[format]
        for (const f of FORMAT_IDS) {
          if (f === format) {
            all[f] = [...all[f], { ...l, key }]
            continue
          }
          const to = FORMATS[f]
          const k = Math.min(to.w / from.w, to.h / from.h)
          const c = { ...l, key, id: newId(), x: (l.x / from.w) * to.w, y: (l.y / from.h) * to.h } as Layer
          if ('width' in c) c.width *= k
          if (c.type === 'image' || c.type === 'shape') c.height *= k
          if (c.type === 'text') c.fontSize *= k
          all[f] = [...all[f], c]
        }
        return { ...d, layers: all }
      })
      setSelection([l.id])
    },
    [setDoc, ensureAll, format],
  )

  /** elimina elementos en los 3 formatos */
  const removeLayers = useCallback(
    (ids: string[]) => {
      setDoc((d) => {
        const all = ensureAll(d)
        const keys = new Set(all[format].filter((l) => ids.includes(l.id)).map(keyOf))
        for (const f of FORMAT_IDS) all[f] = all[f].filter((l) => !keys.has(keyOf(l)))
        return { ...d, layers: all }
      })
      setSelection([])
    },
    [setDoc, ensureAll, format],
  )

  /** separación entre jugadores (en los 3 formatos): actualiza la fila y la reacomoda */
  const setRowOverlap = useCallback(
    (v: number) =>
      setDoc((d) => {
        const all = ensureAll(d)
        for (const f of FORMAT_IDS)
          all[f] = reflowRow(all[f].map((l) => (l.row?.kind === 'stage' ? ({ ...l, row: { ...l.row, overlap: v } } as Layer) : l)))
        return { ...d, fields: { ...d.fields, rowOverlap: String(v) }, layers: all }
      }),
    [setDoc, ensureAll],
  )

  /** posición original de la plantilla para un elemento (para "restablecer") */
  const templateOf = useCallback(
    (l: Layer): Layer | undefined => {
      const t = buildLayout(doc, roster, format)
      return t.find((x) => keyOf(x) === keyOf(l))
    },
    [doc, roster, format],
  )

  /**
   * Cambios de diseño (diseño, quién aparece, orden…): regeneran la composición en todos los formatos.
   * Se mantienen los textos editados, los elementos agregados, lo oculto/bloqueado y lo borrado.
   */
  const relayout = useCallback((fn: (d: PostDoc) => PostDoc) => setDoc((d) => relayoutKeeping(d, fn(d), rosters)), [setDoc, rosters])


  return {
    doc,
    setDoc,
    relayout,
    rosters,
    roster,
    tweaks,
    tweakPerson,
    setCaptain,
    format,
    setFormat,
    selected,
    selection,
    setSelection,
    setSelected,
    toggleSelected,
    layers,
    setLayers,
    updateLayer,
    updateLayers,
    addLayer,
    removeLayers,
    templateOf,
    setRowOverlap,
    undo,
    redo,
    canUndo: past.current.length > 0,
    canRedo: future.current.length > 0,
  }
}

export type AppState = ReturnType<typeof useAppState>
