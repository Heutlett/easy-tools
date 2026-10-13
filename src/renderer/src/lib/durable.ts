import { useCallback, useSyncExternalStore } from 'react'

/**
 * Datos de la persona (listas de estudiantes, puntos, ranking, preguntas propias, preferencias).
 * Se guardan en un archivo con respaldos (ver src/main/store.ts), no en el almacenamiento del navegador.
 * Aquí viven en memoria y se comparten entre todas las pantallas: si dos partes de la app usan el mismo dato,
 * las dos ven siempre el valor actual (no copias viejas que se pisen entre sí).
 */
const OLD_PREFIX = 'easy-tools:'

let cache: Record<string, unknown> = {}
let recovered: string | null = null
const defaults = new Map<string, unknown>()
const listeners = new Set<() => void>()

/** Se llama una vez al abrir la app, antes de dibujar nada */
export async function initDurable(): Promise<void> {
  try {
    const { data, recoveredFrom } = await window.api.store.load()
    cache = { ...data }
    recovered = recoveredFrom
  } catch (err) {
    console.error('[datos] no se pudieron leer', err)
  }
  // Lo que se guardó antes (en el navegador) se pasa al archivo, una sola vez por dato
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const raw = localStorage.key(i)
      if (!raw?.startsWith(OLD_PREFIX)) continue
      const key = raw.slice(OLD_PREFIX.length)
      if (key in cache) continue
      const text = localStorage.getItem(raw)
      if (text === null) continue
      const value = JSON.parse(text) as unknown
      cache[key] = value
      window.api.store.set(key, value)
    }
  } catch (err) {
    console.error('[datos] no se pudo pasar lo antiguo', err)
  }
}

/** Si al abrir hubo que recuperar los datos de un respaldo, de cuál (para avisar a la persona) */
export const recoveredFrom = (): string | null => recovered

const notify = (): void => listeners.forEach((l) => l())
const subscribe = (l: () => void): (() => void) => {
  listeners.add(l)
  return () => listeners.delete(l)
}

/** Lee un dato (sin suscribirse a cambios) */
export function getDurable<T>(key: string, initial: T): T {
  return key in cache ? (cache[key] as T) : initial
}

/** Cambia un dato: se ve de inmediato en toda la app y se guarda en el archivo */
export function setDurable<T>(key: string, value: T | ((prev: T | undefined) => T)): void {
  const next =
    typeof value === 'function'
      ? (value as (prev: T | undefined) => T)(cache[key] as T | undefined)
      : value
  cache = { ...cache, [key]: next }
  window.api.store.set(key, next)
  notify()
}

/** Todos los datos (para la copia de seguridad) */
export const allDurable = (): Record<string, unknown> => ({ ...cache })

/** Reemplaza todos los datos (al restaurar una copia de seguridad) */
export async function replaceAllDurable(data: Record<string, unknown>): Promise<void> {
  cache = await window.api.store.replaceAll(data)
  notify()
}

/** Como useState, pero el valor se guarda en el archivo de datos y lo comparten todas las pantallas */
export function useDurable<T>(key: string, initial: T): [T, (value: T | ((prev: T) => T)) => void] {
  // El valor inicial se fija la primera vez para que la referencia no cambie en cada dibujo
  if (!defaults.has(key)) defaults.set(key, initial)
  const value = useSyncExternalStore(subscribe, () =>
    key in cache ? (cache[key] as T) : (defaults.get(key) as T)
  )
  const set = useCallback(
    (next: T | ((prev: T) => T)) =>
      setDurable<T>(
        key,
        typeof next === 'function'
          ? (prev) => (next as (p: T) => T)(prev === undefined ? (defaults.get(key) as T) : prev)
          : next
      ),
    [key]
  )
  return [value, set]
}
