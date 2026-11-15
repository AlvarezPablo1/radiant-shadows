import { MASCOTS, hasShirt, mascotOf, withShirt } from '../../brand'
import type { AppState } from '../../state'
import { Seg } from '../ui'

/** Elegir la mascota: sin o con la camiseta del equipo, y la expresión (primero el personaje del equipo elegido) */
export function MascotPicker({ s }: { s: AppState }) {
  const { doc } = s
  const shirt = hasShirt(doc.mascot)
  const mine = mascotOf(doc.roster)
  const list = MASCOTS.filter((m) => m.shirt === shirt).sort((a, b) => Number(b.who === mine) - Number(a.who === mine))
  return (
    <>
      <Seg
        value={shirt ? 'con' : 'sin'}
        options={[
          { value: 'sin', label: 'Sin camiseta' },
          { value: 'con', label: 'Con camiseta' },
        ]}
        onChange={(v) => s.setDoc((d) => ({ ...d, mascot: withShirt(d.mascot, d.roster, v === 'con') }))}
      />
      <div className="mascot-grid">
        {list.map((m) => (
          <button key={m.id} className={'mascot' + (doc.mascot === m.id ? ' on' : '')} title={m.label} onClick={() => s.setDoc((d) => ({ ...d, mascot: m.id }))}>
            <img src={m.src} alt={m.label} />
          </button>
        ))}
      </div>
    </>
  )
}
