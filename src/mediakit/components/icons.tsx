import type { SVGProps } from 'react'

/** Íconos de trazo fino (estilo lineal, 24×24) */
const paths: Record<string, string> = {
  eye: 'M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z',
  eyeOff: 'M3 3l18 18 M10.6 5.1A10 10 0 0 1 12 5c6.4 0 10 7 10 7a17 17 0 0 1-3 3.9 M6.6 6.6A17 17 0 0 0 2 12s3.6 7 10 7a9.6 9.6 0 0 0 5.4-1.6 M9.9 9.9a3 3 0 0 0 4.2 4.2',
  lock: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 8 0v4',
  unlock: 'M6 11h12v10H6z M8 11V7a4 4 0 0 1 7.7-1.5',
  up: 'M12 19V5 M6 11l6-6 6 6',
  down: 'M12 5v14 M6 13l6 6 6-6',
  left: 'M19 12H5 M11 6l-6 6 6 6',
  right: 'M5 12h14 M13 6l6 6-6 6',
  copy: 'M9 9h11v11H9z M5 15H4V4h11v1',
  trash: 'M4 7h16 M10 11v6 M14 11v6 M6 7l1 13h10l1-13 M9 7V4h6v3',
  grip: 'M9 6h.01 M15 6h.01 M9 12h.01 M15 12h.01 M9 18h.01 M15 18h.01',
  camera: 'M3 8h4l2-3h6l2 3h4v12H3z M12 10a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
  undo: 'M9 14 4 9l5-5 M4 9h11a5 5 0 0 1 0 10h-3',
  redo: 'M15 14l5-5-5-5 M20 9H9a5 5 0 0 0 0 10h3',
  settings: 'M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z M19 12a7 7 0 0 0-.1-1.2l2-1.6-2-3.4-2.4 1a7 7 0 0 0-2-1.2L14 3h-4l-.4 2.6a7 7 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.6A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.6 2 3.4 2.4-1a7 7 0 0 0 2 1.2L10 21h4l.4-2.6a7 7 0 0 0 2-1.2l2.4 1 2-3.4-2-1.6c.1-.4.1-.8.1-1.2Z',
  grid: 'M4 4h16v16H4z M4 9.3h16 M4 14.6h16 M12 4v16',
  phone: 'M7 2h10v20H7z M11 18h2',
  reset: 'M3 12a9 9 0 1 0 3-6.7 M3 4v5h5',
  refresh: 'M20 12a8 8 0 1 1-2.3-5.7 M20 4v5h-5',
  close: 'M6 6l12 12 M18 6 6 18',
  chevron: 'M6 9l6 6 6-6',
  plus: 'M12 5v14 M5 12h14',
  minus: 'M5 12h14',
  logout: 'M15 4h4v16h-4 M10 8l-4 4 4 4 M6 12h10',
  image: 'M3 5h18v14H3z M3 16l5-5 4 4 3-3 6 6 M15.5 8.5h.01',
  shape: 'M12 3l9 9-9 9-9-9z',
  text: 'M5 6V4h14v2 M12 4v16 M9 20h6',
  dragon: 'M4 18c3 0 4-2 4-5s2-6 6-6c2 0 3 1 4 2l2-1-1 3c0 4-3 7-7 7H8 M14 10h.01',
  download: 'M12 4v11 M7 10l5 5 5-5 M5 20h14',
  check: 'M5 12l5 5 9-10',
  info: 'M12 8h.01 M11 12h1v5h1 M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
  sparkle: 'M12 3v4 M12 17v4 M3 12h4 M17 12h4 M12 9l1 2 2 1-2 1-1 2-1-2-2-1 2-1z',
  layers: 'M12 3 2 8l10 5 10-5z M2 13l10 5 10-5',
  move: 'M12 3v18 M3 12h18 M9 6l3-3 3 3 M9 18l3 3 3-3 M6 9l-3 3 3 3 M18 9l3 3-3 3',
}

export type IconName = keyof typeof paths

export function Icon({ name, size = 16, ...rest }: { name: IconName; size?: number } & SVGProps<SVGSVGElement>) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden {...rest}>
      <path d={paths[name]} />
    </svg>
  )
}
