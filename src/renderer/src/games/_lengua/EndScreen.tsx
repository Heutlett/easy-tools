import './lengua.css'
import Scoreboard from '../../components/games/Scoreboard'
import type { Player } from '../../lib/games/players'

interface Props {
  /** Texto principal, por ejemplo «¡Terminamos!» */
  title?: string
  /** Resultado de la clase cuando no hay equipos («8 de 10») */
  summary?: React.ReactNode
  players: Player[]
  scores: Record<string, number>
  ranking: (Player & { score: number })[]
  leaders: Player[]
  children?: React.ReactNode
  onAgain: () => void
  againLabel?: string
  onExit: () => void
  exitLabel?: string
}

/** Pantalla final: resultado, marcador y botones para repetir o salir. */
export default function EndScreen({
  title = '🎉 ¡Terminamos!',
  summary,
  players,
  scores,
  ranking,
  leaders,
  children,
  onAgain,
  againLabel = 'Jugar otra vez',
  onExit,
  exitLabel = 'Cambiar de actividad'
}: Props): React.JSX.Element {
  return (
    <div className="g-stage g-center ln-end">
      <p className="g-win">{title}</p>
      {players.length > 0 ? (
        <>
          <p className="ln-winner">
            {leaders.length === 1
              ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
              : leaders.length > 1
                ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                : 'Nadie sumó puntos'}
          </p>
          <Scoreboard players={ranking} scores={scores} />
        </>
      ) : (
        summary && <p className="ln-winner">{summary}</p>
      )}
      {children}
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
