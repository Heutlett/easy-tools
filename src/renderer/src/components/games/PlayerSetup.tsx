import './games.css'
import {
  usePlayerChoice,
  type PlayerChoice,
  type PlayerChoiceOptions,
  type Who
} from '../../lib/games/playerChoice'
import { TEAM_STYLES, defaultTeamName, type Player } from '../../lib/games/players'

const WHO_OPTIONS: { id: Who; icon: string; title: string; sub: string }[] = [
  {
    id: 'class',
    icon: '🏫',
    title: 'Toda la clase',
    sub: 'Una sola partida. La clase decide junta.'
  },
  { id: 'teams', icon: '👥', title: 'Equipos', sub: 'De 2 a 8 equipos que van pasando.' },
  {
    id: 'students',
    icon: '🙋',
    title: 'Estudiantes de mi grupo',
    sub: 'Uno por uno. Cuenta para el ranking.'
  }
]

/** Las tres decisiones de «¿Quién juega?» en una sola pantalla: tarjetas y, debajo, el detalle de la elegida. */
export function PlayerPicker({ choice }: { choice: PlayerChoice }): React.JSX.Element {
  const { who, options, groups, group } = choice
  const offered = WHO_OPTIONS.filter((o) => o.id !== 'class' || options.optional)
  const counts = Array.from({ length: options.limit - options.min + 1 }, (_, i) => options.min + i)

  return (
    <div className="player-picker">
      <div className={`who-cards n${offered.length}`} role="radiogroup" aria-label="Quiénes juegan">
        {offered.map((o) => (
          <button
            key={o.id}
            className={`who-card ${who === o.id ? 'on' : ''}`}
            role="radio"
            aria-checked={who === o.id}
            onClick={() => choice.setWho(o.id)}
          >
            <span className="who-icon" aria-hidden>
              {o.icon}
            </span>
            <b>{o.title}</b>
            <span>{o.sub}</span>
          </button>
        ))}
      </div>

      {who === 'teams' && (
        <div className="who-detail">
          <div className="who-line">
            <b>¿Cuántos equipos?</b>
            <div className="segmented" role="group" aria-label="Cantidad de equipos">
              {counts.map((n) => (
                <button
                  key={n}
                  className={choice.teamCount === n ? 'on' : ''}
                  aria-pressed={choice.teamCount === n}
                  onClick={() => choice.setTeamCount(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
          <div className="team-chips">
            {Array.from({ length: choice.teamCount }, (_, i) => (
              <label key={i} className="team-chip" style={{ borderColor: TEAM_STYLES[i].color }}>
                <span className="team-chip-emoji" aria-hidden>
                  {TEAM_STYLES[i].emoji}
                </span>
                <input
                  value={choice.teamNames[i] ?? ''}
                  placeholder={defaultTeamName(i)}
                  aria-label={`Nombre del equipo ${i + 1}`}
                  maxLength={24}
                  onChange={(e) => {
                    const next = [...choice.teamNames]
                    next[i] = e.target.value
                    choice.setTeamNames(next)
                  }}
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {who === 'students' &&
        (groups.length === 0 || !group ? (
          <div className="who-detail">
            <p className="muted">
              Todavía no tienes grupos. Créalos en «Mi clase → Estudiantes» y vuelve aquí.
            </p>
          </div>
        ) : (
          <div className="who-detail">
            <div className="who-line">
              <b>Grupo</b>
              <div className="chips" role="group" aria-label="Grupo">
                {groups.map((g) => (
                  <button
                    key={g.id}
                    className={`chip ${g.id === group.id ? 'on' : ''}`}
                    aria-pressed={g.id === group.id}
                    onClick={() => choice.setGroupId(g.id)}
                  >
                    {g.name || 'Sin nombre'} ({g.students.length})
                  </button>
                ))}
              </div>
              <span className="muted">Toca a quien no vino hoy</span>
            </div>
            <div className="chips" role="group" aria-label="Estudiantes">
              {group.students.map((s) => {
                const out = choice.excluded.includes(s.id)
                return (
                  <button
                    key={s.id}
                    className={`chip student ${out ? 'out' : 'here'}`}
                    aria-pressed={!out}
                    onClick={() =>
                      choice.setExcluded(
                        out ? choice.excluded.filter((x) => x !== s.id) : [...choice.excluded, s.id]
                      )
                    }
                  >
                    {out ? '✕' : '✓'} {s.name}
                  </button>
                )
              })}
            </div>
            {choice.chosen.length < options.min && (
              <p className="notice">Elige al menos {options.min} estudiantes.</p>
            )}
            {choice.chosen.length > options.studentLimit && (
              <p className="notice">
                Este juego admite hasta {options.studentLimit}: se usarán los primeros.
              </p>
            )}
          </div>
        ))}
    </div>
  )
}

interface Props extends PlayerChoiceOptions {
  /** Texto del botón para empezar */
  startLabel?: string
  onStart: (players: Player[]) => void
}

/**
 * Pantalla para armar los jugadores: toda la clase, equipos con nombre y color, o estudiantes de uno de los grupos guardados.
 * La elección se recuerda para la próxima vez.
 */
export default function PlayerSetup({
  startLabel = 'Empezar',
  onStart,
  ...options
}: Props): React.JSX.Element {
  const choice = usePlayerChoice(options)
  return (
    <section className="player-setup">
      <PlayerPicker choice={choice} />
      <div className="row start">
        <button
          className="btn big"
          disabled={choice.players === null}
          onClick={() => choice.players && onStart(choice.players)}
        >
          {startLabel}
        </button>
      </div>
    </section>
  )
}
