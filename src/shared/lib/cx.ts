/** Une clases y descarta las vacías: cx('a', on && 'b') */
export const cx = (...classes: (string | false | null | undefined)[]) => classes.filter(Boolean).join(' ')
