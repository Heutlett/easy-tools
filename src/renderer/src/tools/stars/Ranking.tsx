import { useMemo, useState } from 'react'
import { useClassrooms } from '../../lib/classrooms'
import {
  SCORE_UNITS,
  formatScore,
  gamesWithResults,
  summarize,
  useRankingData,
  type RankingSession,
  type StudentSummary
} from '../../lib/games/ranking'
import { usePersistentState } from '../../lib/usePersistentState'

type Sort = 'total' | 'best' | 'wins'
const SORTS: { id: Sort; label: string }[] = [
  { id: 'wins', label: '🥇 Más victorias' },
  { id: 'total', label: 'Más puntos en total' },
  { id: 'best', label: 'Mejor partida' }
]
const MEDALS = ['🥇', '🥈', '🥉']

const timeAgo = (at: number): string => {
  const minutes = Math.floor((Date.now() - at) / 60000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return new Date(at).toLocaleDateString('es-CR')
}

export default function Ranking(): React.JSX.Element {
  const { groups } = useClassrooms()
  const [data, setData] = useRankingData()
  const [groupId, setGroupId] = usePersistentState<string | null>('ranking-group', null)
  const [game, setGame] = usePersistentState<string | null>('ranking-game', null)
  const [sort, setSort] = usePersistentState<Sort | null>('ranking-sort', null)
  const [confirm, setConfirm] = useState(false)

  const group = groups.find((g) => g.id === groupId) ?? groups[0] ?? null

  const sessions = data.sessions
  const inGroup = useMemo(
    () => (group ? sessions.filter((s) => s.groupId === group.id) : []),
    [sessions, group]
  )
  const games = useMemo(
    () => (group ? gamesWithResults(sessions, group.id) : []),
    [sessions, group]
  )
  // Si el juego elegido ya no tiene partidas en este grupo, se muestran todos
  const activeGame = game && games.some((g) => g.id === game) ? game : null
  const effectiveSort: Sort = sort ?? (activeGame ? 'total' : 'wins')

  const rows = useMemo(() => {
    if (!group) return []
    const sum = summarize(sessions, group.id, activeGame)
    const list = group.students.map((s) => ({
      student: s,
      sum: sum.get(s.id) ?? { studentId: s.id, played: 0, wins: 0, best: 0, total: 0 }
    }))
    const key = (r: (typeof list)[number]): number =>
      effectiveSort === 'wins'
        ? r.sum.wins * 1e9 + r.sum.total
        : effectiveSort === 'best'
          ? r.sum.best
          : r.sum.total
    return list.sort((a, b) => {
      if (a.sum.played > 0 !== b.sum.played > 0) return a.sum.played > 0 ? -1 : 1
      return key(b) - key(a) || a.student.name.localeCompare(b.student.name, 'es')
    })
  }, [group, sessions, activeGame, effectiveSort])

  if (!group) {
    return (
      <section className="panel">
        <p className="panel-title">Primero necesitas un grupo de estudiantes</p>
        <p className="muted">
          Créalo en «Lista de estudiantes». Los juegos solo guardan en el ranking a los estudiantes
          que estén en un grupo guardado.
        </p>
      </section>
    )
  }

  const shown = activeGame ? inGroup.filter((s) => s.game === activeGame) : inGroup
  const recent = [...shown].sort((a, b) => b.at - a.at).slice(0, 8)
  const played = rows.filter((r) => r.sum.played > 0)
  const mixedNote = !activeGame && inGroup.some((s) => SCORE_UNITS[s.game])

  const total = (r: StudentSummary, key: 'total' | 'best'): string =>
    activeGame ? formatScore(activeGame, r[key]) : String(r[key])

  const reset = (): void => {
    setData({ sessions: sessions.filter((s) => s.groupId !== group.id) })
    setConfirm(false)
  }

  return (
    <>
      <div className="row">
        <div className="pills" role="group" aria-label="Grupo">
          {groups.map((g) => (
            <button
              key={g.id}
              className={`pill ${g.id === group.id ? 'selected' : ''}`}
              aria-pressed={g.id === group.id}
              onClick={() => (setGroupId(g.id), setConfirm(false))}
            >
              {g.name || 'Sin nombre'}
            </button>
          ))}
        </div>
      </div>

      {inGroup.length === 0 ? (
        <section className="panel rk-empty">
          <p className="rk-empty-icon" aria-hidden>
            🏆
          </p>
          <p className="panel-title">Todavía no hay partidas de este grupo</p>
          <p className="muted">
            Entra a <b>Juegos</b>, elige «Estudiantes de mi grupo» cuando te pregunte quién juega, y
            al terminar cada partida aparecerán aquí los resultados.
          </p>
        </section>
      ) : (
        <>
          <div className="panel rk-filters">
            <div className="bank-filter-row">
              <span className="bank-filter-label">Juego</span>
              <div className="pills" role="group" aria-label="Juego">
                <button
                  className={`pill ${!activeGame ? 'selected' : ''}`}
                  aria-pressed={!activeGame}
                  onClick={() => (setGame(null), setSort(null))}
                >
                  🎮 Todos los juegos
                </button>
                {games.map((g) => (
                  <button
                    key={g.id}
                    className={`pill ${activeGame === g.id ? 'selected' : ''}`}
                    aria-pressed={activeGame === g.id}
                    onClick={() => (setGame(g.id), setSort(null))}
                  >
                    {g.title} <span className="muted">({g.count})</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="bank-filter-row">
              <span className="bank-filter-label">Ordenar por</span>
              <div className="pills" role="group" aria-label="Ordenar por">
                {SORTS.map((s) => (
                  <button
                    key={s.id}
                    className={`pill small ${effectiveSort === s.id ? 'selected' : ''}`}
                    aria-pressed={effectiveSort === s.id}
                    onClick={() => setSort(s.id)}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <ol className="rk-table" aria-label="Ranking">
            <li className="rk-head" aria-hidden>
              <span>#</span>
              <span>Estudiante</span>
              <span>Partidas</span>
              <span>🥇</span>
              <span>Mejor</span>
              <span>Total</span>
            </li>
            {played.map((r, i) => (
              <li key={r.student.id} className={`rk-row ${i < 3 ? `top top${i + 1}` : ''}`}>
                <span className="rk-pos">{MEDALS[i] ?? i + 1}</span>
                <strong className="rk-name">{r.student.name}</strong>
                <span>{r.sum.played}</span>
                <span>{r.sum.wins}</span>
                <span>{total(r.sum, 'best')}</span>
                <span className="rk-total">{total(r.sum, 'total')}</span>
              </li>
            ))}
            {played.length === 0 && (
              <li className="rk-none">Nadie ha jugado {activeGame ? 'este juego' : ''} todavía.</li>
            )}
            {rows.length > played.length && (
              <li className="rk-others">
                Sin partidas:{' '}
                {rows
                  .filter((r) => r.sum.played === 0)
                  .map((r) => r.student.name)
                  .join(', ')}
              </li>
            )}
          </ol>
          {mixedNote && (
            <p className="muted rk-footnote">
              En «Todos los juegos», el millonario cuenta solo en partidas y victorias, porque su
              puntaje son colones. Míralo elegido aparte.
            </p>
          )}

          <section className="panel">
            <h3 className="panel-title">Últimas partidas</h3>
            <ul className="rk-recent">
              {recent.map((s: RankingSession) => (
                <li key={s.id}>
                  <b>{s.gameTitle}</b> <span className="muted">· {timeAgo(s.at)}</span>
                  <span className="rk-recent-scores">
                    {s.entries
                      .slice(0, 4)
                      .map((e) => `${e.name} ${formatScore(s.game, e.score)}`)
                      .join(' · ')}
                    {s.entries.length > 4 ? ` · +${s.entries.length - 4}` : ''}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <div className="row start">
            {confirm ? (
              <button className="btn danger small" onClick={reset}>
                Sí, borrar el ranking de este grupo
              </button>
            ) : (
              <button
                className="btn secondary small"
                onClick={() => (setConfirm(true), setTimeout(() => setConfirm(false), 4000))}
              >
                Borrar el ranking de este grupo
              </button>
            )}
          </div>
        </>
      )}
    </>
  )
}
