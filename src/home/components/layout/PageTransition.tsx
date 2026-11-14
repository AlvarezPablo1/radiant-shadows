/**
 * Transición entre secciones: la silueta del dragón cruza la pantalla de derecha a izquierda
 * y una cortina oscura la sigue hasta taparlo todo (después la página nueva se destapa sola).
 */
export function PageTransition({ active }: { active: boolean }) {
  if (!active) return null
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-95 overflow-hidden">
      {/* cortina con el borde de adelante difuminado */}
      <div className="absolute inset-y-0 left-0 w-[120vw] animate-curtain-in bg-[#0d0524] [mask-image:linear-gradient(to_right,transparent,#000_15vw)]" />

      {/* el dragón: silueta usada como máscara, pintada con un degradé violeta y con brillo */}
      <div className="absolute top-1/2 left-full h-[92vh] animate-dragon-fly drop-shadow-[0_0_30px_rgb(142_68_255/0.7)]">
        <div className="aspect-[766/814] h-full bg-[linear-gradient(to_right,#2a0d57,#7a28e2_55%,#3b1470)] mask-[url(/brand/mascots/dragon-silueta.png)] mask-contain mask-center mask-no-repeat" />
      </div>
    </div>
  )
}
