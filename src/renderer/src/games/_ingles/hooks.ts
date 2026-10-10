import { useEffect, useRef } from 'react'
import { usePersistentState } from '../../lib/usePersistentState'
import { TOPICS, type TopicId } from './vocab'

/** Preferencias de un juego, guardadas en la computadora (los campos nuevos toman su valor por defecto) */
export function usePrefs<T extends object>(
  gameId: string,
  defaults: T
): [T, (patch: Partial<T>) => void] {
  const [saved, setSaved] = usePersistentState<Partial<T>>(`game:${gameId}:prefs`, {})
  const prefs = { ...defaults, ...saved }
  const update = (patch: Partial<T>): void => setSaved({ ...prefs, ...patch })
  return [prefs, update]
}

export const topicName = (id: TopicId): string => TOPICS.find((t) => t.id === id)?.en ?? id

/**
 * Teclado de un juego: la función se llama con cada tecla pulsada (no con las que van a un campo de texto).
 * `bodyFocus` es verdadero si no hay ningún botón seleccionado (Espacio y Enter solo se usan así, para no pulsar otro botón por accidente).
 */
export function useKeys(handler: (e: KeyboardEvent, bodyFocus: boolean) => void): void {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      ref.current(e, tag === 'BODY')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}

/** Letra de la opción (A–D) */
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

/** Índice de opción (0–3) que corresponde a una tecla: 1–4 o A–D; -1 si no es ninguna */
export function optionKey(e: KeyboardEvent, count = 4): number {
  const n = '1234'.indexOf(e.key)
  if (n >= 0 && n < count) return n
  const l = 'abcd'.indexOf(e.key.toLowerCase())
  return e.key.length === 1 && l >= 0 && l < count ? l : -1
}
