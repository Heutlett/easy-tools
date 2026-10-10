import { useEffect, useRef, useState } from 'react'
import { gradeLabel } from '../../content/subjects'
import type { Grade } from '../../content/types'
import { sfx } from '../../lib/games/sfx'
import type { Config, InputType, Problem } from './data'
import { checkAnswer, makeSet } from './generate'
import { useKeys, useRoundTimer } from './hooks'
import { Expr, Keypad, Review, TimerBar } from './shared'

interface Props {
  config: Config
  /** Segundos por operación; 0 = sin límite */
  seconds: number
  count: number
  onExit: () => void
}

/** Solo yo: se escribe la respuesta con el teclado numérico y se valida */
export default function Solo({ config, seconds, count, onExit }: Props): React.JSX.Element {
  const [round, setRound] = useState(0)
  const [problems, setProblems] = useState(() => makeSet(config, count))
  const [index, setIndex] = useState(0)
  const [marks, setMarks] = useState<boolean[]>([])
  const [streak, setStreak] = useState(0)
  const [best, setBest] = useState(0)
  const [finished, setFinished] = useState(false)
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const [elapsed, setElapsed] = useState(0)
  const right = marks.filter(Boolean).length

  const onResult = (ok: boolean): void => {
    setMarks((m) => [...m.slice(0, index), ok])
    if (ok) {
      setStreak(streak + 1)
      setBest(Math.max(best, streak + 1))
    } else setStreak(0)
  }
  const onNext = (): void => {
    if (index + 1 < problems.length) setIndex(index + 1)
    else {
      setElapsed(Math.round((Date.now() - startedAt) / 1000))
      setFinished(true)
      sfx.win()
    }
  }

  if (finished) {
    const pct = Math.round((right / problems.length) * 100)
    const missed = problems.filter((_, i) => !marks[i])
    return (
      <div className="g-stage g-center cm-end">
        <p className="g-win">{pct >= 90 ? '🌟' : pct >= 60 ? '🎉' : '💪'} ¡Terminaste!</p>
        <div className="cm-results">
          <div>
            <b>
              {right} / {problems.length}
            </b>
            <span>aciertos</span>
          </div>
          <div>
            <b>🔥 {best}</b>
            <span>mejor racha</span>
          </div>
          <div>
            <b>{elapsed} s</b>
            <span>tiempo</span>
          </div>
        </div>
        {missed.length > 0 && (
          <>
            <p className="cm-end-sub">Para repasar</p>
            <Review problems={missed} />
          </>
        )}
        <div className="row start">
          <button
            className="btn big"
            onClick={() => {
              setProblems(makeSet(config, count))
              setRound(round + 1)
              setIndex(0)
              setMarks([])
              setStreak(0)
              setBest(0)
              setStartedAt(Date.now())
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
      right={right}
      streak={streak}
      onResult={onResult}
      onNext={onNext}
      onExit={onExit}
    />
  )
}

function Step({
  problem,
  index,
  total,
  grade,
  seconds,
  right,
  streak,
  onResult,
  onNext,
  onExit
}: {
  problem: Problem
  index: number
  total: number
  grade: Grade
  seconds: number
  right: number
  streak: number
  onResult: (ok: boolean) => void
  onNext: () => void
  onExit: () => void
}): React.JSX.Element {
  const [typed, setTyped] = useState('')
  const [status, setStatus] = useState<'typing' | 'right' | 'wrong'>('typing')
  const auto = useRef<ReturnType<typeof setTimeout> | null>(null)
  const timer = useRoundTimer(() => settle(false), seconds)

  useEffect(
    () => () => {
      if (auto.current) clearTimeout(auto.current)
    },
    []
  )

  function settle(ok: boolean): void {
    if (status !== 'typing') return
    timer.stop()
    setStatus(ok ? 'right' : 'wrong')
    onResult(ok)
    if (ok) {
      sfx.correct()
      auto.current = setTimeout(onNext, 900)
    } else sfx.wrong()
  }

  const submit = (): void => {
    if (status === 'typing' && typed) settle(checkAnswer(problem, typed))
  }

  const press = (key: string): void => {
    if (status !== 'typing') return
    if (key === 'Backspace') return setTyped(typed.slice(0, -1))
    if (problem.input === 'cmp') {
      if (['<', '>', '='].includes(key)) {
        setTyped(key)
        sfx.pop()
      }
      return
    }
    if (typed.length >= 12) return
    if (/^\d$/.test(key)) return setTyped(typed + key)
    if ((key === ',' || key === '.') && problem.input === 'dec' && typed && !typed.includes(','))
      return setTyped(typed + ',')
    if (key === '/' && problem.input === 'frac' && typed && !typed.includes('/'))
      return setTyped(typed + '/')
  }

  useKeys((e) => {
    if (e.key === 'Enter' || (e.key === ' ' && status !== 'typing')) {
      e.preventDefault()
      if (status === 'typing') submit()
      else {
        if (auto.current) clearTimeout(auto.current)
        onNext()
      }
      return
    }
    if (status !== 'typing') return
    if (problem.input === 'cmp') {
      const map: Record<string, string> = {
        ArrowLeft: '<',
        ArrowRight: '>',
        ArrowDown: '='
      }
      const symbol = map[e.key] ?? (['<', '>', '='].includes(e.key) ? e.key : '')
      if (symbol) {
        e.preventDefault()
        press(symbol)
      } else if (e.key === 'Backspace') press(e.key)
    } else if (e.key.length === 1 || e.key === 'Backspace') press(e.key)
  })

  const boxState = status === 'typing' ? (typed ? 'typing' : 'idle') : status
  const input: InputType = problem.input
  return (
    <div className="g-stage cm-play cm-solo">
      <div className="row">
        <span className="g-badge">
          {index + 1} / {total}
        </span>
        <span className="g-badge">🧠 {gradeLabel(grade)}</span>
        <span className="g-badge">✅ {right}</span>
        <span className={`g-badge ${streak >= 3 ? 'hot' : ''}`}>🔥 {streak}</span>
        <button className="btn secondary small" onClick={onExit}>
          Salir
        </button>
      </div>

      <div className="cm-solo-body">
        <div className="cm-solo-left">
          <div className={`cm-card ${status}`}>
            <Expr problem={problem} fill={typed || undefined} state={boxState} />
          </div>
          {seconds > 0 && status === 'typing' && <TimerBar left={timer.left} total={timer.total} />}
          {status === 'right' && <p className="cm-note good">¡Muy bien!</p>}
          {status === 'wrong' && (
            <div className="cm-wrong">
              <p className="cm-note bad">
                {typed ? 'No es esa.' : '¡Se acabó el tiempo!'} La respuesta es{' '}
                <b>{problem.answer}</b>
              </p>
              <button className="btn big" onClick={onNext}>
                {index + 1 < total ? 'Siguiente →' : 'Terminar'}
              </button>
            </div>
          )}
        </div>
        <Keypad input={input} onKey={press} onSubmit={submit} disabled={status !== 'typing'} />
      </div>
      <p className="muted cm-hint">
        {input === 'cmp' ? '← es menor · ↓ igual · → mayor · ' : ''}Enter: responder
      </p>
    </div>
  )
}
