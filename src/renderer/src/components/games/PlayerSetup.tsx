import './games.css'
import { useState } from 'react'
import { useClassrooms } from '../../lib/classrooms'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  MAX_TEAMS,
  TEAM_STYLES,
  defaultTeamName,
  makeTeams,
  type Player
} from '../../lib/games/players'
import Hint from '../Hint'

interface Props {
  /** Texto del botón para empezar */
  startLabel?: string
  /** Mínimo de jugadores (por defecto 2) */
  min?: number
  /** Máximo de jugadores (por defecto 8 equipos o todo el grupo) */
  max?: number
  /** Si es verdadero, aparece «Jugar sin equipos» (devuelve una lista vacía) */
  optional?: boolean
  onStart: (players: Player[]) => void
}

/**
 * Pantalla para armar los jugadores: equipos con nombre y color, o estudiantes de uno de los grupos guardados.
 * La elección se recuerda para la próxima vez.
 */
export default function PlayerSetup({
  startLabel = 'Empezar',
  min = 2,
  max,
  optional,
  onStart
}: Props): React.JSX.Element {
  const { groups } = useClassrooms()
  const [mode, setMode] = usePersistentState<'teams' | 'students'>('players-mode', 'teams')
  const [teamCount, setTeamCount] = usePersistentState('players-team-count', 2)
  const [teamNames, setTeamNames] = usePersistentState<string[]>('players-team-names', [])
  const [groupId, setGroupId] = usePersistentState<string | null>('players-group', null)
  const [excluded, setExcluded] = useState<string[]>([])

  const limit = Math.min(max ?? MAX_TEAMS, MAX_TEAMS)
  const count = Math.max(min, Math.min(teamCount, limit))
  const group = groups.find((g) => g.id === groupId) ?? groups[0]
  const chosen = group ? group.students.filter((s) => !excluded.includes(s.id)) : []
  const studentLimit = max ?? Infinity

  const startTeams = (): void => onStart(makeTeams(count, teamNames))
  const startStudents = (): void =>
    onStart(
      chosen.slice(0, studentLimit).map((s, i) => ({
        id: s.id,
        name: s.name,
        ...TEAM_STYLES[i % TEAM_STYLES.length]
      }))
    )

  return (
    <section className="panel player-setup">
      <Hint id="ranking-students">
        Para que el resultado cuente en el ranking, elige «Estudiantes de mi grupo». Con equipos no
        se guarda.
      </Hint>
      <div className="pills" role="group" aria-label="Quiénes juegan">
        <button
          className={`pill ${mode === 'teams' ? 'selected' : ''}`}
          aria-pressed={mode === 'teams'}
          onClick={() => setMode('teams')}
        >
          👥 Equipos
        </button>
        <button
          className={`pill ${mode === 'students' ? 'selected' : ''}`}
          aria-pressed={mode === 'students'}
          onClick={() => setMode('students')}
        >
          🙋 Estudiantes de mi grupo
        </button>
      </div>

      {mode === 'teams' ? (
        <>
          <div className="row start">
            <span className="panel-title">¿Cuántos equipos?</span>
            <div className="pills" role="group" aria-label="Cantidad de equipos">
              {Array.from({ length: limit - min + 1 }, (_, i) => min + i).map((n) => (
                <button
                  key={n}
                  className={`pill ${count === n ? 'selected' : ''}`}
                  aria-pressed={count === n}
                  onClick={() => setTeamCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="player-teams">
            {Array.from({ length: count }, (_, i) => (
              <label key={i} className="player-team" style={{ borderColor: TEAM_STYLES[i].color }}>
                <span className="player-team-emoji" aria-hidden>
                  {TEAM_STYLES[i].emoji}
                </span>
                <input
                  className="field"
                  value={teamNames[i] ?? ''}
                  placeholder={defaultTeamName(i)}
                  aria-label={`Nombre del equipo ${i + 1}`}
                  maxLength={24}
                  onChange={(e) => {
                    const next = [...teamNames]
                    next[i] = e.target.value
                    setTeamNames(next)
                  }}
                />
              </label>
            ))}
          </div>
          <div className="row start">
            <button className="btn big" onClick={startTeams}>
              {startLabel}
            </button>
            {optional && (
              <button className="btn secondary" onClick={() => onStart([])}>
                Jugar sin equipos
              </button>
            )}
          </div>
        </>
      ) : groups.length === 0 ? (
        <p className="muted">
          Todavía no tienes grupos. Créalos en «Lista de estudiantes» (en «Para el aula») y vuelve
          aquí.
        </p>
      ) : (
        <>
          <div className="pills" role="group" aria-label="Grupo">
            {groups.map((g) => (
              <button
                key={g.id}
                className={`pill ${g.id === group.id ? 'selected' : ''}`}
                aria-pressed={g.id === group.id}
                onClick={() => (setGroupId(g.id), setExcluded([]))}
              >
                {g.name || 'Sin nombre'} ({g.students.length})
              </button>
            ))}
          </div>
          <p className="muted">Quita a quien no esté hoy:</p>
          <div className="pills" role="group" aria-label="Estudiantes">
            {group.students.map((s) => {
              const out = excluded.includes(s.id)
              return (
                <button
                  key={s.id}
                  className={`pill ${out ? '' : 'selected'}`}
                  aria-pressed={!out}
                  onClick={() =>
                    setExcluded(out ? excluded.filter((x) => x !== s.id) : [...excluded, s.id])
                  }
                >
                  {out ? '✖' : '✔'} {s.name}
                </button>
              )
            })}
          </div>
          {chosen.length < min && <p className="notice">Elige al menos {min} estudiantes.</p>}
          {chosen.length > studentLimit && (
            <p className="notice">
              Este juego admite hasta {studentLimit}: se usarán los primeros.
            </p>
          )}
          <div className="row start">
            <button className="btn big" disabled={chosen.length < min} onClick={startStudents}>
              {startLabel}
            </button>
            {optional && (
              <button className="btn secondary" onClick={() => onStart([])}>
                Jugar sin equipos
              </button>
            )}
          </div>
        </>
      )}
    </section>
  )
}
