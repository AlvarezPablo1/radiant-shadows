/* ---------- alineación en 9 puntos ---------- */

const POINTS = [
  ['tl', 'Arriba a la izquierda'],
  ['tc', 'Arriba al centro'],
  ['tr', 'Arriba a la derecha'],
  ['ml', 'Centro a la izquierda'],
  ['mc', 'Centro'],
  ['mr', 'Centro a la derecha'],
  ['bl', 'Abajo a la izquierda'],
  ['bc', 'Abajo al centro'],
  ['br', 'Abajo a la derecha'],
] as const

export function AlignGrid({ onAlign }: { onAlign: (pt: string) => void }) {
  return (
    <div className="align-grid" role="group" aria-label="Alinear en el lienzo">
      {POINTS.map(([id, label]) => (
        <button key={id} title={label} aria-label={label} onClick={() => onAlign(id)}>
          <i />
        </button>
      ))}
    </div>
  )
}
