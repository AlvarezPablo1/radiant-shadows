import { useEffect, useState } from 'react'
import { FONT_ROLES, type FontRole } from '../brand'
import { idbDel, idbGet, idbKeys, idbPut } from './idb'

/**
 * Fuentes:
 *  - roles de marca (Títulos / Frases / Condensada): usan un sustituto de Google Fonts
 *    hasta que el staff sube el archivo oficial, que lo reemplaza en todos los diseños.
 *  - fuentes agregadas: cualquier archivo extra; quedan disponibles en el selector de textos.
 */
const loaded = new Set<string>()
/** nombre identificatorio que el staff le puso a la fuente subida para cada uso */
const roleNames: Partial<Record<FontRole, string>> = {}
const custom = new Set<string>()
let listeners: (() => void)[] = []
const notify = () => listeners.forEach((l) => l())

const isRole = (f: string): f is FontRole => f in FONT_ROLES

export function fontFamily(font: string): string {
  if (font === 'Permanent Marker') font = 'manuscrita'
  if (!isRole(font)) return `"${font}"`
  const r = FONT_ROLES[font]
  return loaded.has(r.official) ? `"${r.official}"` : `"${r.fallback}"`
}
export function fontWeight(font: string): string {
  return isRole(font) ? FONT_ROLES[font].weight : 'normal'
}
export function fontLabel(font: string): string {
  return isRole(font) ? FONT_ROLES[font].label : font
}
export function roleFontName(role: FontRole): string {
  return loaded.has(FONT_ROLES[role].official) ? (roleNames[role] ?? FONT_ROLES[role].officialName) : FONT_ROLES[role].fallback
}
export function hasOfficial(role: FontRole) {
  return loaded.has(FONT_ROLES[role].official)
}
export function customFonts(): string[] {
  return [...custom].sort()
}

async function register(name: string, data: ArrayBuffer) {
  const ff = new FontFace(name, data)
  await ff.load()
  document.fonts.add(ff)
  loaded.add(name)
}

export async function initFonts() {
  const keys = await idbKeys().catch(() => [] as string[])
  for (const role of Object.keys(FONT_ROLES) as FontRole[]) {
    const buf = await idbGet<ArrayBuffer>('font-' + role).catch(() => undefined)
    if (buf) await register(FONT_ROLES[role].official, buf).catch(() => undefined)
    const nm = await idbGet<string>('fontname-' + role).catch(() => undefined)
    if (nm) roleNames[role] = nm
  }
  for (const k of keys.filter((k) => k.startsWith('fontc-'))) {
    const buf = await idbGet<ArrayBuffer>(k).catch(() => undefined)
    const name = k.slice(6)
    if (buf && (await register(name, buf).then(() => true).catch(() => false))) custom.add(name)
  }
  await Promise.all(
    ['800 40px Montserrat', '500 40px Montserrat', '400 40px "Young Serif"', 'italic 800 40px Montserrat', '400 40px "Bebas Neue"', '500 14px Sora', '400 40px "Rock Salt"'].map((f) =>
      document.fonts.load(f).catch(() => undefined),
    ),
  )
  await document.fonts.ready
  notify()
}

/** Reemplaza el sustituto de un rol por la fuente oficial. */
export async function uploadRoleFont(role: FontRole, file: File, name?: string) {
  const buf = await file.arrayBuffer()
  await register(FONT_ROLES[role].official, buf.slice(0))
  await idbPut('font-' + role, buf as unknown as Blob)
  const nm = name?.trim() || fileFontName(file)
  roleNames[role] = nm
  await idbPut('fontname-' + role, nm)
  notify()
}
export const fileFontName = (file: File) => file.name.replace(/\.(otf|ttf|woff2?)$/i, '').replace(/[-_]+/g, ' ').trim()
export async function removeRoleFont(role: FontRole) {
  await idbDel('font-' + role)
  await idbDel('fontname-' + role)
  delete roleNames[role]
  loaded.delete(FONT_ROLES[role].official)
  notify()
}

/** Agrega una fuente nueva; su nombre sale del archivo. */
export async function addCustomFont(file: File, displayName?: string) {
  const name = displayName?.trim() || fileFontName(file)
  const buf = await file.arrayBuffer()
  await register(name, buf.slice(0))
  await idbPut('fontc-' + name, buf as unknown as Blob)
  custom.add(name)
  notify()
  return name
}
export async function removeCustomFont(name: string) {
  await idbDel('fontc-' + name)
  custom.delete(name)
  notify()
}

export function useFontsVersion() {
  const [v, setV] = useState(0)
  useEffect(() => {
    const l = () => setV((x) => x + 1)
    listeners.push(l)
    return () => {
      listeners = listeners.filter((x) => x !== l)
    }
  }, [])
  return v
}
