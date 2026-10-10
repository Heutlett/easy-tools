import { useEffect, useMemo, useRef, useState } from 'react'
import EndScreen from '../_lengua/EndScreen'
import { useGameKeys } from '../_lengua/useGameKeys'
import { useTurns } from '../_lengua/useTurns'
import Scoreboard from '../../components/games/Scoreboard'
import type { Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { useVoice } from '../../lib/games/useVoice'
import { usePersistentState } from '../../lib/usePersistentState'
import { twisters, type Level } from './twisterList'

interface Props {
  grade: Grade | 0
  players: Player[]
  onExit: () => void
}

const SPEEDS = [
  { rate: 0.6, label: '🐢 Lento' },
  { rate: 0.9, label: 'Normal' },
  { rate: 1.2, label: '🐇 Rápido' }
]

const seconds = (ms: number): string => (ms / 1000).toFixed(1).replace('.', ',')

type Watch = { state: 'idle' } | { state: 'run'; ms: number } | { state: 'done'; ms: number }

export default function Twisters({ grade, players, onExit }: Props): React.JSX.Element {
  const voice = useVoice('es')
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const turns = useTurns(players)
  const [level, setLevel] = useState<Level | 0>(0)
  const [seed, setSeed] = useState(0)
  const [index, setIndex] = useState(0)
  const [rate, setRate] = usePersistentState('game:trabalenguas:rate', 0.9)
  const [played, setPlayed] = useState(0)
  const [won, setWon] = useState(0)
  const [finished, setFinished] = useState(false)
  const [watch, setWatch] = useState<Watch>({ state: 'idle' })
  const [best, setBest] = useState<Record<string, number>>({})
  const timer = useRef<ReturnType<typeof setInterval> | null>(null)
  const startedAt = useRef(0)

  const queue = useMemo(
    () =>
      shuffle(
        twisters.filter(
          (t) =>
            (grade === 0 || (t.grade <= grade && t.grade >= grade - 1)) &&
            (!level || t.level === level)
        )
      ),
    // `seed` fuerza un nuevo orden cuando se acaban
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [grade, level, seed]
  )
  const current = queue[index % Math.max(1, queue.length)]

  const stopTimer = (): void => {
    if (timer.current) clearInterval(timer.current)
    timer.current = null
  }
  useEffect(() => stopTimer, [])

  const startWatch = (): void => {
    stopTimer()
    startedAt.current = performance.now()
    setWatch({ state: 'run', ms: 0 })
    timer.current = setInterval(
      () => setWatch({ state: 'run', ms: performance.now() - startedAt.current }),
      100
    )
    sfx.pop()
  }
  const stopWatch = (): void => {
    const ms = performance.now() - startedAt.current
    stopTimer()
    setWatch({ state: 'done', ms })
    setBest((b) =>
      current && (!b[current.id] || ms < b[current.id]) ? { ...b, [current.id]: ms } : b
    )
    sfx.correct()
  }

  const nextTwister = (): void => {
    voice.stop()
    stopTimer()
    setWatch({ state: 'idle' })
    setPlayed((n) => n + 1)
    if (index + 1 >= queue.length) {
      setSeed((s) => s + 1)
      setIndex(0)
    } else setIndex(index + 1)
  }

  const resolve = (done: boolean): void => {
    if (!current) return
    const who = turns.current
    if (who) {
      if (done) {
        add(who.id, current.level)
        setWon((n) => n + 1)
        sfx.win()
      } else sfx.wrong()
      turns.next()
    }
    nextTwister()
  }

  useGameKeys({ onNext: nextTwister }, !finished && watch.state !== 'run')

  const setLevelFilter = (l: Level | 0): void => {
    voice.stop()
    stopTimer()
    setWatch({ state: 'idle' })
    setLevel(l)
    setIndex(0)
  }

  if (finished) {
    return (
      <EndScreen
        players={players}
        scores={scores}
        ranking={ranking}
        leaders={leaders}
        summary={`${played} trabalenguas`}
        onAgain={() => {
          reset()
          turns.reset()
          setPlayed(0)
          setWon(0)
          setBest({})
          setIndex(0)
          setSeed((s) => s + 1)
          setFinished(false)
        }}
        againLabel="Seguir jugando"
        onExit={onExit}
      />
    )
  }

  if (!current)
    return (
      <div className="g-stage g-center">
        <p className="g-question">No hay trabalenguas con esos filtros.</p>
        <button className="btn" onClick={() => setLevelFilter(0)}>
          Ver todos los niveles
        </button>
      </div>
    )

  const size = current.text.length < 60 ? 'xl' : current.text.length < 130 ? 'l' : 'm'
  const bestMs = best[current.id]
  return (
    <div className="g-stage tw-twister">
      <div className="ln-bar">
        <div className="ln-bar-left">
          <span className="g-badge" aria-label={`Dificultad ${current.level} de 3`}>
            {'⭐'.repeat(current.level)}
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
        <div className="pills" role="group" aria-label="Dificultad">
          {([0, 1, 2, 3] as const).map((l) => (
            <button
              key={l}
              className={`pill small ${level === l ? 'selected' : ''}`}
              aria-pressed={level === l}
              onClick={() => setLevelFilter(l)}
            >
              {l === 0 ? 'Todos' : '⭐'.repeat(l)}
            </button>
          ))}
        </div>
      </div>

      <div className={`g-question tw-text tw-${size}`}>{current.text}</div>

      <div className="tw-tools">
        {voice.available && (
          <div className="tw-tool">
            <button className="btn" onClick={() => voice.speak(current.text, rate)}>
              🔊 Escuchar
            </button>
            <div className="pills" role="group" aria-label="Velocidad de la voz">
              {SPEEDS.map((s) => (
                <button
                  key={s.rate}
                  className={`pill small ${rate === s.rate ? 'selected' : ''}`}
                  aria-pressed={rate === s.rate}
                  onClick={() => setRate(s.rate)}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        )}
        <div className="tw-tool">
          {watch.state === 'run' ? (
            <button className="btn danger" onClick={stopWatch}>
              ⏹ Terminé
            </button>
          ) : (
            <button className="btn secondary" onClick={startWatch}>
              ⏱ {watch.state === 'done' ? 'Otra vez' : 'Reto: 3 veces seguidas'}
            </button>
          )}
          {watch.state !== 'idle' && (
            <span className={`g-timer tw-clock ${watch.state === 'run' ? '' : 'done'}`}>
              {seconds(watch.ms)} s
            </span>
          )}
          {bestMs !== undefined && watch.state !== 'run' && (
            <span className="muted">Mejor: {seconds(bestMs)} s</span>
          )}
        </div>
      </div>

      <div className="row start tw-actions">
        {players.length > 0 ? (
          <>
            <button className="btn big tw-ok" onClick={() => resolve(true)}>
              ✅ Lo logró (+{current.level})
            </button>
            <button className="btn big secondary" onClick={() => resolve(false)}>
              No lo logró
            </button>
          </>
        ) : null}
        <button className="btn secondary" onClick={nextTwister}>
          Otro trabalenguas →
        </button>
        <button className="btn secondary" onClick={() => setFinished(true)}>
          Terminar
        </button>
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
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
      <p className="muted ln-hint">
        {won > 0 ? `Logrados: ${won} · ` : ''}Flecha → o Espacio: otro trabalenguas
      </p>
    </div>
  )
}
