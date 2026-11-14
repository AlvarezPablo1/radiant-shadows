import type { Pillar } from '../../data/about'

/** Íconos de línea para cada pilar: copa, personas y llama */
const PATHS: Record<Pillar['id'], string> = {
  compete: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4a3 3 0 0 0 3 4M17 6h3a3 3 0 0 1-3 4',
  people:
    'M16 20v-1.5a3.5 3.5 0 0 0-3.5-3.5h-5A3.5 3.5 0 0 0 4 18.5V20M10 11.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7M20 20v-1.5a3.5 3.5 0 0 0-2.6-3.4M15.5 4.6a3.5 3.5 0 0 1 0 6.8',
  grow: 'M12 21a6 6 0 0 0 6-6c0-3.5-2.5-5.5-3.5-8-1 2-2 3-3.5 3.5C11 8 10 5.5 10 3c-3 2.5-4 6.5-4 9a6 6 0 0 0 6 9zM12 21a2.5 2.5 0 0 0 2.5-2.5c0-1.6-1.2-2.4-2.5-4-1.3 1.6-2.5 2.4-2.5 4A2.5 2.5 0 0 0 12 21z',
}

export function PillarIcon({ id, className }: { id: Pillar['id']; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[id]} />
    </svg>
  )
}
