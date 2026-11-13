// Almacenamiento local de imágenes/fuentes subidas (IndexedDB: localStorage no alcanza para fotos)
const DB = 'rs-creator'
const STORE = 'assets'

let dbp: Promise<IDBDatabase> | null = null
function db() {
  if (!dbp)
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1)
      r.onupgradeneeded = () => r.result.createObjectStore(STORE)
      r.onsuccess = () => res(r.result)
      r.onerror = () => rej(r.error)
    })
  return dbp
}

export async function idbPut(key: string, value: Blob | string) {
  const d = await db()
  return new Promise<void>((res, rej) => {
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).put(value, key)
    tx.oncomplete = () => res()
    tx.onerror = () => rej(tx.error)
  })
}

export async function idbGet<T = Blob>(key: string): Promise<T | undefined> {
  const d = await db()
  return new Promise((res, rej) => {
    const r = d.transaction(STORE).objectStore(STORE).get(key)
    r.onsuccess = () => res(r.result as T)
    r.onerror = () => rej(r.error)
  })
}

export async function idbKeys(): Promise<string[]> {
  const d = await db()
  return new Promise((res, rej) => {
    const r = d.transaction(STORE).objectStore(STORE).getAllKeys()
    r.onsuccess = () => res(r.result as string[])
    r.onerror = () => rej(r.error)
  })
}

export async function idbDel(key: string) {
  const d = await db()
  return new Promise<void>((res) => {
    const tx = d.transaction(STORE, 'readwrite')
    tx.objectStore(STORE).delete(key)
    tx.oncomplete = () => res()
  })
}
