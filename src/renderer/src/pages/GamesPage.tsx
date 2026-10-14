import { Suspense, useCallback, useEffect, useState } from 'react'
import '../components/games/games.css'
import { ToolHeaderContext, type HeaderOverride } from '../components/ToolHeaderContext'
import { SUBJECTS, gradeLabel, gradesLabel } from '../content/subjects'
import { GRADES, type Grade, type SubjectId } from '../content/types'
import { games, type Game } from '../games/registry'
import { GAME_MODES, GAME_TYPES, type GameMode } from '../games/types'
import { useLastGame } from '../lib/games/lastGame'
import { GameInfoContext } from '../lib/games/ranking'
import { useChromeState, useNav } from '../lib/nav'
import { matchesQuery } from '../lib/search'
import { useFavorites } from '../lib/useFavorites'

type SubjectFilter = SubjectId | 'general'

const subjectsOf = (g: Game): SubjectFilter[] => (g.subjects.length ? g.subjects : ['general'])

/** Juegos: el catálogo agrupado por tipo, o el juego que se abrió */
export default function GamesPage(): React.JSX.Element {
  const { place } = useNav()
  const open = games.find((g) => g.id === place.gameId) ?? null
  return open ? <GameFrame key={open.id} game={open} /> : <Catalog />
}

/* ---------- Catálogo ---------- */

function Catalog(): React.JSX.Element {
  const { place, go } = useNav()
  const [query, setQuery] = useState('')
  const [subject, setSubject] = useState<SubjectFilter | null>(place.subject)
  const [grade, setGrade] = useState<Grade | null>(null)
  const [mode, setMode] = useState<GameMode | null>(null)
  const favorites = useFavorites('favorite-games')
  const open = (g: Game): void => go({ page: 'games', gameId: g.id })

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
  const filtering = query.trim() !== '' || subject !== null || grade !== null || mode !== null
  const clear = (): void => (setQuery(''), setSubject(null), setGrade(null), setMode(null))
  const favoriteGames = games.filter((g) => favorites.has(g.id))

  return (
    <div className="page games-page">
      <header className="page-head">
        <div>
          <h1>Juegos</h1>
          <p className="page-sub">Elige uno y lo preparamos en tres pasos.</p>
        </div>
        <input
          className="search"
          type="search"
          value={query}
          placeholder="🔍 Buscar un juego…"
          aria-label="Buscar un juego"
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      <section className="filter-card" aria-label="Filtros">
        <div className="filter-row">
          <span className="filter-label">Materia</span>
          <div className="chips" role="group" aria-label="Materia">
            {[...SUBJECTS, { id: 'general' as const, title: 'Cualquier tema', icon: '🎲' }].map(
              (s) => (
                <button
                  key={s.id}
                  className={`chip ${subject === s.id ? 'on' : ''}`}
                  aria-pressed={subject === s.id}
                  onClick={() => setSubject(subject === s.id ? null : s.id)}
                >
                  {s.icon} {s.title}
                </button>
              )
            )}
          </div>
        </div>
        <div className="filter-row">
          <span className="filter-label">Grado</span>
          <div className="segmented" role="group" aria-label="Grado">
            {GRADES.map((g) => (
              <button
                key={g}
                className={grade === g ? 'on' : ''}
                aria-pressed={grade === g}
                onClick={() => setGrade(grade === g ? null : g)}
              >
                {gradeLabel(g)}
              </button>
            ))}
          </div>
          <span className="filter-label inline">Se juega</span>
          <div className="chips" role="group" aria-label="Cómo se juega">
            {GAME_MODES.map((m) => (
              <button
                key={m.id}
                className={`chip ${mode === m.id ? 'on' : ''}`}
                aria-pressed={mode === m.id}
                onClick={() => setMode(mode === m.id ? null : m.id)}
              >
                {m.icon} {m.title}
              </button>
            ))}
          </div>
          {filtering && (
            <button className="link-btn push" onClick={clear}>
              Quitar filtros
            </button>
          )}
        </div>
      </section>

      {!filtering && favoriteGames.length > 0 && (
        <section className="block">
          <h2>⭐ Tus favoritos</h2>
          <div className="fav-row">
            {favoriteGames.map((g) => (
              <button
                key={g.id}
                className="fav-pill"
                style={{ '--tint': g.color } as React.CSSProperties}
                onClick={() => open(g)}
              >
                <span className="fav-pill-icon" aria-hidden>
                  {g.icon}
                </span>
                <b>{g.title}</b>
              </button>
            ))}
          </div>
        </section>
      )}

      {GAME_TYPES.map((type) => {
        const list = visible.filter((g) => g.type === type.id)
        if (list.length === 0) return null
        return (
          <section key={type.id} className="block">
            <h2 className="group-title">
              <span className="dot" style={{ background: type.color }} aria-hidden />
              {type.title}
              <small>
                {list.length} {list.length === 1 ? 'juego' : 'juegos'}
              </small>
            </h2>
            <div className="game-grid">
              {list.map((g) => (
                <GameCard
                  key={g.id}
                  game={g}
                  fav={favorites.has(g.id)}
                  onToggle={() => favorites.toggle(g.id)}
                  onOpen={() => open(g)}
                />
              ))}
            </div>
          </section>
        )
      })}

      {visible.length === 0 && (
        <div className="empty-box">
          No encontré juegos con esos filtros. <button onClick={clear}>Ver todos</button>
        </div>
      )}
    </div>
  )
}

function GameCard({
  game: g,
  fav,
  onToggle,
  onOpen
}: {
  game: Game
  fav: boolean
  onToggle: () => void
  onOpen: () => void
}): React.JSX.Element {
  const tags: string[] = []
  if (g.subjects.length === 0) tags.push('🎲 Cualquier tema')
  else if (g.subjects.length >= SUBJECTS.length) tags.push('📚 Todas las materias')
  else
    for (const s of g.subjects.slice(0, 2)) {
      const info = SUBJECTS.find((x) => x.id === s)
      tags.push(`${info?.icon} ${info?.title}`)
    }
  if (g.grades.length < 6) tags.push(gradesLabel(g.grades))
  return (
    <div className="game-card-wrap">
      <button
        className="game-card"
        style={{ '--tint': g.color } as React.CSSProperties}
        onClick={onOpen}
      >
        <span className="game-card-icon" aria-hidden>
          {g.icon}
        </span>
        <span className="game-card-title">{g.title}</span>
        <span className="game-card-desc">{g.description}</span>
        <span className="tags">
          {tags.map((t) => (
            <span key={t} className="tag">
              {t}
            </span>
          ))}
        </span>
      </button>
      <button
        className={`star-btn ${fav ? 'on' : ''}`}
        aria-pressed={fav}
        aria-label={fav ? `Quitar de favoritos: ${g.title}` : `Agregar a favoritos: ${g.title}`}
        title={fav ? 'Quitar de favoritos' : 'Agregar a favoritos'}
        onClick={onToggle}
      >
        {fav ? '★' : '☆'}
      </button>
    </div>
  )
}

/* ---------- El juego abierto ---------- */

function GameFrame({ game }: { game: Game }): React.JSX.Element {
  const { go, patch } = useNav()
  const chrome = useChromeState()
  const { opened } = useLastGame()
  // Pila de encabezados: una pantalla de adentro (como «Elegir las preguntas») cambia el título y el botón de volver
  const [stack, setStack] = useState<[string, HeaderOverride][]>([])
  const setOverride = useCallback((key: string, value: HeaderOverride | null): void => {
    setStack((s) => {
      const at = s.findIndex(([k]) => k === key)
      if (!value) return at < 0 ? s : s.filter(([k]) => k !== key)
      if (at < 0) return [...s, [key, value]]
      return s.map((e, i) => (i === at ? [key, value] : e))
    })
  }, [])
  const override = stack.length ? stack[stack.length - 1][1] : null

  useEffect(() => {
    opened(game.id)
  }, [opened, game.id])

  const back = (): void => {
    patch({ gameId: null, quickPlay: false })
    go({ page: 'games' })
  }

  return (
    <ToolHeaderContext.Provider value={setOverride}>
      <div
        className={`game-frame ${chrome.sidebar ? 'with-sidebar' : 'full'}`}
        style={{ '--accent': game.color } as React.CSSProperties}
      >
        {(!chrome.ownHeader || override) && (
          <header className="game-head">
            <button className="btn secondary small" onClick={override ? override.onBack : back}>
              {override ? override.backLabel : '← Juegos'}
            </button>
            <span
              className="game-head-icon"
              style={{ '--tint': game.color } as React.CSSProperties}
              aria-hidden
            >
              {override?.icon ?? game.icon}
            </span>
            <div className="game-head-text">
              <h1>{override ? override.title : game.title}</h1>
              <p>{override ? override.description : game.description}</p>
            </div>
          </header>
        )}
        <GameInfoContext.Provider value={{ id: game.id, title: game.title }}>
          <Suspense fallback={<p className="muted">Cargando…</p>}>
            <game.Component />
          </Suspense>
        </GameInfoContext.Provider>
      </div>
    </ToolHeaderContext.Provider>
  )
}
