import { useState } from 'react'
import { gradeLabel } from '../../content/subjects'
import type { Grade } from '../../content/types'
import { sfx } from '../../lib/games/sfx'
import type { Config, Problem } from './data'
import { makeSet } from './generate'
import { useKeys, useRoundTimer } from './hooks'
import { Expr, Review, TimerBar } from './shared'

interface Props {
  config: Config
  seconds: number
  count: number
  onExit: () => void
}

/** Una operación a la vez con cuenta regresiva; la clase responde en voz alta o en sus cuadernos */
export default function Lightning({ config, seconds, count, onExit }: Props): React.JSX.Element {
  const [round, setRound] = useState(0)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [problems, setProblems] = useState(() => makeSet(config, count))

  if (finished) {
    return (
      <div className="g-stage g-center cm-end">
        <p className="g-win">🎉 ¡Terminamos!</p>
        <p className="cm-end-sub">
          {problems.length} operaciones · {gradeLabel(config.grade)}
        </p>
        <Review problems={problems} />
        <div className="row start">
          <button
            className="btn big"
            onClick={() => {
              setProblems(makeSet(config, count))
              setRound(round + 1)
              setIndex(0)
              setFinished(false)
            }}
          >
            Jugar otra vez
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

type Phase = 'counting' | 'paused' | 'timeup' | 'revealed'

function Step({
  problem,
  index,
  total,
  grade,
  seconds,
  onExit,
  onNext
}: {
  problem: Problem
  index: number
  total: number
  grade: Grade
  seconds: number
  onExit: () => void
  onNext: () => void
}): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>('counting')
  const timer = useRoundTimer(() => setPhase('timeup'), seconds)

  const reveal = (): void => {
    timer.stop()
    setPhase('revealed')
    sfx.correct()
  }
  const togglePause = (): void => {
    if (phase === 'counting') {
      timer.pause()
      setPhase('paused')
    } else if (phase === 'paused') {
      timer.resume()
      setPhase('counting')
    }
  }
  const advance = (): void => (phase === 'revealed' ? onNext() : reveal())

  useKeys((e, onBody) => {
    const arrow = e.key === 'ArrowRight' || e.key === 'PageDown'
    if (arrow || ((e.key === ' ' || e.key === 'Enter') && onBody)) {
      e.preventDefault()
      advance()
    } else if (e.key.toLowerCase() === 'p') togglePause()
  })

  const revealed = phase === 'revealed'
  return (
    <div className="g-stage cm-play">
      <div className="row">
        <span className="g-badge">
          {index + 1} / {total}
        </span>
        <span className="g-badge">⚡ {gradeLabel(grade)}</span>
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

      {revealed ? (
        <p className="cm-note good">¡Esa era la respuesta!</p>
      ) : (
        <TimerBar left={timer.left} total={timer.total} paused={phase === 'paused'} />
      )}
      {phase === 'timeup' && <p className="cm-note time">¡Se acabó el tiempo!</p>}

      <div className="row">
        <button className="btn big" onClick={advance}>
          {revealed ? (index + 1 < total ? 'Siguiente →' : 'Terminar') : 'Mostrar la respuesta'}
        </button>
        {!revealed && phase !== 'timeup' && (
          <button className="btn secondary" onClick={togglePause}>
            {phase === 'paused' ? 'Seguir' : 'Pausa'}
          </button>
        )}
      </div>
      <p className="muted cm-hint">Espacio o → : mostrar y avanzar · P: pausa</p>
    </div>
  )
}
