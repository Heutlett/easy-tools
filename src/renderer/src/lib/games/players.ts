import { useCallback, useState } from 'react'

/** Quien juega: un equipo o un estudiante */
export interface Player {
  id: string
  name: string
  /** Color propio (CSS) para pintar su marcador, su ficha o su carril */
  color: string
  /** Emoji que lo identifica (equipos: animalitos) */
  emoji: string
}

/** Colores y emojis de los equipos, en orden */
export const TEAM_STYLES: { color: string; emoji: string }[] = [
  { color: '#dc2626', emoji: '🦊' },
  { color: '#2563eb', emoji: '🐬' },
  { color: '#16a34a', emoji: '🐸' },
  { color: '#d97706', emoji: '🐯' },
  { color: '#7c3aed', emoji: '🦄' },
  { color: '#db2777', emoji: '🦩' },
  { color: '#0891b2', emoji: '🐢' },
  { color: '#4d7c0f', emoji: '🦜' }
]

export const MAX_TEAMS = TEAM_STYLES.length

export const defaultTeamName = (i: number): string => `Equipo ${i + 1}`

export function makeTeams(count: number, names: string[] = []): Player[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `team-${i + 1}`,
    name: names[i]?.trim() || defaultTeamName(i),
    ...TEAM_STYLES[i % TEAM_STYLES.length]
  }))
}

/** Puntajes de los jugadores: suma o resta, o fija, el de cada uno (nunca baja de 0 con `add`, salvo que se pida) */
export function useScores(players: Player[]): {
  scores: Record<string, number>
  add: (id: string, delta: number, allowNegative?: boolean) => void
  set: (id: string, value: number) => void
  reset: () => void
  /** Los jugadores ordenados de mayor a menor puntaje */
  ranking: (Player & { score: number })[]
  /** Los que van ganando (puede ser más de uno si empatan) con al menos 1 punto */
  leaders: Player[]
} {
  const [scores, setScores] = useState<Record<string, number>>({})
  const add = useCallback((id: string, delta: number, allowNegative = false) => {
    setScores((s) => {
      const next = (s[id] ?? 0) + delta
      return { ...s, [id]: allowNegative ? next : Math.max(0, next) }
    })
  }, [])
  const set = useCallback(
    (id: string, value: number) => setScores((s) => ({ ...s, [id]: value })),
    []
  )
  const reset = useCallback(() => setScores({}), [])
  const ranking = players
    .map((p) => ({ ...p, score: scores[p.id] ?? 0 }))
    .sort((a, b) => b.score - a.score)
  const top = ranking[0]?.score ?? 0
  const leaders = top > 0 ? ranking.filter((p) => p.score === top) : []
  return { scores, add, set, reset, ranking, leaders }
}
