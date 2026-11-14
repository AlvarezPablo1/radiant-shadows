/** Clases compartidas del panel (mismo estilo que el formulario de contacto de la web) */
// texto de 16 px: con menos, Safari en iPhone hace zoom al tocar el campo y la pantalla queda corrida
export const inputCls =
  'w-full rounded-[10px] border border-violet-hi/28 bg-night/60 px-3.5 py-2.5 text-base text-fg outline-none transition-[border-color,box-shadow] duration-150 focus:border-violet-hi focus:shadow-[0_0_0_3px_rgb(142_68_255/0.25)]'

export const smallBtn =
  'inline-flex cursor-pointer items-center justify-center gap-1.5 rounded-full border border-violet-hi/35 bg-night/50 px-3.5 py-1.5 text-[13px] font-semibold text-mist transition-colors duration-150 hover:border-violet-hi hover:bg-violet/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-40'

export const iconBtn =
  'grid size-9 cursor-pointer place-items-center rounded-full text-mist transition-colors duration-150 hover:bg-violet/25 hover:text-white disabled:cursor-not-allowed disabled:opacity-30'
