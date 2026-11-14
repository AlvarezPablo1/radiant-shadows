import { cx } from './cx'

/** Entrada escalonada: cada bloque aparece un poco después del anterior cuando `ready` es true */
export const enter = (ready: boolean, delay: string) =>
  cx('transition-[opacity,translate] duration-700 ease-out-soft', delay, ready ? 'translate-y-0 opacity-100' : 'translate-y-3.75 opacity-0')
