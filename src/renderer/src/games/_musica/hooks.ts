import { useCallback, useEffect, useRef, useState } from 'react'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { stopAll } from './synth'

/** Silencia lo que esté sonando al salir de la pantalla */
export function useStopAudioOnLeave(): void {
  useEffect(() => stopAll, [])
}

/**
 * Turnos y puntajes de una partida de varias preguntas. Si hay equipos, la pregunta `i` le toca al equipo `i % equipos`.
 * Sin equipos solo se cuentan los puntos.
 */
export function useRun(
  players: Player[],
  total: number
): {
  index: number
  total: number
  finished: boolean
  current: Player | undefined
  scores: Record<string, number>
  points: number
  right: number
  ranking: ReturnType<typeof useScores>['ranking']
  leaders: Player[]
  award: (points: number) => void
  next: () => void
  /** Suma puntos a un jugador (el + y − del marcador) */
  add: (id: string, delta: number) => void
  restart: () => void
} {
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [points, setPoints] = useState(0)
  const [right, setRight] = useState(0)
  const current = players.length ? players[index % players.length] : undefined

  const award = useCallback(
    (p: number) => {
      if (p <= 0) return
      setPoints((x) => x + p)
      setRight((x) => x + 1)
      if (current) add(current.id, p)
    },
    [add, current]
  )
  const next = useCallback(() => {
    if (index + 1 >= total) {
      setFinished(true)
      sfx.win()
    } else setIndex(index + 1)
  }, [index, total])
  const restart = useCallback(() => {
    reset()
    setIndex(0)
    setFinished(false)
    setPoints(0)
    setRight(0)
  }, [reset])

  return {
    index,
    total,
    finished,
    current,
    scores,
    points,
    right,
    ranking,
    leaders,
    award,
    next,
    add,
    restart
  }
}

/** Atajos de teclado: llama a `handler` salvo cuando se escribe en un campo de texto */
export function useKeys(handler: (e: KeyboardEvent) => void): void {
  useEffect(() => {
    const on = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      if (e.ctrlKey || e.metaKey || e.altKey) return
      handler(e)
    }
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  })
}

/** Orden de las opciones de A a D para los atajos del teclado */
export const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F', 'G']

/** setTimeout que se cancela solo al salir de la pantalla */
export function useLater(): (fn: () => void, ms: number) => void {
  const timers = useRef<number[]>([])
  useEffect(() => {
    const list = timers.current
    return () => list.forEach((t) => window.clearTimeout(t))
  }, [])
  return useCallback((fn, ms) => {
    timers.current.push(window.setTimeout(fn, ms))
  }, [])
}
