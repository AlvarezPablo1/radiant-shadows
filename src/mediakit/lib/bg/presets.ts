import type { BgRecipe } from '../../types'

/** Fondos procedurales según el Manual de Recursos Visuales (cap. 09):
 *  fondo oscuro + textura sutil + una energía + líneas de orden + personaje cuando corresponda. */

export const BG_PRESETS: Record<string, { label: string; recipe: Omit<BgRecipe, 'preset' | 'seed' | 'image' | 'imageDim' | 'imageFilter'> }> = {
  competitivo: { label: 'Competitivo', recipe: { tone: 'deep', smoke: 0.5, fire: 0, hex: 0.45, scales: 0, particles: 0.35, sparkles: 0, shadows: 0.3, lines: true, silhouette: 'rs', silhouetteOpacity: 0.07 } },
  victoria: { label: 'Victoria', recipe: { tone: 'violet', smoke: 0.7, fire: 0, hex: 0.3, scales: 0, particles: 0.6, sparkles: 0, shadows: 0.2, lines: true, silhouette: 'rs', silhouetteOpacity: 0.1 } },
  derrota: { label: 'Sombras', recipe: { tone: 'shadow', smoke: 0.35, fire: 0, hex: 0.25, scales: 0, particles: 0.15, sparkles: 0, shadows: 0.85, lines: true, silhouette: 'rs', silhouetteOpacity: 0.05 } },
  institucional: { label: 'Institucional', recipe: { tone: 'deep', smoke: 0.3, fire: 0, hex: 0.22, scales: 0, particles: 0, sparkles: 0, shadows: 0.3, lines: true, silhouette: 'none', silhouetteOpacity: 0.06 } },
  celebracion: { label: 'Celebración', recipe: { tone: 'ember', smoke: 0.7, fire: 0, hex: 0, scales: 0, particles: 0.7, sparkles: 0, shadows: 0.2, lines: false, silhouette: 'gc', silhouetteOpacity: 0.06 } },
  escamas: { label: 'Escamas', recipe: { tone: 'deep', smoke: 0.4, fire: 0, hex: 0, scales: 0.55, particles: 0.25, sparkles: 0, shadows: 0.4, lines: true, silhouette: 'rs', silhouetteOpacity: 0.08 } },
  humo: { label: 'Humo (stream)', recipe: { tone: 'violet', smoke: 1, fire: 0, hex: 0, scales: 0, particles: 0.6, sparkles: 0, shadows: 0.4, lines: false, silhouette: 'rs', silhouetteOpacity: 0.14 } },
  neon: { label: 'Neón', recipe: { tone: 'deep', smoke: 0.35, fire: 0, hex: 0, scales: 0, particles: 0, sparkles: 0, shadows: 0.55, lines: false, neon: 0.85, corners: true, silhouette: 'none', silhouetteOpacity: 0.06 } },
  sobrio: { label: 'Sobrio', recipe: { tone: 'deep', smoke: 0.3, fire: 0, hex: 0, scales: 0, particles: 0, sparkles: 0, shadows: 0.6, lines: false, corners: false, silhouette: 'none', silhouetteOpacity: 0.06 } },
  nocturno: { label: 'Nocturno', recipe: { tone: 'shadow', smoke: 0.45, fire: 0, hex: 0, scales: 0.25, particles: 0.2, sparkles: 0, shadows: 0.5, lines: false, silhouette: 'none', silhouetteOpacity: 0.06 } },
}

/**
 * Textura de fondo de cada equipo: escamas en MAIN y hexágonos en GC (con la misma intensidad que traiga el estilo,
 * o una suave si el estilo no tenía textura).
 */
export function forTeam<R extends { hex: number; scales: number }>(r: R, roster: string): R {
  const amount = Math.max(r.hex, r.scales) || 0.3
  return roster === 'gc' ? { ...r, hex: amount, scales: 0 } : { ...r, hex: 0, scales: amount }
}

export function makeRecipe(preset: string, seed = Math.floor(Math.random() * 1e6)): BgRecipe {
  return { preset, seed, neon: 0, corners: false, ...BG_PRESETS[preset].recipe, imageDim: 0.45, imageFilter: 'none' }
}
