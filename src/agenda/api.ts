import type { AgendaEvent } from './types'

/** Los eventos de la agenda (null si no hay sesión: hay que entrar por /admin) */
export async function loadAgenda(): Promise<AgendaEvent[] | null> {
  const r = await fetch('/api/admin/agenda', { cache: 'no-store' })
  if (r.status === 401) return null
  if (!r.ok) throw new Error('No se pudo cargar la agenda')
  return (await r.json()) as AgendaEvent[]
}

/** Guarda la lista completa y espera a confirmar que ya se lee igual (así el "guardado" es de verdad) */
export async function saveAgenda(items: AgendaEvent[]) {
  const body = JSON.stringify(items)
  const r = await fetch('/api/admin/agenda', { method: 'PUT', headers: { 'content-type': 'application/json' }, body })
  if (!r.ok) throw new Error(((await r.json().catch(() => null)) as { error?: string } | null)?.error ?? `Error ${r.status}`)
  for (let i = 0; i < 12; i++) {
    const check = await fetch('/api/admin/agenda', { cache: 'no-store' })
    if (check.ok && JSON.stringify(await check.json()) === body) return
    await new Promise((res) => setTimeout(res, 700))
  }
  throw new Error('Se guardó, pero todavía no se ve actualizado. Recargá en unos segundos para confirmar.')
}
