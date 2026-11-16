import { useEffect, useState } from 'react'
import type { Guides } from '../components/canvas/guides'

export const DEFAULT_GUIDES: Guides = { margin: 7, rows: 12, cols: 2, center: true, snap: true }

/** la configuración de las guías, recordada en el navegador */
export function useGuides() {
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
  return [guides, setGuides] as const
}
