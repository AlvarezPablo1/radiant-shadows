import { createContext, useContext, type ReactNode } from 'react'

/** diálogos, avisos, progreso y subida de fotos del mediakit (lo provee UIProvider en ui.tsx) */
export interface AskOpt<T> {
  title: string
  body?: ReactNode
  options: { label: string; value: T; primary?: boolean }[]
}
export interface UICtx {
  ask: <T>(o: AskOpt<T>) => Promise<T | undefined>
  toast: (msg: string, kind?: 'info' | 'warn') => void
  busy: (label: string | null, progress?: number) => void
  uploadPhoto: (opts?: { askPng?: boolean }) => Promise<string | undefined>
  cutout: (src: string) => Promise<string | undefined>
}
export const Ctx = createContext<UICtx>(null!)
export const useUI = () => useContext(Ctx)
