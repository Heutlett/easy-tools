import { useState } from 'react'
import { useClassrooms, type Group } from '../classrooms'
import { usePersistentState } from '../usePersistentState'
import { MAX_TEAMS, TEAM_STYLES, makeTeams, type Player } from './players'

/** Quiénes juegan: toda la clase junta, equipos o estudiantes de uno de los grupos guardados */
export type Who = 'class' | 'teams' | 'students'

export interface PlayerChoiceOptions {
  /** Mínimo de jugadores (por defecto 2) */
  min?: number
  /** Máximo de jugadores (por defecto 8 equipos o todo el grupo) */
  max?: number
  /** Si es verdadero, se puede jugar sin equipos («Toda la clase»: devuelve una lista vacía) */
  optional?: boolean
  /** Dónde se recuerda la elección (los juegos que la guardan aparte usan su propia clave) */
  storageKey?: string
}

export interface PlayerChoice {
  options: Required<Pick<PlayerChoiceOptions, 'min' | 'optional'>> & {
    limit: number
    studentLimit: number
  }
  /** Lo elegido (si no se puede «toda la clase», queda en equipos) */
  who: Who
  setWho: (who: Who) => void
  teamCount: number
  setTeamCount: (n: number) => void
  teamNames: string[]
  setTeamNames: (names: string[]) => void
  groups: Group[]
  group: Group | undefined
  setGroupId: (id: string) => void
  excluded: string[]
  setExcluded: (ids: string[]) => void
  chosen: Group['students']
  /** Los jugadores armados con lo elegido; null si todavía falta algo (por ejemplo, un grupo con estudiantes) */
  players: Player[] | null
  /** Una frase con lo elegido: «Toda la clase», «3 equipos», «Grupo 1 · 8 estudiantes» */
  summary: string
}

/** Lo que se elige al armar a los jugadores. La elección se recuerda para la próxima vez. */
export function usePlayerChoice({
  min = 2,
  max,
  optional = false,
  storageKey = 'players-mode'
}: PlayerChoiceOptions = {}): PlayerChoice {
  const { groups } = useClassrooms()
  const [saved, setWho] = usePersistentState<Who>(storageKey, optional ? 'class' : 'teams')
  const [teamCount, setTeamCount] = usePersistentState('players-team-count', 2)
  const [teamNames, setTeamNames] = usePersistentState<string[]>('players-team-names', [])
  const [groupId, setGroupId] = usePersistentState<string | null>('players-group', null)
  const [excluded, setExcluded] = useState<string[]>([])

  const who: Who = saved === 'class' && !optional ? 'teams' : saved
  const limit = Math.min(max ?? MAX_TEAMS, MAX_TEAMS)
  const count = Math.max(min, Math.min(teamCount, limit))
  const group = groups.find((g) => g.id === groupId) ?? groups[0]
  const chosen = group ? group.students.filter((s) => !excluded.includes(s.id)) : []
  const studentLimit = max ?? Infinity

  let players: Player[] | null = null
  let summary = ''
  if (who === 'class') {
    players = []
    summary = 'Toda la clase'
  } else if (who === 'teams') {
    players = makeTeams(count, teamNames)
    summary = `${count} equipos`
  } else {
    const list = chosen.slice(0, studentLimit)
    players =
      list.length >= min
        ? list.map((s, i) => ({
            id: s.id,
            name: s.name,
            color: TEAM_STYLES[i % TEAM_STYLES.length].color,
            emoji: TEAM_STYLES[i % TEAM_STYLES.length].emoji
          }))
        : null
    summary = group
      ? `${group.name || 'Sin nombre'} · ${chosen.length} ${chosen.length === 1 ? 'estudiante' : 'estudiantes'}`
      : 'Estudiantes de mi grupo'
  }

  return {
    options: { min, optional, limit, studentLimit },
    who,
    setWho,
    teamCount: count,
    setTeamCount,
    teamNames,
    setTeamNames,
    groups,
    group,
    setGroupId: (id) => (setGroupId(id), setExcluded([])),
    excluded,
    setExcluded,
    chosen,
    players,
    summary
  }
}
