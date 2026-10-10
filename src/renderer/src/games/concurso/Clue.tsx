import { useEffect, useMemo, useState } from 'react'
import { gradeLabel, subjectOf } from '../../content/subjects'
import { shuffleOptions } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import type { Player } from '../../lib/games/players'
import { useCountdown } from '../../lib/games/useCountdown'
import type { Cell, Column, Settings } from './board'

type Stage = 'bet' | 'ask' | 'steal' | 'done'

interface Props {
  category: Column['category']
  cell: Cell
  players: Player[]
  asker: Player
  answerer: string
  setAnswerer: (id: string) => void
  scores: Record<string, number>
  settings: Settings
  onScore: (id: string, delta: number) => void
  /** Se terminó la pregunta: quién acertó (o nadie) */
  onDone: (winner: string | null) => void
  /** Volver al tablero sin gastar la casilla */
  onCancel: () => void
}

const BETS = [100, 200, 300, 400, 500]

/** La pregunta de una casilla: apuesta (si es «Doble o nada»), respuesta, robo y resultado */
export default function Clue({
  category,
  cell,
  players,
  asker,
  answerer,
  setAnswerer,
  scores,
  settings,
  onScore,
  onDone,
  onCancel
}: Props): React.JSX.Element {
  const options = useMemo(() => shuffleOptions(cell.question), [cell.question])
  const [stage, setStage] = useState<Stage>(cell.double ? 'bet' : 'ask')
  const [bet, setBet] = useState(0)
  const [tried, setTried] = useState<string[]>([asker.id])
  const [wrongPicks, setWrongPicks] = useState<number[]>([])
  const [winner, setWinner] = useState<string | null>(null)
  const [timeUp, setTimeUp] = useState(false)
  const { seconds, start, stop } = useCountdown({ onEnd: () => setTimeUp(true), ticks: true })

  const worth = cell.double ? bet : cell.value
  const who = players.find((p) => p.id === answerer) ?? asker
  const subject = subjectOf(category.subject)
  const untouched = tried.length === 1 && wrongPicks.length === 0

  const startTimer = (): void => {
    setTimeUp(false)
    if (settings.seconds > 0) start(settings.seconds)
  }

  useEffect(() => {
    // Sin apuesta pendiente, el tiempo corre desde que se muestra la pregunta
    if (!cell.double && settings.seconds > 0) start(settings.seconds)
    // Solo al abrir la casilla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const place = (amount: number): void => {
    sfx.pop()
    setBet(amount)
    setStage('ask')
    startTimer()
  }

  const finish = (by: string | null): void => {
    stop()
    setWinner(by)
    setStage('done')
  }

  const resolve = (ok: boolean, option?: number): void => {
    if (stage !== 'ask') return
    stop()
    if (ok) {
      sfx.correct()
      onScore(answerer, worth)
      finish(answerer)
      return
    }
    sfx.wrong()
    if (cell.double || settings.penalty) onScore(answerer, -worth)
    if (option !== undefined) setWrongPicks([...wrongPicks, option])
    const others = players.filter((p) => !tried.includes(p.id))
    if (settings.steal && !cell.double && others.length > 0) setStage('steal')
    else finish(null)
  }

  const steal = (id: string): void => {
    sfx.pop()
    setAnswerer(id)
    setTried([...tried, id])
    setStage('ask')
    startTimer()
  }

  const pickOption = (i: number): void => {
    if (stage !== 'ask' || wrongPicks.includes(i)) return
    resolve(i === options.answer, i)
  }

  // Teclado: A–D o 1–4 eligen la respuesta; Enter o Espacio (sin un botón seleccionado) cierran el resultado
  useEffect(() => {
    const onKey = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return
      if (stage === 'ask') {
        const i =
          '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase())
        if (e.key.length === 1 && i >= 0) {
          e.preventDefault()
          pickOption(i)
        }
      } else if (stage === 'done' && (e.key === ' ' || e.key === 'Enter') && tag === 'BODY') {
        e.preventDefault()
        onDone(winner)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  const header = (
    <div className="cq-clue-head">
      <span className="g-badge" style={{ background: subject.color, color: '#fff' }}>
        {subject.icon} {category.topic} · {gradeLabel(category.grade)}
      </span>
      <span className="g-badge cq-points">
        {cell.double ? '🎲 Doble o nada' : `${cell.value} puntos`}
      </span>
    </div>
  )

  if (stage === 'bet') {
    const top = scores[asker.id] ?? 0
    const bets = top > BETS[BETS.length - 1] ? [...BETS, top] : BETS
    return (
      <div className="cq-clue g-center">
        {header}
        <p className="g-win cq-double">🎲 ¡Doble o nada!</p>
        <p className="cq-turn-big" style={{ color: asker.color }}>
          {asker.emoji} {asker.name}: ¿cuánto apuestan?
        </p>
        <div className="cq-bets">
          {bets.map((b) => (
            <button key={b} className="btn big" onClick={() => place(b)}>
              {b === top && top > BETS[BETS.length - 1] ? `Todo: ${b}` : b}
            </button>
          ))}
        </div>
        <button className="btn secondary" onClick={onCancel}>
          ↩ Volver al tablero
        </button>
      </div>
    )
  }

  const message =
    stage === 'done'
      ? winner
        ? (() => {
            const p = players.find((x) => x.id === winner)
            return `✅ ¡Correcto! +${worth} para ${p?.emoji ?? ''} ${p?.name ?? ''}`
          })()
        : cell.double
          ? `❌ ¡Se perdieron ${worth} puntos!`
          : '❌ Nadie acertó'
      : null

  return (
    <div className="cq-clue">
      {header}
      <div className="cq-answering">
        {stage === 'steal' ? (
          <span className="cq-turn-big">❌ ¡Incorrecta! ¿Quién roba los {worth} puntos?</span>
        ) : stage === 'ask' ? (
          <span className="cq-turn-big" style={{ color: who.color }}>
            {who.id !== asker.id ? '🥷 Roba: ' : ''}
            {who.emoji} {who.name}
          </span>
        ) : (
          <span className={`cq-turn-big ${winner ? 'ok' : 'no'}`}>{message}</span>
        )}
        {stage === 'ask' && settings.seconds > 0 && (
          <span className={`g-timer ${seconds <= 5 ? 'low' : ''}`} aria-label="Segundos">
            {timeUp ? '⏰ 0' : `⏱ ${seconds}`}
          </span>
        )}
      </div>

      <div className="g-question cq-question">{cell.question.text}</div>

      <div className="g-options">
        {options.options.map((text, i) => {
          const wrong = wrongPicks.includes(i)
          const state =
            stage === 'done'
              ? i === options.answer
                ? 'correct'
                : wrong
                  ? 'wrong'
                  : 'dim'
              : wrong
                ? 'wrong'
                : ''
          return (
            <button
              key={i}
              className={`g-option ${state}`}
              disabled={stage !== 'ask' || wrong}
              onClick={() => pickOption(i)}
            >
              <span className="g-letter">{'ABCD'[i]}</span>
              {text}
            </button>
          )
        })}
      </div>

      {stage === 'done' && cell.question.explanation && (
        <p className="cq-explanation">{cell.question.explanation}</p>
      )}
      {timeUp && stage === 'ask' && <p className="cq-timeup">⏰ ¡Se acabó el tiempo!</p>}

      {stage === 'ask' && (
        <div className="row">
          <div className="row start">
            <button className="btn big cq-ok" onClick={() => resolve(true)}>
              ✅ Correcta
            </button>
            <button className="btn big cq-no" onClick={() => resolve(false)}>
              ❌ Incorrecta
            </button>
          </div>
          {untouched && (
            <button className="btn secondary" onClick={onCancel}>
              ↩ Volver al tablero
            </button>
          )}
        </div>
      )}

      {stage === 'steal' && (
        <div className="row start">
          {players
            .filter((p) => !tried.includes(p.id))
            .map((p) => (
              <button
                key={p.id}
                className="btn big"
                style={{ background: p.color, borderColor: p.color }}
                onClick={() => steal(p.id)}
              >
                {p.emoji} {p.name}
              </button>
            ))}
          <button className="btn secondary" onClick={() => (sfx.pop(), finish(null))}>
            Nadie
          </button>
        </div>
      )}

      {stage === 'done' && (
        <div className="row start">
          <button className="btn big" autoFocus onClick={() => onDone(winner)}>
            Volver al tablero →
          </button>
        </div>
      )}
    </div>
  )
}
