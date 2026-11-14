/** Silueta violeta para quien todavía no tiene foto */
export function Silhouette({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 260" aria-hidden="true" className={className}>
      <defs>
        <linearGradient id="silhouette-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a28e2" stopOpacity="0.55" />
          <stop offset="1" stopColor="#2e2636" stopOpacity="0.9" />
        </linearGradient>
      </defs>
      <circle cx="100" cy="74" r="44" fill="url(#silhouette-fill)" />
      <path d="M14 260c0-74 38-136 86-136s86 62 86 136z" fill="url(#silhouette-fill)" />
    </svg>
  )
}
