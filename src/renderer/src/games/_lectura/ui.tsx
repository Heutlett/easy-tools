import './lectura.css'
import Scoreboard from '../../components/games/Scoreboard'
import type { Player } from '../../lib/games/players'

/** Una fila de opciones del menú inicial: título a la izquierda y botones a la derecha */
export function OptionRow({
  label,
  hint,
  children
}: {
  label: string
  hint?: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="lec-opt">
      <div className="lec-opt-label">
        {label}
        {hint && <span className="lec-opt-hint">{hint}</span>}
      </div>
      <div className="pills" role="group" aria-label={label}>
        {children}
      </div>
    </div>
  )
}

export function Choice({
  selected,
  disabled,
  onClick,
  children,
  title
}: {
  selected: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  title?: string
}): React.JSX.Element {
  return (
    <button
      className={`pill lec-pill ${selected ? 'selected' : ''}`}
      aria-pressed={selected}
      disabled={disabled}
      title={title}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

const CONFETTI = ['🎉', '⭐', '👏', '✨', '🎊', '🌟']

/** Lluvia corta de emojis cuando se acierta (decorativa) */
export function Burst(): React.JSX.Element {
  return (
    <div className="lec-burst" aria-hidden>
      {Array.from({ length: 14 }, (_, i) => (
        <span
          key={i}
          style={{
            left: `${4 + i * 7}%`,
            animationDelay: `${(i % 5) * 0.08}s`,
            fontSize: `${1.6 + (i % 3) * 0.5}rem`
          }}
        >
          {CONFETTI[i % CONFETTI.length]}
        </span>
      ))}
    </div>
  )
}

/** Pantalla final con el resultado y el marcador */
export function EndScreen({
  title = '🎉 ¡Terminamos!',
  lines,
  players,
  scores,
  ranking,
  leaders,
  onAgain,
  onExit,
  againLabel = 'Jugar otra vez',
  exitLabel = 'Cambiar opciones'
}: {
  title?: string
  lines: string[]
  players: Player[]
  scores: Record<string, number>
  ranking: Player[]
  leaders: Player[]
  onAgain: () => void
  onExit: () => void
  againLabel?: string
  exitLabel?: string
}): React.JSX.Element {
  return (
    <div className="g-stage g-center lec-end">
      <p className="g-win">{title}</p>
      {players.length > 0 && (
        <p className="lec-winner">
          {leaders.length === 1
            ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
            : leaders.length > 1
              ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
              : 'Nadie sumó puntos'}
        </p>
      )}
      {lines.map((l) => (
        <p key={l} className="lec-end-line">
          {l}
        </p>
      ))}
      {players.length > 0 && <Scoreboard players={ranking} scores={scores} />}
      <div className="row start">
        <button className="btn big" onClick={onAgain}>
          {againLabel}
        </button>
        <button className="btn secondary" onClick={onExit}>
          {exitLabel}
        </button>
      </div>
    </div>
  )
}

/** Barra de arriba con el avance, quién juega y el botón de salir */
export function TopBar({
  progress,
  turn,
  onExit,
  children
}: {
  progress: string
  turn?: Player
  onExit: () => void
  children?: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="lec-top">
      <span className="g-badge">{progress}</span>
      {turn && (
        <span className="lec-turn" style={{ borderColor: turn.color, color: turn.color }}>
          Turno: {turn.emoji} {turn.name}
        </span>
      )}
      <span className="lec-top-right">
        {children}
        <button className="btn secondary small" onClick={onExit}>
          Salir
        </button>
      </span>
    </div>
  )
}
