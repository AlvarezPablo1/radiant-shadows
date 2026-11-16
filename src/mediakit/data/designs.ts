import type { PostDoc } from '../types'

/** Diseños disponibles (número de variante → nombre) */
export const DESIGN_LABELS: Record<number, string> = { 0: 'Centrado', 3: 'Neón', 6: 'Póster', 7: 'Marco', 8: 'Contorno', 9: 'Transmisión' }
export const MVP_DESIGN_LABELS: Record<number, string> = { 2: 'Afiche', 3: 'Datos', 0: 'Clásico' }

const ALL = [0, 3, 6, 7, 8, 9]

/**
 * Qué diseños se ofrecen para cada publicación (el primero es el que sale por defecto).
 * Los que ya no se usan (Lateral, Impacto, Paneles, Diagonal, Tarjeta, Tipográfico) no aparecen y los borradores viejos pasan al primero.
 */
export function designsFor(type: string, fields: Record<string, string> = {}): number[] {
  const place = Number(fields.place || 1)
  switch (type) {
    case 'mvp':
      return [2, 3, 0]
    case 'matchday':
      return [0, 6, 8, 9]
    case 'despedida':
      return [6, 8]
    case 'cumple':
      return [8, 6]
    case 'bienvenida':
      return [7, 0, 6]
    case 'roster':
      return [7, 6]
    // victoria, derrota y empate: los mismos tres diseños
    case 'resultado':
      return [6, 8, 0]
    case 'torneo':
      return place <= 3 ? [6, 8, 9] : [3, 6]
    default:
      return ALL
  }
}

/** el diseño que corresponde: el elegido si sigue disponible para esa publicación, o el primero */
export const designOf = (d: Pick<PostDoc, 'type' | 'fields' | 'variant'>) => {
  const list = designsFor(d.type, d.fields)
  return list.includes(d.variant) ? d.variant : list[0]
}
