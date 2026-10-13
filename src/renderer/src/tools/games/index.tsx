import { Suspense, useEffect, useState } from 'react'
import '../../components/games/games.css'
import FavoriteButton from '../../components/FavoriteButton'
import { useToolHeader } from '../../components/ToolHeaderContext'
import { SUBJECTS, gradeLabel, gradesLabel } from '../../content/subjects'
import { GRADES, type Grade, type SubjectId } from '../../content/types'
import { games, type Game } from '../../games/registry'
import { GAME_MODES, type GameMode } from '../../games/types'
import { clearRequestedGame, peekRequestedGame } from '../../lib/openIntent'
import { matchesQuery } from '../../lib/search'
import { GameInfoContext } from '../../lib/games/ranking'
import { useFavorites } from '../../lib/useFavorites'
import Hint from '../../components/Hint'

type SubjectFilter = SubjectId | 'general'

const subjectsOf = (g: Game): SubjectFilter[] => (g.subjects.length ? g.subjects : ['general'])

export default function Games(): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState<SubjectFilter | null>(null)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  // Si se llegó desde «Ayuda» con «Llévame ahí», se abre ese juego directo
  const [openId, setOpenId] = useState<string | null>(() => peekRequestedGame())
  useEffect(() => clearRequestedGame(), [])
  const favorites = useFavorites('favorite-games')
  const open = games.find((g) => g.id === openId) ?? null

  useToolHeader(
    open
      ? {
          title: open.title,
          icon: open.icon,
          description: open.description,
          backLabel: '← Todos los juegos',
          onBack: () => setOpenId(null)
        }
      : null
  )

  if (open) {
    return (
      <div className="game-frame" style={{ '--accent': open.color } as React.CSSProperties}>
        <GameInfoContext.Provider value={{ id: open.id, title: open.title }}>
          <Suspense fallback={<p className="muted">Cargando…</p>}>
            <open.Component />
          </Suspense>
        </GameInfoContext.Provider>
      </div>
    )
  }

  const visible = games.filter(
    (g) =>
      (!subject || subjectsOf(g).includes(subject)) &&
      (!grade || g.grades.includes(grade)) &&
      (!mode || g.modes.includes(mode)) &&
      matchesQuery(
        query,
        g.title,
        g.description,
        ...(g.keywords ?? []),
        ...g.subjects.map((s) => SUBJECTS.find((x) => x.id === s)?.title)
      )
  )
  const favorite = visible.filter((g) => favorites.has(g.id))
  const filtering = query.trim() !== '' || subject !== null || grade !== null || mode !== null

  const card = (g: Game): React.JSX.Element => (
    <div
      key={g.id}
      className="tool-card-wrap"
      style={{ '--accent': g.color } as React.CSSProperties}
    >
      <button className="tool-card game-card" onClick={() => setOpenId(g.id)}>
        <span className="tool-icon">{g.icon}</span>
        <span className="tool-title">{g.title}</span>
        <span className="tool-desc">{g.description}</span>
        <span className="bank-tags">
          {g.subjects.length === 0 && <span className="bank-tag">🎲 Cualquier tema</span>}
          {g.subjects.length >= SUBJECTS.length ? (
            <span className="bank-tag">📚 Todas las asignaturas</span>
          ) : (
            g.subjects.slice(0, 3).map((s) => {
              const info = SUBJECTS.find((x) => x.id === s)
              return (
                <span key={s} className="bank-tag">
                  {info?.icon} {info?.title}
                </span>
              )
            })
          )}
          {g.grades.length < 6 && <span className="bank-tag">{gradesLabel(g.grades)}</span>}
        </span>
      </button>
      <FavoriteButton
        active={favorites.has(g.id)}
        label={g.title}
        onToggle={() => favorites.toggle(g.id)}
      />
    </div>
  )

  return (
    <div className="games-hub">
      <Hint id="games-hub">
        Usa el buscador y los filtros para encontrar un juego, y la ⭐ para dejar tus favoritos
        arriba. En los juegos de preguntas puedes agregar las tuyas.
      </Hint>
      <div className="catalog-controls">
        <input
          className="field catalog-search"
          type="search"
          value={query}
          placeholder="🔍 Buscar un juego…"
          aria-label="Buscar un juego"
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="bank-filter-row">
          <span className="bank-filter-label">Asignatura</span>
          <div className="pills" role="group" aria-label="Asignatura">
            {[...SUBJECTS, { id: 'general' as const, title: 'Cualquier tema', icon: '🎲' }].map(
              (s) => (
                <button
                  key={s.id}
                  className={`pill ${subject === s.id ? 'selected' : ''}`}
                  aria-pressed={subject === s.id}
                  onClick={() => setSubject(subject === s.id ? null : s.id)}
                >
                  {s.icon} {s.title}
                </button>
              )
            )}
          </div>
        </div>
        <div className="bank-filter-row">
          <span className="bank-filter-label">Grado</span>
          <div className="pills" role="group" aria-label="Grado">
            {GRADES.map((g) => (
              <button
                key={g}
                className={`pill ${grade === g ? 'selected' : ''}`}
                aria-pressed={grade === g}
                onClick={() => setGrade(grade === g ? null : g)}
              >
                {gradeLabel(g)}
              </button>
            ))}
          </div>
        </div>
        <div className="bank-filter-row">
          <span className="bank-filter-label">Cómo se juega</span>
          <div className="pills" role="group" aria-label="Cómo se juega">
            {GAME_MODES.map((m) => (
              <button
                key={m.id}
                className={`pill ${mode === m.id ? 'selected' : ''}`}
                aria-pressed={mode === m.id}
                onClick={() => setMode(mode === m.id ? null : m.id)}
              >
                {m.icon} {m.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      {favorite.length > 0 && (
        <section className="category favorites">
          <h3 className="category-title">
            <span aria-hidden>⭐</span> Favoritos
          </h3>
          <div className="tool-grid">{favorite.map(card)}</div>
        </section>
      )}

      {visible.length > 0 && (
        <section className="category">
          <h3 className="category-title">
            <span aria-hidden>🎮</span>{' '}
            {filtering ? `${visible.length} juegos` : 'Todos los juegos'}
          </h3>
          <div className="tool-grid">{visible.map(card)}</div>
        </section>
      )}

      {visible.length === 0 && (
        <div className="notice catalog-empty">
          <p>No encontré ningún juego con eso.</p>
          <button
            className="btn secondary small"
            onClick={() => (setQuery(''), setSubject(null), setGrade(null), setMode(null))}
          >
            Ver todos
          </button>
        </div>
      )}
    </div>
  )
}
