import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { cx } from '../lib/cx'

export interface SelectOption {
  value: string
  label: string
}

interface Props {
  id?: string
  /** nombre para enviar en un <form> (FormData) */
  name?: string
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder: string
  required?: boolean
  /** marcar en rojo si está vacío (después del primer intento de envío) */
  invalid?: boolean
  className?: string
}

/**
 * Desplegable con el diseño del sitio (los nativos muestran la lista con el estilo del sistema).
 * Se maneja con mouse o teclado y lleva un <select> oculto para que el formulario lo valide y lo envíe.
 */
export function Select({ id, name, value, onChange, options, placeholder, required, invalid, className }: Props) {
  const listId = useId()
  const button = useRef<HTMLButtonElement>(null)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const [pos, setPos] = useState<{ left: number; width: number; top?: number; bottom?: number }>()
  const selected = options.find((o) => o.value === value)

  // la lista va fija sobre la pantalla (así no la corta un modal con scroll); abre hacia arriba si no entra abajo
  function openList() {
    const r = button.current!.getBoundingClientRect()
    const below = innerHeight - r.bottom
    setPos(below < 280 && r.top > below ? { left: r.left, width: r.width, bottom: innerHeight - r.top + 6 } : { left: r.left, width: r.width, top: r.bottom + 6 })
    setActive(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const close = () => setOpen(false)
  const choose = (v: string) => {
    onChange(v)
    close()
    button.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    // se cierra al tocar afuera o al scrollear la página (pero no al scrollear la propia lista)
    const outside = (e: Event) => !(e.target as Element).closest?.(`[data-select="${listId}"]`) && close()
    addEventListener('pointerdown', outside)
    addEventListener('scroll', outside, true)
    addEventListener('resize', close)
    return () => {
      removeEventListener('pointerdown', outside)
      removeEventListener('scroll', outside, true)
      removeEventListener('resize', close)
    }
  }, [open, listId])

  function onKey(e: KeyboardEvent) {
    if (!open) {
      if (['ArrowDown', 'ArrowUp', 'Enter', ' '].includes(e.key)) {
        e.preventDefault()
        openList()
      }
      return
    }
    if (e.key === 'Escape') {
      e.preventDefault()
      e.stopPropagation() // que no cierre también el modal
      close()
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => (a + (e.key === 'ArrowDown' ? 1 : -1) + options.length) % options.length)
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      if (options[active]) choose(options[active].value)
    } else if (e.key === 'Tab') close()
  }

  return (
    <div data-select={listId} className={cx('relative', className)}>
      <button
        ref={button}
        id={id}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        onClick={() => (open ? close() : openList())}
        onKeyDown={onKey}
        className={cx(
          'flex w-full cursor-pointer items-center justify-between gap-3 rounded-[10px] border bg-night/60 px-3.5 py-2.5 text-left text-[15px] outline-none transition-[border-color,box-shadow] duration-150',
          'focus-visible:border-violet-hi focus-visible:shadow-[0_0_0_3px_rgb(142_68_255/0.25)]',
          open ? 'border-violet-hi shadow-[0_0_0_3px_rgb(142_68_255/0.25)]' : invalid && !value ? 'border-[#ff6b8a]' : 'border-violet-hi/28',
        )}
      >
        <span className={cx('truncate', selected ? 'text-fg' : 'text-muted')}>{selected?.label ?? placeholder}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true" className={cx('size-4 shrink-0 fill-none stroke-lilac stroke-[2.5] transition-transform duration-200', open && 'rotate-180')}>
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* para la validación y el envío del formulario; si el navegador le da foco, se lo pasa al botón */}
      <select name={name} required={required} value={value} onChange={() => {}} tabIndex={-1} aria-hidden="true" onFocus={() => button.current?.focus()} className="sr-only">
        <option value="" />
        {options.map((o) => (
          <option key={o.value} value={o.value} />
        ))}
      </select>

      {open && pos && (
        <ul
          id={listId}
          role="listbox"
          style={{ position: 'fixed', left: pos.left, width: pos.width, top: pos.top, bottom: pos.bottom }}
          className="z-100 max-h-64 animate-fade-in overflow-y-auto rounded-xl border border-violet-hi/35 bg-[#0d0524] p-1.5 shadow-[0_18px_40px_rgb(0_0_0/0.6)]"
        >
          {options.map((o, i) => (
            <li
              key={o.value}
              id={`${listId}-${i}`}
              role="option"
              aria-selected={o.value === value}
              onPointerEnter={() => setActive(i)}
              onClick={() => choose(o.value)}
              className={cx(
                'flex cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-2 text-[15px] transition-colors duration-100',
                i === active ? 'bg-violet/30 text-white' : 'text-mist',
                o.value === value && 'text-lilac',
              )}
            >
              {o.label}
              {o.value === value && (
                <svg viewBox="0 0 24 24" aria-hidden="true" className="size-4 shrink-0 fill-none stroke-current stroke-[2.5]">
                  <path d="m5 12 5 5 9-10" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
