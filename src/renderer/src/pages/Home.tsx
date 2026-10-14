import { useState } from 'react'
import ComponentsBanner from '../components/ComponentsBanner'
import { SUBJECTS } from '../content/subjects'
import { games } from '../games/registry'
import { HELP } from '../help/topics'
import { useLastGame } from '../lib/games/lastGame'
import { useNav, type Place } from '../lib/nav'
import { matchesQuery } from '../lib/search'
import { categories } from '../tools/categories'
import { tools } from '../tools/registry'
import ToolIcon from '../components/ToolIcon'

/** Los cuatro accesos de «Para la clase, ahora mismo» */
const QUICK: { icon: string; title: string; sub: string; color: string; to: Partial<Place> }[] = [
  {
    icon: '⏱️',
    title: 'Temporizador',
    sub: 'Cuenta regresiva grande para todo el grupo.',
    color: '#f2b632',
    to: { page: 'aula', aulaTab: 'timer' }
  },
  {
    icon: '🎡',
    title: 'Ruleta',
    sub: 'Elige al azar a quién le toca.',
    color: '#e46aa8',
    to: { page: 'aula', aulaTab: 'wheel' }
  },
  {
    icon: '🎲',
    title: 'Número al azar',
    sub: 'Por ejemplo, el número de lista.',
    color: '#3b8fd9',
    to: { page: 'aula', aulaTab: 'number' }
  },
  {
    icon: '⭐',
    title: 'Dar puntos',
    sub: 'Premia la participación del grupo.',
    color: '#4fae6a',
    to: { page: 'class', classTab: 'points' }
  }
]

/** Lo que se busca en el inicio y vive en «En el aula» o «Mi clase» */
const CLASSROOM: {
  icon: string
  title: string
  description: string
  color: string
  to: Partial<Place>
}[] = [
  ...tools
    .filter((t) => t.category === 'classroom')
    .map((t) => ({
      icon: t.icon,
      title: t.title,
      description: t.description,
      color: t.color,
      to: {
        page: 'aula' as const,
        aulaTab:
          t.id === 'timer'
            ? ('timer' as const)
            : t.id === 'wheel'
              ? ('wheel' as const)
              : ('number' as const)
      }
    })),
  {
    icon: '⭐',
    title: 'Puntos y ranking',
    description: 'Da puntos a mano a tus estudiantes y mira el ranking de los juegos.',
    color: '#4fae6a',
    to: { page: 'class', classTab: 'points' }
  },
  {
    icon: '👥',
    title: 'Lista de estudiantes',
    description: 'Guarda los nombres de tus grupos para usarlos en la ruleta y los puntos.',
    color: '#4fae6a',
    to: { page: 'class', classTab: 'students' }
  }
]

const today = (): string => {
  const text = new Date().toLocaleDateString('es-CR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Inicio: seguir con lo último, accesos rápidos para la clase, los juegos por materia y los materiales. */
export default function Home(): React.JSX.Element {
  const { go } = useNav()
  const { last } = useLastGame()
  const [query, setQuery] = useState('')
  const lastGame = games.find((g) => g.id === last?.id)
  const searching = query.trim() !== ''

  return (
    <div className="page home-page">
      <ComponentsBanner />
      <header className="page-head">
        <div>
          <p className="page-date">{today()}</p>
          <h1>¡Hola, profe! ¿Qué hacemos hoy?</h1>
        </div>
        <input
          className="search"
          type="search"
          value={query}
          placeholder="🔍 Buscar juego o herramienta"
          aria-label="Buscar un juego o una herramienta"
          onChange={(e) => setQuery(e.target.value)}
        />
      </header>

      {searching ? (
        <SearchResults query={query} onClear={() => setQuery('')} />
      ) : (
        <>
          {lastGame && (
            <section className="resume" aria-label="Seguir donde quedaste">
              <span
                className="resume-icon"
                style={{ '--tint': lastGame.color } as React.CSSProperties}
                aria-hidden
              >
                {lastGame.icon}
              </span>
              <div className="resume-text">
                <p className="kicker">Seguir donde quedaste</p>
                <p className="resume-title">{lastGame.title}</p>
                <p className="resume-meta">{last?.summary ?? lastGame.description}</p>
              </div>
              {last?.quick ? (
                <>
                  <button
                    className="btn"
                    onClick={() => go({ page: 'games', gameId: lastGame.id, quickPlay: true })}
                  >
                    ▶ Jugar otra vez
                  </button>
                  <button
                    className="btn secondary"
                    onClick={() => go({ page: 'games', gameId: lastGame.id })}
                  >
                    Cambiar algo
                  </button>
                </>
              ) : (
                <button className="btn" onClick={() => go({ page: 'games', gameId: lastGame.id })}>
                  ▶ Abrir
                </button>
              )}
            </section>
          )}

          <section className="block">
            <h2>Para la clase, ahora mismo</h2>
            <div className="quick-grid">
              {QUICK.map((q) => (
                <button
                  key={q.title}
                  className="quick-card"
                  style={{ '--c': q.color } as React.CSSProperties}
                  onClick={() => go(q.to as Place)}
                >
                  <span className="quick-icon" aria-hidden>
                    {q.icon}
                  </span>
                  <b>{q.title}</b>
                  <span>{q.sub}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="games-banner">
            <div className="games-banner-text">
              <p className="games-banner-title">🎮 {games.length} juegos para proyectar en clase</p>
              <p>Con equipos, marcador y ranking. ¿De qué materia?</p>
              <div className="games-banner-chips">
                {SUBJECTS.map((s) => (
                  <button key={s.id} onClick={() => go({ page: 'games', subject: s.id })}>
                    {s.icon} {s.title}
                  </button>
                ))}
              </div>
            </div>
            <button className="games-banner-cta" onClick={() => go({ page: 'games' })}>
              Ver todos →
            </button>
          </section>

          <section className="block">
            <h2>Preparar materiales</h2>
            <div className="material-grid">
              {categories.map((c) => (
                <button
                  key={c.id}
                  className="material-card"
                  style={{ '--c': c.color } as React.CSSProperties}
                  onClick={() => go({ page: 'files' })}
                >
                  <span className="material-icon" aria-hidden>
                    {c.icon}
                  </span>
                  <span className="material-text">
                    <b>{c.title}</b>
                    <span>
                      {tools
                        .filter((t) => t.category === c.id)
                        .map((t) => t.title)
                        .join(' · ')}
                    </span>
                  </span>
                </button>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}

/** Lo que se encontró al escribir en el buscador del inicio: juegos, herramientas y ayuda */
function SearchResults({
  query,
  onClear
}: {
  query: string
  onClear: () => void
}): React.JSX.Element {
  const { go } = useNav()
  const foundGames = games.filter((g) =>
    matchesQuery(query, g.title, g.description, ...(g.keywords ?? []))
  )
  const foundTools = tools.filter(
    (t) => t.category !== 'classroom' && matchesQuery(query, t.title, t.description)
  )
  // Lo del aula y de «Mi clase» no son archivos: cada cosa lleva a su pestaña
  const foundClassroom = CLASSROOM.filter((c) => matchesQuery(query, c.title, c.description))
  const foundHelp = HELP.filter((h) =>
    matchesQuery(query, h.question, ...(h.keywords ?? []))
  ).slice(0, 3)
  const nothing =
    foundGames.length + foundTools.length + foundClassroom.length + foundHelp.length === 0

  return (
    <div className="search-results">
      {foundGames.length > 0 && (
        <section className="block">
          <h2>🎮 Juegos</h2>
          <div className="result-list">
            {foundGames.map((g) => (
              <button
                key={g.id}
                className="result-item"
                onClick={() => go({ page: 'games', gameId: g.id })}
              >
                <span
                  className="result-icon"
                  style={{ '--tint': g.color } as React.CSSProperties}
                  aria-hidden
                >
                  {g.icon}
                </span>
                <span>
                  <b>{g.title}</b>
                  <small>{g.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {(foundClassroom.length > 0 || foundTools.length > 0) && (
        <section className="block">
          <h2>🧰 Herramientas</h2>
          <div className="result-list">
            {foundClassroom.map((t) => (
              <button key={t.title} className="result-item" onClick={() => go(t.to as Place)}>
                <span
                  className="result-icon"
                  style={{ '--tint': t.color } as React.CSSProperties}
                  aria-hidden
                >
                  {t.icon}
                </span>
                <span>
                  <b>{t.title}</b>
                  <small>{t.description}</small>
                </span>
              </button>
            ))}
            {foundTools.map((t) => (
              <button
                key={t.id}
                className="result-item"
                onClick={() => go({ page: 'files', fileTool: t.id })}
              >
                <span
                  className="result-icon"
                  style={{ '--tint': t.color } as React.CSSProperties}
                  aria-hidden
                >
                  <ToolIcon tool={t} small />
                </span>
                <span>
                  <b>{t.title}</b>
                  <small>{t.description}</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {foundHelp.length > 0 && (
        <section className="block">
          <h2>❓ Ayuda</h2>
          <div className="result-list">
            {foundHelp.map((h) => (
              <button
                key={h.id}
                className="result-item"
                onClick={() => go({ page: 'help', helpTopic: h.id })}
              >
                <span className="result-icon" aria-hidden>
                  {h.icon}
                </span>
                <span>
                  <b>{h.question}</b>
                  <small>Ver cómo →</small>
                </span>
              </button>
            ))}
          </div>
        </section>
      )}
      {nothing && (
        <div className="empty-box">
          No encontré nada para «{query.trim()}».{' '}
          <button onClick={onClear}>Borrar la búsqueda</button>
        </div>
      )}
    </div>
  )
}
