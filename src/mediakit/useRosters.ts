import { useCallback, useEffect, useMemo, useState } from 'react'
import { DEFAULT_CONTENT, type Content } from '../shared/content/content'
import { loadContent } from '../shared/content/load'
import { rostersFrom, type LocalTweaks } from './data/roster'

const LS_TWEAKS = 'rs-roster-tweaks-v1'

function readTweaks(): LocalTweaks {
  try {
    return JSON.parse(localStorage.getItem(LS_TWEAKS) ?? '{}') as LocalTweaks
  } catch {
    return {}
  }
}

/** Jugadores y staff desde /admin + los ajustes locales (titulares, fotos cambiadas para una placa) */
export function useRosters() {
  const [content, setContent] = useState<Content>(DEFAULT_CONTENT)
  const [ready, setReady] = useState(false)
  const [tweaks, setTweaks] = useState<LocalTweaks>(readTweaks)
  useEffect(() => {
    let cancelled = false
    loadContent().then((c) => {
      if (cancelled) return
      setContent(c)
      setReady(true)
    })
    return () => {
      cancelled = true
    }
  }, [])
  useEffect(() => {
    try {
      localStorage.setItem(LS_TWEAKS, JSON.stringify(tweaks))
    } catch {
      /* sin almacenamiento: los ajustes duran hasta cerrar la pestaña */
    }
  }, [tweaks])

  const rosters = useMemo(() => rostersFrom(content, tweaks), [content, tweaks])
  /** cambia (o, con `undefined`, vuelve al de /admin) un dato local de una persona */
  const tweakPerson = useCallback(
    (id: string, patch: LocalTweaks[string]) =>
      setTweaks((t) => {
        const next = { ...t[id], ...patch }
        for (const k of Object.keys(next) as (keyof typeof next)[]) if (next[k] === undefined) delete next[k]
        return { ...t, [id]: next }
      }),
    [],
  )
  /** `ready`: ya llegó lo de /admin (antes se usa el contenido del código) */
  return { rosters, ready, tweaks, tweakPerson }
}
