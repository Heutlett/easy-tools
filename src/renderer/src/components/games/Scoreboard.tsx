import './games.css'
import type { Player } from '../../lib/games/players'

interface Props {
  players: Player[]
  scores: Record<string, number>
  /** Si se da, aparecen los botones − y + de cada jugador */
  onAdd?: (id: string, delta: number) => void
  /** Cuánto suma el botón + (por defecto 1) */
  step?: number
  /** Jugador al que le toca (se resalta) */
  currentId?: string
  /** Marcador angosto para ponerlo en una esquina */
  compact?: boolean
}

/** Marcador de equipos o estudiantes, grande para proyectar. */
export default function Scoreboard({
  players,
  scores,
  onAdd,
  step = 1,
  currentId,
  compact
}: Props): React.JSX.Element {
  const top = Math.max(0, ...players.map((p) => scores[p.id] ?? 0))
  return (
    <div className={`scoreboard ${compact ? 'compact' : ''}`} role="list" aria-label="Marcador">
      {players.map((p) => {
        const score = scores[p.id] ?? 0
        return (
          <div
            key={p.id}
            role="listitem"
            className={`score-card ${p.id === currentId ? 'current' : ''} ${top > 0 && score === top ? 'leader' : ''}`}
            style={{ '--team': p.color } as React.CSSProperties}
          >
            <span className="score-name">
              <span aria-hidden>{p.emoji}</span> {p.name}
            </span>
            <span className="score-value" aria-live="polite">
              {score}
            </span>
            {onAdd && (
              <span className="score-actions">
                <button
                  className="icon-btn"
                  aria-label={`Quitar ${step} a ${p.name}`}
                  disabled={score === 0}
                  onClick={() => onAdd(p.id, -step)}
                >
                  −
                </button>
                <button
                  className="icon-btn plus"
                  aria-label={`Sumar ${step} a ${p.name}`}
                  onClick={() => onAdd(p.id, step)}
                >
                  +
                </button>
              </span>
            )}
          </div>
        )
      })}
    </div>
  )
}
