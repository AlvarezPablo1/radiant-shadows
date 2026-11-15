/**
 * Transición entre secciones: la silueta del dragón cruza la pantalla de derecha a izquierda
 * y una cortina oscura la sigue hasta taparlo todo (después la página nueva se destapa sola).
 *
 * El dragón es una imagen ya pintada (degradé violeta + brillo) y la cortina un degradé de fondo:
 * sin máscaras ni filtros en movimiento, así Safari no dibuja el recuadro del brillo y Chrome
 * sólo tiene que desplazar capas (va igual de suave en los dos).
 */
export function PageTransition({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-95 overflow-hidden">
      {/* cortina con el borde de adelante difuminado */}
      <div className="absolute inset-y-0 left-0 w-[120vw] animate-curtain-in bg-[linear-gradient(to_right,transparent,#0d0524_15vw)] will-change-transform" />

      {/* el dragón (la imagen trae margen para el brillo: por eso es un poco más alta que la silueta) */}
      <img
        src="/brand/mascots/dragon-transicion.webp"
        alt=""
        decoding="sync"
        className="absolute top-1/2 left-full aspect-[906/954] h-[108vh] max-w-none animate-dragon-fly will-change-transform"
      />
    </div>
  )
}
