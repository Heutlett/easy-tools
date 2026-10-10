import { useCallback } from 'react'
import { usePersistentState } from './usePersistentState'

/** Favoritos de la persona (herramientas, juegos…): una lista de identificadores que se recuerda al volver a abrir la app. */
export function useFavorites(key: string): {
  ids: string[]
  has: (id: string) => boolean
  toggle: (id: string) => void
} {
  const [ids, setIds] = usePersistentState<string[]>(key, [])
  const has = useCallback((id: string) => ids.includes(id), [ids])
  const toggle = useCallback(
    (id: string) => setIds(ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]),
    [ids, setIds]
  )
  return { ids, has, toggle }
}
