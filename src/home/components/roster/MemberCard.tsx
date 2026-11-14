import type { Member } from '../../../shared/content/rosters'
import { cx } from '../../../shared/lib/cx'
import { MemberInfo } from './MemberInfo'
import { Silhouette } from './Silhouette'

interface Props {
  member: Member
  showRank: boolean
  /** este integrante está seleccionado (mouse encima, foco o toque) */
  active: boolean
  /** hay otro seleccionado: este se apaga un poco */
  dimmed: boolean
  /** celular: no es el del centro del carrusel; queda desenfocado y más chico */
  blurred?: boolean
  onSelect: () => void
  onLeave: () => void
}

/** Foto de un integrante; al seleccionarlo se destaca y muestra su ficha */
export function MemberCard({ member, showRank, active, dimmed, blurred, onSelect, onLeave }: Props) {
  return (
    // contenedor enfocable (no <button>) porque la ficha tiene un link adentro
    <div
      role="group"
      tabIndex={0}
      aria-label={member.name}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onSelect()}
      onPointerLeave={(e) => e.pointerType === 'mouse' && onLeave()}
      onFocus={onSelect}
      // pasar del integrante a su link no cuenta como salir
      onBlur={(e) => !e.currentTarget.contains(e.relatedTarget) && onLeave()}
      onClick={onSelect}
      className={cx(
        'relative h-full w-full cursor-pointer outline-none',
        'transition-[opacity,filter,scale] duration-300 ease-out-soft',
        active ? 'z-10 scale-105 max-md:scale-100' : 'scale-100',
        dimmed && 'opacity-35 grayscale-70',
        blurred && 'scale-[0.86] opacity-45 blur-[3px] grayscale-40',
      )}
    >
      {/* al seleccionar: dos líneas verticales de neón a los costados, sin cerrar arriba ni abajo */}
      {['left-1', 'right-1'].map((side) => (
        <span
          key={side}
          aria-hidden="true"
          className={cx(
            'absolute inset-y-0 z-1 w-0.5 bg-[linear-gradient(to_bottom,transparent,var(--color-violet-hi)_25%,var(--color-violet-hi)_70%,transparent)] shadow-[0_0_14px_var(--color-violet-hi)] transition-opacity duration-300',
            side,
            active ? 'opacity-100' : 'opacity-0',
          )}
        />
      ))}
      {/* brillo violeta detrás del seleccionado */}
      <span
        aria-hidden="true"
        className={cx(
          'absolute inset-x-1 inset-y-0 bg-[radial-gradient(ellipse_at_50%_60%,rgb(142_68_255/0.35),transparent_70%)] transition-opacity duration-300',
          active ? 'opacity-100' : 'opacity-0',
        )}
      />
      {/* la foto queda dentro de su columna */}
      <span className="absolute inset-x-1 inset-y-0 overflow-hidden">
        {member.photo ? (
          // todas al mismo alto, centradas en su casilla; se desvanecen hacia abajo
          <img
            src={member.photo}
            alt=""
            draggable={false}
            style={{ height: `${(member.photoScale ?? 1) * 100}%` }}
            className="absolute top-0 left-1/2 w-auto max-w-none -translate-x-1/2 object-contain object-top select-none mask-b-from-70% mask-b-to-100%"
          />
        ) : (
          <Silhouette className="absolute top-[6%] left-1/2 aspect-[200/260] h-[80%] w-auto -translate-x-1/2 mask-b-from-70% mask-b-to-100%" />
        )}
      </span>

      <MemberInfo member={member} showRank={showRank} open={active} />
    </div>
  )
}
