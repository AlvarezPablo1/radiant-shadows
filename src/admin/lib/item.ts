/** Un elemento de cualquier sección, editado como objeto suelto */
export type Item = Record<string, unknown>

/** Lee un campo; acepta rutas con punto ("action.label") */
export function getField(item: Item, path: string): unknown {
  return path.split('.').reduce<unknown>((v, k) => (v && typeof v === 'object' ? (v as Item)[k] : undefined), item)
}

/** Devuelve una copia con el campo cambiado; un valor vacío borra el campo (y el objeto si queda vacío) */
export function setField(item: Item, path: string, value: unknown): Item {
  const [head, ...rest] = path.split('.')
  const copy = { ...item }
  if (rest.length) {
    const inner = setField((copy[head] as Item) ?? {}, rest.join('.'), value)
    if (Object.keys(inner).length) copy[head] = inner
    else delete copy[head]
  } else if (value === '' || value === undefined || value === false) delete copy[head]
  else copy[head] = value
  return copy
}
