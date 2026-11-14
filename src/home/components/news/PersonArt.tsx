import { cx } from '../../../shared/lib/cx'

/**
 * Placa de persona (como la de las incorporaciones): fondo violeta oscuro con el dragón de la marca,
 * trazos diagonales y trama de puntos; el nombre gigante, inclinado, a la izquierda y la foto a la derecha.
 */
export function PersonArt({ name, photo, className }: { name: string; photo: string; className?: string }) {
  // el nombre ocupa la mitad izquierda: cuanto más largo, más chico
  const size = Math.min(14, 66 / Math.max(4, name.length))
  return (
    <div className={cx('@container relative overflow-hidden bg-[#0a0216]', className)}>
      {/* luz violeta de fondo */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_72%_45%,rgb(142_68_255/0.55),transparent_60%),radial-gradient(ellipse_at_15%_20%,rgb(90_20_170/0.45),transparent_55%)]" />
      {/* dragón de la marca, grande y apagado */}
      <img src="/brand/logos/rs-negative.webp" alt="" className="absolute top-1/2 left-[2%] w-[58%] -translate-y-1/2 opacity-[0.07]" />
      {/* trazos diagonales */}
      <div className="absolute inset-0 bg-[repeating-linear-gradient(118deg,transparent_0_46px,rgb(142_68_255/0.28)_46px_52px,transparent_52px_120px,rgb(186_120_255/0.18)_120px_123px,transparent_123px_190px)] mask-l-from-40% mask-l-to-90%" />
      {/* trama de puntos */}
      <div className="absolute inset-0 bg-[radial-gradient(rgb(186_120_255/0.35)_1.2px,transparent_1.6px)] bg-size-[7px_7px] opacity-60 [mask-image:linear-gradient(200deg,black,transparent_55%)]" />

      <img
        src={photo}
        alt=""
        className="absolute top-[6%] right-[4%] h-[125%] w-auto max-w-[62%] object-contain object-top drop-shadow-[0_0_24px_rgb(142_68_255/0.7)]"
      />

      <p
        aria-hidden="true"
        style={{ fontSize: `${size}cqw` }}
        className="absolute top-1/2 left-[7%] max-w-[52%] origin-left -translate-y-1/2 -skew-x-6 font-brand leading-none font-black tracking-[-0.01em] text-white uppercase [font-stretch:125%] [text-shadow:0_6px_24px_rgb(0_0_0/0.55)]"
      >
        {name}
      </p>
    </div>
  )
}
