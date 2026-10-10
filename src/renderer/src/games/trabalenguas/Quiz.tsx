import { useState } from 'react'
import EndScreen from '../_lengua/EndScreen'
import { useGameKeys } from '../_lengua/useGameKeys'
import { useTurns } from '../_lengua/useTurns'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { useVoice } from '../../lib/games/useVoice'

export interface QuizItem {
  /** Lo que se muestra arriba (la palabra, el verso…) */
  prompt: React.ReactNode
  /** Texto de la insignia, por ejemplo «Rima consonante» */
  badge: string
  options: string[]
  answer: number
  /** Explicación al revelar la respuesta */
  note: string
  /** Texto para leer en voz alta antes de responder */
  speak?: string
  /** Texto para leer en voz alta después de responder */
  speakAfter?: string
}

interface Props {
  items: QuizItem[]
  players: Player[]
  onExit: () => void
  /** Volver a armar las preguntas */
  onAgain: () => void
  exitLabel: string
}

const LETTERS = ['A', 'B', 'C', 'D']

/** Una ronda de preguntas de opción única, con turnos y marcador si hay equipos. */
export default function Quiz({
  items,
  players,
  onExit,
  onAgain,
  exitLabel
}: Props): React.JSX.Element {
  const voice = useVoice('es')
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const turns = useTurns(players)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const [finished, setFinished] = useState(false)
  const item = items[index]

  const choose = (i: number): void => {
    if (picked !== null || !item || i >= item.options.length) return
    setPicked(i)
    if (i === item.answer) {
      sfx.correct()
      setHits((h) => h + 1)
      if (turns.current) add(turns.current.id, 1)
    } else sfx.wrong()
    if (item.speakAfter) voice.speak(item.speakAfter)
  }

  const next = (): void => {
    if (picked === null) return
    voice.stop()
    turns.next()
    if (index + 1 < items.length) {
      setIndex(index + 1)
      setPicked(null)
    } else {
      setFinished(true)
      sfx.win()
    }
  }

  useGameKeys({ onOption: choose, onNext: next }, !finished)

  const again = (): void => {
    reset()
    turns.reset()
    setIndex(0)
    setPicked(null)
    setHits(0)
    setFinished(false)
    onAgain()
  }

  if (finished) {
    return (
      <EndScreen
        players={players}
        scores={scores}
        ranking={ranking}
        leaders={leaders}
        summary={`${hits} de ${items.length} bien`}
        onAgain={again}
        againLabel="Otra ronda"
        onExit={onExit}
        exitLabel={exitLabel}
      />
    )
  }

  const revealed = picked !== null
  return (
    <div className="g-stage tw-quiz">
      <div className="ln-bar">
        <div className="ln-bar-left">
          <span className="g-badge">
            {index + 1} / {items.length}
          </span>
          <span className="g-badge">{item.badge}</span>
          {turns.current && (
            <span
              className="ln-turn"
              style={{ '--team': turns.current.color } as React.CSSProperties}
            >
              {turns.current.emoji} Turno de {turns.current.name}
            </span>
          )}
        </div>
        <div className="ln-bar-left">
          {voice.available && item.speak && (
            <button
              className="btn secondary small"
              onClick={() => voice.speak(item.speak as string)}
            >
              🔊 Escuchar
            </button>
          )}
          <button className="btn secondary small" onClick={onExit}>
            Salir
          </button>
        </div>
      </div>

      <div className="g-question tw-prompt">{item.prompt}</div>

      <div className="g-options tw-options" role="group" aria-label="Opciones">
        {item.options.map((option, i) => (
          <button
            key={`${index}-${option}`}
            className={`g-option ${
              revealed ? (i === item.answer ? 'correct' : i === picked ? 'wrong' : 'dim') : ''
            }`}
            disabled={revealed}
            onClick={() => choose(i)}
          >
            <span className="g-letter">{LETTERS[i]}</span>
            {option}
          </button>
        ))}
      </div>

      <div className="tw-after">
        {revealed ? (
          <>
            <p className="tw-note">
              {picked === item.answer ? '✅ ' : '❌ '}
              {item.note}
            </p>
            <button className="btn big" onClick={next}>
              {index + 1 < items.length ? 'Siguiente →' : 'Terminar'}
            </button>
          </>
        ) : (
          <p className="muted">Elijan una opción (también con las teclas A, B, C y D)</p>
        )}
      </div>

      {players.length > 0 && (
        <Scoreboard
          players={players}
          scores={scores}
          onAdd={add}
          currentId={turns.current?.id}
          compact
        />
      )}
    </div>
  )
}
