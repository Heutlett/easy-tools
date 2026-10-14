import { useEffect, useState } from 'react'
import EndScreen from '../_lengua/EndScreen'
import { useGameKeys } from '../_lengua/useGameKeys'
import { useTurns } from '../_lengua/useTurns'
import Scoreboard from '../../components/games/Scoreboard'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { useCountdown } from '../../lib/games/useCountdown'
import type { Item } from './engine'
import { ruleSummary, ruleTitle, type RuleId } from './rules'

const LETTERS = ['A', 'B', 'C', 'D']

interface Props {
  items: Item[]
  players: Player[]
  /** Segundos por pregunta; 0 = sin tiempo */
  seconds: number
  onAgain: () => void
  onExit: () => void
}

/** Muestra el enunciado con el espacio en blanco como un recuadro */
function Prompt({ item, filled }: { item: Item; filled: boolean }): React.JSX.Element {
  if (item.prompt === '') return <span className="or-hint-only" />
  const parts = item.prompt.split('__')
  return (
    <span className="or-prompt">
      {parts.map((part, i) => (
        <span key={i}>
          {part}
          {i < parts.length - 1 && (
            <span className={`or-blank ${filled ? 'filled' : ''}`}>
              {filled ? item.options[item.answer].replace('sin h', '') || '·' : ' '}
            </span>
          )}
        </span>
      ))}
    </span>
  )
}

export default function Round({
  items,
  players,
  seconds,
  onAgain,
  onExit
}: Props): React.JSX.Element {
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const turns = useTurns(players)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [hits, setHits] = useState(0)
  const [finished, setFinished] = useState(false)
  const [missed, setMissed] = useState<{ rule: RuleId; example: string }[]>([])
  const item = items[index]

  const timeout = (): void => {
    setPicked(-1)
    setMissed((m) => [...m, { rule: item.rule, example: item.example }])
  }
  const countdown = useCountdown({ onEnd: timeout, ticks: true })
  const { start: startCountdown } = countdown
  useEffect(() => {
    if (seconds > 0) startCountdown(seconds)
  }, [seconds, startCountdown])

  const choose = (i: number): void => {
    if (picked !== null || i >= item.options.length) return
    countdown.stop()
    setPicked(i)
    if (i === item.answer) {
      sfx.correct()
      setHits((h) => h + 1)
      if (turns.current) add(turns.current.id, 1)
    } else {
      sfx.wrong()
      setMissed((m) => [...m, { rule: item.rule, example: item.example }])
    }
  }

  const next = (): void => {
    if (picked === null) return
    turns.next()
    if (index + 1 < items.length) {
      setIndex(index + 1)
      setPicked(null)
      if (seconds > 0) countdown.start(seconds)
    } else {
      setFinished(true)
      sfx.win()
    }
  }

  useGameKeys({ onOption: choose, onNext: next }, !finished)

  if (finished) {
    // Reglas que más se fallaron
    const byRule = new Map<RuleId, string[]>()
    for (const m of missed) byRule.set(m.rule, [...(byRule.get(m.rule) ?? []), m.example])
    const worst = [...byRule].sort((a, b) => b[1].length - a[1].length).slice(0, 4)
    return (
      <EndScreen
        title={hits === items.length ? '🌟 ¡Perfecto!' : '🎉 ¡Terminamos!'}
        players={players}
        scores={scores}
        ranking={ranking}
        leaders={leaders}
        summary={`${hits} de ${items.length} bien`}
        onAgain={() => {
          reset()
          turns.reset()
          onAgain()
        }}
        againLabel="Otra ronda"
        onExit={onExit}
        exitLabel="Cambiar reglas"
      >
        {players.length > 0 && (
          <p className="muted">
            {hits} de {items.length} respuestas correctas
          </p>
        )}
        {worst.length > 0 ? (
          <div className="or-worst">
            <p className="ln-field-title">Para repasar</p>
            {worst.map(([rule, examples]) => (
              <div key={rule} className="or-worst-item">
                <strong>
                  {ruleTitle(rule)} <span className="muted">({examples.length})</span>
                </strong>
                <span>{ruleSummary(rule)}</span>
                <span className="muted">
                  Ejemplos: {[...new Set(examples)].slice(0, 3).join(', ')}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="ln-winner">¡Sin errores!</p>
        )}
      </EndScreen>
    )
  }

  const revealed = picked !== null
  const small = item.options.length <= 3
  const low = seconds > 0 && countdown.seconds <= 3
  return (
    <div className="g-stage or-round">
      <div className="ln-bar">
        <div className="ln-bar-left">
          <span className="g-badge">
            {index + 1} / {items.length}
          </span>
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
          {seconds > 0 && !revealed && (
            <span className={`g-timer ${low ? 'low' : ''}`} aria-label="Tiempo">
              {countdown.running ? countdown.seconds : seconds}
            </span>
          )}
          <button className="btn secondary small" onClick={onExit}>
            Salir
          </button>
        </div>
      </div>

      <div className="g-question or-card">
        <span className="or-instruction">{item.hint}</span>
        {item.emoji && (
          <span className="or-emoji" aria-hidden>
            {item.emoji}
          </span>
        )}
        <Prompt item={item} filled={revealed && item.options.length > 0} />
      </div>

      <div
        className={`g-options or-options ${small ? 'or-small' : ''}`}
        role="group"
        aria-label="Opciones"
      >
        {item.options.map((option, i) => (
          <button
            key={`${index}-${i}`}
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

      <div className="or-after">
        {revealed ? (
          <>
            <div className="or-why">
              <p className="or-verdict">
                {picked === item.answer
                  ? '✅ ¡Muy bien!'
                  : picked === -1
                    ? '⏰ Se acabó el tiempo.'
                    : '❌ Casi.'}{' '}
                <strong>{item.example}</strong>
              </p>
              <p className="or-rule">📌 {item.why}</p>
            </div>
            <button className="btn big" onClick={next}>
              {index + 1 < items.length ? 'Siguiente →' : 'Ver el resultado'}
            </button>
          </>
        ) : (
          <p className="muted ln-hint">Elijan una opción (también con las teclas A, B, C y D)</p>
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
