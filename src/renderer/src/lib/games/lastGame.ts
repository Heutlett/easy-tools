import { useCallback } from 'react'
import { usePersistentState } from '../usePersistentState'

/** El último juego que se abrió, para «Seguir donde quedaste» en el inicio */
export interface LastGame {
  id: string
  /** Lo elegido en esa partida («Ciencias · 6.º · 15 preguntas · Toda la clase»); solo si el juego lo recuerda */
  summary?: string
  /** El juego sabe empezar de nuevo con lo mismo de la última vez («Jugar otra vez») */
  quick?: boolean
}

export function useLastGame(): {
  last: LastGame | null
  /** Anota que se abrió este juego (lo que se sabía de su última partida se conserva) */
  opened: (id: string) => void
  /** Anota una partida de este juego, con lo que se eligió */
  played: (id: string, summary: string) => void
} {
  const [last, setLast] = usePersistentState<LastGame | null>('last-game', null)
  const opened = useCallback(
    (id: string) => {
      if (last?.id !== id) setLast({ id })
    },
    [last, setLast]
  )
  const played = useCallback(
    (id: string, summary: string) => {
      if (last?.id !== id || last.summary !== summary)
        setLast({ id, summary, quick: id === 'millonario' })
    },
    [last, setLast]
  )
  return { last, opened, played }
}
