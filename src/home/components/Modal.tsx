import { useEffect, useRef, type ReactNode } from 'react'
import { cx } from '../lib/cx'
import { useScrollLock } from '../lib/hooks'

interface Props {
  open: boolean
  onClose: () => void
  /** id del título, para lectores de pantalla */
  labelledBy: string
  children: ReactNode
  className?: string
}

/** Modal base: fondo oscuro, tarjeta con la × y cierre con Escape o click afuera */
export function Modal({ open, onClose, labelledBy, children, className }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)

  useScrollLock(open)
  useEffect(() => {
    const d = dialog.current!
    if (open && !d.open) d.showModal()
    else if (!open && d.open) d.close()
  }, [open])

  return (
    <dialog
      ref={dialog}
      aria-labelledby={labelledBy}
      onClose={onClose}
      // click afuera de la tarjeta cierra
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="m-auto max-h-[calc(100dvh-32px)] w-[min(520px,calc(100%-32px))] overflow-visible bg-transparent p-0 text-fg backdrop:bg-night/72 backdrop:backdrop-blur-[6px] open:animate-pop-in open:backdrop:animate-fade-in"
    >
      <div
        className={cx(
          'relative flex max-h-[calc(100dvh-32px)] flex-col overflow-y-auto rounded-[18px] border border-violet-hi/35 bg-card px-8 pt-8.5 pb-7.5 shadow-card max-sm:px-5 max-sm:pt-7 max-sm:pb-5.5',
          className,
        )}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute top-3.5 right-3.5 z-1 size-9.5 cursor-pointer rounded-full bg-white/6 text-2xl leading-none text-fg transition-colors duration-150 hover:bg-violet-hi/30"
        >
          ×
        </button>
        {children}
      </div>
    </dialog>
  )
}
