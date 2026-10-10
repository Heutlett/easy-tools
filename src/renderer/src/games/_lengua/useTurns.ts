import { useCallback, useState } from 'react'
import type { Player } from '../../lib/games/players'

/** Turnos rotativos entre los jugadores (sin jugadores no hay turno) */
export function useTurns(players: Player[]): {
  current: Player | undefined
  next: () => void
  reset: () => void
} {
  const [index, setIndex] = useState(0)
  const next = useCallback(
    () => setIndex((i) => (players.length ? (i + 1) % players.length : 0)),
    [players.length]
  )
  const reset = useCallback(() => setIndex(0), [])
  return { current: players.length ? players[index % players.length] : undefined, next, reset }
}
