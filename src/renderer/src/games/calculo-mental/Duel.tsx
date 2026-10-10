import { useState } from 'react'
import Scoreboard from '../../components/games/Scoreboard'
import { gradeLabel } from '../../content/subjects'
import type { Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import type { Config, Problem } from './data'
import { makeSet } from './generate'
import { useKeys, useRoundTimer } from './hooks'
import { Expr, TimerBar } from './shared'

const TEAM_KEYS = ['a', 'l', 'q', 'p']

interface Props {
  config: Config
  players: Player[]
  seconds: number
  count: number
  onExit: () => void
}

/** Duelo: gana el turno de responder quien pulsa primero; el docente marca si acertó */
export default function Duel({
  config,
  players,
  seconds,
  count,
  onExit
}: Props): React.JSX.Element {
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [problems, setProblems] = useState(() => makeSet(config, count))
  const { scores, add, reset, ranking, leaders } = useScores(players)

  if (finished) {
    return (
      <div className="g-stage g-center cm-end">
        <p className="g-win">🏆 ¡Terminó el duelo!</p>
        <p className="cm-end-sub">
          {leaders.length === 1
            ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
            : leaders.length > 1
              ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
              : 'Nadie sumó puntos'}
        </p>
        <Scoreboard players={ranking} scores={scores} />
        <div className="row start">
          <button
            className="btn big"
            onClick={() => {
              reset()
              setProblems(makeSet(config, count))
              setRound(round + 1)
              setIndex(0)
              setFinished(false)
            }}
          >
            Revancha
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar opciones
          </button>
        </div>
      </div>
    )
  }

  return (
    <Step
      key={`${round}-${index}`}
      problem={problems[index]}
      index={index}
      total={problems.length}
      grade={config.grade}
      players={players}
      scores={scores}
      add={add}
      seconds={seconds}
      onExit={onExit}
      onNext={() => {
        if (index + 1 < problems.length) setIndex(index + 1)
        else {
          setFinished(true)
          sfx.win()
        }
      }}
    />
  )
}

type Phase = 'open' | 'answering' | 'revealed'

function Step({
  problem,
  index,
  total,
  grade,
  players,
  scores,
  add,
  seconds,
  onExit,
  onNext
}: {
  problem: Problem
  index: number
  total: number
  grade: Grade
  players: Player[]
  scores: Record<string, number>
  add: (id: string, delta: number) => void
  seconds: number
  onExit: () => void
  onNext: () => void
}): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('open')
  const [turn, setTurn] = useState<string | null>(null)
  const [locked, setLocked] = useState<string[]>([])
  const [winner, setWinner] = useState<string | null>(null)
  const timer = useRoundTimer(() => undefined)

  const buzz = (id: string): void => {
    if (phase !== 'open' || locked.includes(id)) return
    setTurn(id)
    setPhase('answering')
    sfx.pop()
    timer.start(seconds)
  }
  const reveal = (): void => {
    timer.stop()
    setPhase('revealed')
  }
  const correct = (): void => {
    if (!turn) return
    add(turn, 1)
    setWinner(turn)
    sfx.correct()
    reveal()
  }
  const wrong = (): void => {
    if (!turn) return
    sfx.wrong()
    timer.stop()
    const nextLocked = [...locked, turn]
    setLocked(nextLocked)
    setTurn(null)
    if (nextLocked.length >= players.length) reveal()
    else setPhase('open')
  }

  useKeys((e, onBody) => {
    const k = e.key.toLowerCase()
    const team = players.findIndex((_, i) => TEAM_KEYS[i] === k || String(i + 1) === k)
    if (team >= 0) {
      buzz(players[team].id)
      return
    }
    const confirm = (e.key === ' ' || e.key === 'Enter') && onBody
    if (phase === 'answering') {
      if (confirm) {
        e.preventDefault()
        correct()
      } else if (k === 'x' || e.key === 'Backspace') wrong()
    } else if (confirm || e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault()
      if (phase === 'open') reveal()
      else onNext()
    }
  })

  const revealed = phase === 'revealed'
  const turnPlayer = players.find((p) => p.id === turn)
  const winnerPlayer = players.find((p) => p.id === winner)

  return (
    <div className="g-stage cm-play cm-duel">
      <div className="row">
        <span className="g-badge">
          {index + 1} / {total}
        </span>
        <span className="g-badge">🥊 {gradeLabel(grade)}</span>
        <button className="btn secondary small" onClick={onExit}>
          Salir
        </button>
      </div>

      <div className={`cm-card ${revealed ? 'revealed' : ''}`}>
        <Expr
          problem={problem}
          fill={revealed ? problem.answer : undefined}
          state={revealed ? 'revealed' : 'idle'}
        />
      </div>

      <div className="cm-status">
        {phase === 'open' && (
          <>
            <p className="cm-note">¡Pulsen su tecla para responder!</p>
            <button className="btn secondary small" onClick={reveal}>
              Mostrar la respuesta
            </button>
          </>
        )}
        {phase === 'answering' && turnPlayer && (
          <div
            className="cm-answering"
            style={{ '--team': turnPlayer.color } as React.CSSProperties}
          >
            <p className="cm-note">
              {turnPlayer.emoji} {turnPlayer.name} responde
            </p>
            <TimerBar left={timer.left} total={timer.total} />
            <div className="row">
              <button className="btn big cm-yes" onClick={correct}>
                ✅ Correcto
              </button>
              <button className="btn big secondary cm-no" onClick={wrong}>
                ❌ Incorrecto
              </button>
            </div>
          </div>
        )}
        {revealed && (
          <div className="row">
            <p className="cm-note">
              {winnerPlayer
                ? `¡Punto para ${winnerPlayer.emoji} ${winnerPlayer.name}!`
                : 'Nadie acertó'}
            </p>
            <button className="btn big" onClick={onNext}>
              {index + 1 < total ? 'Siguiente →' : 'Terminar'}
            </button>
          </div>
        )}
      </div>

      <div className="cm-buzzers">
        {players.map((p, i) => {
          const out = locked.includes(p.id)
          return (
            <div
              key={p.id}
              className={`cm-buzzer ${p.id === turn ? 'active' : ''} ${out ? 'out' : ''}`}
              style={{ '--team': p.color } as React.CSSProperties}
            >
              <button
                className="cm-buzz"
                disabled={phase !== 'open' || out}
                onClick={(e) => (e.currentTarget.blur(), buzz(p.id))}
                aria-label={`${p.name}: responder`}
              >
                <span className="cm-buzz-name">
                  {p.emoji} {p.name}
                </span>
                <span className="cm-buzz-key">Tecla {TEAM_KEYS[i].toUpperCase()}</span>
              </button>
              <span className="cm-buzz-score">{scores[p.id] ?? 0}</span>
              <span className="cm-buzz-adjust">
                <button
                  className="icon-btn"
                  aria-label={`Quitar 1 a ${p.name}`}
                  disabled={(scores[p.id] ?? 0) === 0}
                  onClick={(e) => (e.currentTarget.blur(), add(p.id, -1))}
                >
                  −
                </button>
                <button
                  className="icon-btn plus"
                  aria-label={`Sumar 1 a ${p.name}`}
                  onClick={(e) => (e.currentTarget.blur(), add(p.id, 1))}
                >
                  +
                </button>
              </span>
            </div>
          )
        })}
      </div>
      <p className="muted cm-hint">Enter: ✅ · X: ❌ · Espacio o →: siguiente</p>
    </div>
  )
}
