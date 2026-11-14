/* Clases compartidas entre los links del nav y el desplegable */

export const navLink =
  'relative py-1.5 font-display text-[21px] tracking-[0.08em] whitespace-nowrap text-mist transition-colors duration-150 hover:text-white max-lg:text-lg ' +
  // rayita de neón que crece debajo al pasar o en la página actual
  'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:scale-x-0 after:bg-violet-hi after:shadow-[0_0_10px_var(--color-violet-hi)] after:transition-transform after:duration-200 hover:after:scale-x-100'

export const navLinkActive = 'text-white after:scale-x-100'

/** Contactanos: botón propio, empujado al borde derecho y separado de los links */
export const navCta =
  'ml-auto rounded-full bg-cta px-5.5 pt-2.5 pb-2 font-display text-[21px] tracking-[0.08em] whitespace-nowrap text-white shadow-cta transition-[translate,box-shadow,filter] duration-150 hover:-translate-y-px hover:brightness-112 hover:shadow-cta-hover max-lg:text-lg'
