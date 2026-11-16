import { MASCOTS, mascotFor } from '../brand'
import { forTeam, makeRecipe } from '../lib/background'
import type { FormatId, Layer, PostDoc, RosterId } from '../types'
import { designsFor } from './designs'
import { postType } from './postTypes'

/** propiedades de posición/tamaño: son propias de cada formato. Todo lo demás (estilo) se sincroniza. */
export const GEOMETRY = new Set(['x', 'y', 'width', 'height', 'rotation', 'fontSize'])
export const keyOf = (l: Layer) => l.key ?? l.name

export const LS_DOC = 'rs-doc-v1'

export function newDoc(type: string, roster: RosterId = 'main', prev?: PostDoc): PostDoc {
  const t = postType(type)
  const d: PostDoc = {
    type,
    roster,
    visual: t.defaultVisual,
    // diseño por defecto: el primero de los que tiene cada publicación (data/designs.ts)
    variant: designsFor(type)[0],
    mascot: mascotFor(roster, t.defaultMascot),
    // se conservan datos compartidos útiles (torneo / rival) al cambiar de tipo
    fields: prev ? pickKeys(prev.fields, ['tournament', 'rival', 'rivalLogo', 'date', 'time']) : {},
    people: [],
    bg: makeRecipe('competitivo'),
    layers: {},
  }
  d.bg = forTeam(makeRecipe(t.bgPreset(d)), roster)
  if (d.variant === 3 && type !== 'mvp') d.bg = makeRecipe('neon')
  return d
}

const pickKeys = (o: Record<string, string>, keys: string[]) => Object.fromEntries(keys.filter((k) => o[k]).map((k) => [k, o[k]]))

function load<T>(key: string, fallback: T): T {
  try {
    const s = localStorage.getItem(key)
    return s ? (JSON.parse(s) as T) : fallback
  } catch {
    return fallback
  }
}

/** el borrador guardado en el navegador (o uno nuevo), puesto al día con los cambios que tuvo el mediakit */
export function loadDoc(): PostDoc {
  let d = load(LS_DOC, newDoc('matchday'))
  // compatibilidad con borradores viejos (siluetas de mascotas eliminadas)
  if (d.bg.silhouette !== 'none' && d.bg.silhouette !== 'rs' && d.bg.silhouette !== 'gc') d.bg = { ...d.bg, silhouette: 'rs' }
  if ((d.bg.imageFilter as string) === 'bn') d.bg.imageFilter = 'oscuro'
  // las mascotas viejas (Kael / Nyra) se reemplazaron por los stickers del dragón y la dragona
  if (!MASCOTS.some((m) => m.id === d.mascot)) d = { ...d, mascot: mascotFor(d.roster, postType(d.type).defaultMascot) }
  // la vista Lateral se eliminó: los borradores que la usaban pasan a Centrado
  if (d.type !== 'mvp' && d.variant === 1) d = { ...d, variant: 0, layers: {} }
  // los fondos ya no traen brillos por defecto (se pueden volver a subir en Fondo → Ajustes finos)
  if (!d.fields._noSparkles) d = { ...d, bg: { ...d.bg, sparkles: 0 }, fields: { ...d.fields, _noSparkles: '1' } }
  for (const f of Object.keys(d.layers) as FormatId[])
    d.layers[f] = d.layers[f]?.map((l) =>
      l.type === 'image' && (l.filter as string) === 'bn' ? { ...l, filter: 'oscuro' } : l.type === 'text' && l.font === 'alma' ? { ...l, font: 'manuscrita', italic: false } : l.type === 'text' && l.bind === 'signature' && l.font !== 'condensada' ? { ...l, font: 'condensada', letterSpacing: Math.max(l.letterSpacing, 4) } : l,
    )
  return d
}
