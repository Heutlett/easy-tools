import './musica.css'
import { useMemo } from 'react'
import Scoreboard from '../../components/games/Scoreboard'
import type { Player } from '../../lib/games/players'
import { audioAvailable } from './synth'
import type { useRun } from './hooks'

/** Aviso discreto si el equipo no tiene audio */
export function AudioNotice(): React.JSX.Element | null {
  const ok = useMemo(() => audioAvailable(), [])
  if (ok) return null
  return (
    <p className="notice mus-audio-notice">
      🔇 No se encontró audio en este equipo: el juego se ve igual, pero no sonará.
    </p>
  )
}

export interface Choice<T> {
  value: T
  label: string
  /** Texto pequeño bajo la opción */
  hint?: string
}

/** Una fila de opciones con título (botones tipo «pastilla») */
export function PillRow<T extends string | number>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: Choice<T>[]
  onChange: (v: T) => void
}): React.JSX.Element {
  return (
    <div className="mus-pillrow">
      <span className="panel-title">{label}</span>
      <div className="pills" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            className={`pill ${o.value === value ? 'selected' : ''}`}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
            {o.hint && <small className="mus-pill-hint">{o.hint}</small>}
          </button>
        ))}
      </div>
    </div>
  )
}

/** Barra de arriba durante la partida: número de pregunta, a quién le toca y salir */
export function TopBar({
  index,
  total,
  current,
  points,
  onExit,
  children
}: {
  index: number
  total: number
  current?: Player
  points?: number
  onExit: () => void
  children?: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="mus-topbar">
      <span className="g-badge">
        {index + 1} / {total}
      </span>
      {current && (
        <span
          className="g-badge mus-turn"
          style={{ background: `color-mix(in srgb, ${current.color} 18%, white)` }}
        >
          Turno: {current.emoji} {current.name}
        </span>
      )}
      {!current && points !== undefined && <span className="g-badge">⭐ {points}</span>}
      {children}
      <span className="mus-spacer" />
      <button className="btn secondary small" onClick={onExit}>
        Salir
      </button>
    </div>
  )
}

/** Marcador para equipos (con − y +) debajo de la partida */
export function TeamScores({
  players,
  run
}: {
  players: Player[]
  run: ReturnType<typeof useRun>
}): React.JSX.Element | null {
  if (!players.length) return null
  return (
    <Scoreboard
      players={players}
      scores={run.scores}
      onAdd={run.add}
      currentId={run.current?.id}
      compact
    />
  )
}

/** Pantalla final con resultado, marcador y botones para repetir o cambiar los ajustes */
export function EndScreen({
  players,
  run,
  summary,
  onAgain,
  onChange,
  changeLabel = 'Cambiar ajustes',
  children
}: {
  players: Player[]
  run: ReturnType<typeof useRun>
  /** Texto del resultado cuando no hay equipos */
  summary: string
  onAgain: () => void
  onChange: () => void
  changeLabel?: string
  children?: React.ReactNode
}): React.JSX.Element {
  const { leaders, ranking, scores } = run
  return (
    <div className="g-stage g-center mus-end">
      <p className="g-win">🎉 ¡Terminamos!</p>
      {players.length > 0 ? (
        <>
          <p className="mus-winner">
            {leaders.length === 1
              ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
              : leaders.length > 1
                ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                : 'Nadie sumó puntos'}
          </p>
          <Scoreboard players={ranking} scores={scores} />
        </>
      ) : (
        <p className="mus-winner">{summary}</p>
      )}
      {children}
      <div className="row start">
        <button className="btn big" onClick={onAgain}>
          Jugar otra vez
        </button>
        <button className="btn secondary" onClick={onChange}>
          {changeLabel}
        </button>
      </div>
    </div>
  )
}
