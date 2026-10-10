import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import { gradeLabel } from '../../content/subjects'
import { GRADES, type Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { useCountdown } from '../../lib/games/useCountdown'
import { useVoice } from '../../lib/games/useVoice'
import { usePersistentState } from '../../lib/usePersistentState'
import { noFocusedButton, useKeys } from '../_lectura/keys'
import { Burst, Choice, EndScreen, OptionRow, TopBar } from '../_lectura/ui'
import {
  answerText,
  bankSize,
  check,
  firstWordIndex,
  isMark,
  pickSentences,
  shuffledTiles,
  type Sentence
} from './logic'

interface Config {
  grade: Grade
  /** Con mayúscula inicial y signos de puntuación (desde 2.º) */
  punct: boolean
  /** Solo oraciones que se pueden ordenar de dos maneras */
  twoOnly: boolean
  count: number
  /** Segundos por oración; 0 = sin límite */
  time: number
}

const DEFAULTS: Config = { grade: 1, punct: false, twoOnly: false, count: 8, time: 0 }

type Phase =
  | { name: 'setup' }
  | { name: 'players'; config: Config; sentences: Sentence[] }
  | { name: 'play'; config: Config; sentences: Sentence[]; players: Player[] }

export default function OrdenaLaOracion(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })
  const [saved, setSaved] = usePersistentState<Config>('game:ordena-oracion:config', DEFAULTS)
  const config: Config = { ...DEFAULTS, ...saved }
  if (config.grade === 1) {
    config.punct = false
    config.twoOnly = false
  }

  if (phase.name === 'setup')
    return (
      <Setup
        config={config}
        onChange={setSaved}
        onNext={(sentences) => setPhase({ name: 'players', config, sentences })}
      />
    )
  if (phase.name === 'players')
    return (
      <PlayerSetup
        optional
        startLabel="Empezar"
        onStart={(players) =>
          setPhase({ name: 'play', config: phase.config, sentences: phase.sentences, players })
        }
      />
    )
  return (
    <Round
      config={phase.config}
      sentences={phase.sentences}
      players={phase.players}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Setup({
  config,
  onChange,
  onNext
}: {
  config: Config
  onChange: (c: Config) => void
  onNext: (s: Sentence[]) => void
}): React.JSX.Element {
  const set = (patch: Partial<Config>): void => onChange({ ...config, ...patch })
  const young = config.grade === 1
  const size = bankSize(config.grade, config.twoOnly)
  return (
    <section className="panel lec-setup ord-setup">
      <OptionRow label="Grado">
        {GRADES.map((g) => (
          <Choice key={g} selected={config.grade === g} onClick={() => set({ grade: g })}>
            {gradeLabel(g)}
          </Choice>
        ))}
      </OptionRow>
      <OptionRow label="Cómo se arma">
        <Choice selected={!config.punct} onClick={() => set({ punct: false })}>
          Solo palabras
        </Choice>
        <Choice selected={config.punct} disabled={young} onClick={() => set({ punct: true })}>
          Con mayúscula y signos
        </Choice>
      </OptionRow>
      <OptionRow label="Oraciones">
        <Choice selected={!config.twoOnly} onClick={() => set({ twoOnly: false })}>
          Todas
        </Choice>
        <Choice selected={config.twoOnly} disabled={young} onClick={() => set({ twoOnly: true })}>
          Con dos órdenes posibles
        </Choice>
      </OptionRow>
      <OptionRow label="Cuántas">
        {[8, 12, 16].map((n) => (
          <Choice key={n} selected={config.count === n} onClick={() => set({ count: n })}>
            {n}
          </Choice>
        ))}
      </OptionRow>
      <OptionRow label="Tiempo" hint="por oración">
        {[0, 30, 60, 90].map((t) => (
          <Choice key={t} selected={config.time === t} onClick={() => set({ time: t })}>
            {t === 0 ? 'Sin límite' : `${t} s`}
          </Choice>
        ))}
      </OptionRow>
      <div className="row start">
        <button
          className="btn big"
          disabled={size === 0}
          onClick={() =>
            onNext(pickSentences(config.grade, config.count, config.punct, config.twoOnly))
          }
        >
          Siguiente →
        </button>
        <span className="muted">{size} oraciones para este grado</span>
      </div>
    </section>
  )
}

function Round({
  config,
  sentences,
  players,
  onExit
}: {
  config: Config
  sentences: Sentence[]
  players: Player[]
  onExit: () => void
}): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [clean, setClean] = useState(0)
  const { scores, add, reset, ranking, leaders } = useScores(players)

  if (finished)
    return (
      <EndScreen
        title="🎉 ¡Muy bien!"
        lines={[`Oraciones a la primera: ${clean} de ${sentences.length}`]}
        players={players}
        scores={scores}
        ranking={ranking}
        leaders={leaders}
        onAgain={() => {
          reset()
          setIndex(0)
          setClean(0)
          setFinished(false)
          sfx.pop()
        }}
        onExit={onExit}
      />
    )

  const turn = players.length > 0 ? players[index % players.length] : undefined
  return (
    <div className="g-stage ord-stage">
      <Step
        key={index}
        sentence={sentences[index]}
        punct={config.punct}
        time={config.time}
        progress={`${index + 1} / ${sentences.length}`}
        turn={turn}
        last={index + 1 === sentences.length}
        onExit={onExit}
        onDone={(points) => {
          if (points === 2) setClean((c) => c + 1)
          if (turn && points > 0) add(turn.id, points)
        }}
        onNext={() => {
          if (index + 1 < sentences.length) setIndex(index + 1)
          else {
            setFinished(true)
            sfx.win()
          }
        }}
      />
      {players.length > 0 && (
        <div className="lec-score">
          <Scoreboard players={players} scores={scores} onAdd={add} currentId={turn?.id} compact />
        </div>
      )}
    </div>
  )
}

type Status = 'playing' | 'wrong' | 'needcap' | 'solved' | 'timeup'

const capitalize = (t: string): string => t.charAt(0).toUpperCase() + t.slice(1)

function Step({
  sentence,
  punct,
  time,
  progress,
  turn,
  last,
  onExit,
  onDone,
  onNext
}: {
  sentence: Sentence
  punct: boolean
  time: number
  progress: string
  turn?: Player
  last: boolean
  onExit: () => void
  onDone: (points: number) => void
  onNext: () => void
}): React.JSX.Element {
  const voice = useVoice('es')
  const tiles = useMemo(() => shuffledTiles(sentence, punct), [sentence, punct])
  const [placed, setPlaced] = useState<number[]>([])
  const [status, setStatus] = useState<Status>('playing')
  const [mistakes, setMistakes] = useState(0)
  const [capital, setCapital] = useState(false)
  const [dragging, setDragging] = useState(false)
  const statusRef = useRef(status)
  useEffect(() => {
    statusRef.current = status
  })

  const countdown = useCountdown({
    ticks: true,
    onEnd: () => {
      if (statusRef.current !== 'solved') setStatus('timeup')
    }
  })
  const { start: startCountdown, stop: stopCountdown } = countdown
  useEffect(() => {
    if (time > 0) startCountdown(time)
    return () => stopCountdown()
  }, [time, startCountdown, stopCountdown])

  const textOf = (id: number): string => tiles.find((t) => t.id === id)!.text
  const open = status === 'playing' || status === 'wrong' || status === 'needcap'

  const solve = (shown: string[], mist: number): void => {
    setStatus('solved')
    stopCountdown()
    sfx.correct()
    voice.speak(answerText(sentence, shown, punct), 0.85)
    onDone(mist === 0 ? 2 : 1)
  }

  const evaluate = (ids: number[], cap: boolean): void => {
    const words = ids.map(textOf)
    const verdict = check(sentence, words, punct, cap)
    if (verdict.ordered && !verdict.needsCapital) solve(words, mistakes)
    else if (verdict.ordered) {
      setStatus('needcap')
      sfx.pop()
    } else {
      setStatus('wrong')
      setMistakes((m) => m + 1)
      sfx.wrong()
    }
  }

  const choose = (id: number): void => {
    if (status !== 'playing' || placed.includes(id)) return
    const next = [...placed, id]
    setPlaced(next)
    if (next.length === tiles.length) evaluate(next, capital)
    else sfx.pop()
  }
  const remove = (at?: number): void => {
    if (!open || placed.length === 0) return
    sfx.pop()
    setPlaced(at === undefined ? placed.slice(0, -1) : placed.filter((_, i) => i !== at))
    setStatus('playing')
  }
  const clear = (): void => {
    if (!open) return
    sfx.pop()
    setPlaced([])
    setStatus('playing')
  }
  const toggleCapital = (): void => {
    if (!open) return
    const next = !capital
    setCapital(next)
    sfx.pop()
    if (placed.length === tiles.length) evaluate(placed, next)
  }
  const accept = (): void => solve(placed.map(textOf), Math.max(mistakes, 1))
  const skip = (): void => {
    stopCountdown()
    setStatus('timeup')
  }

  useKeys((e) => {
    if (status === 'solved' || status === 'timeup') {
      if (
        e.key === 'ArrowRight' ||
        e.key === 'PageDown' ||
        ((e.key === ' ' || e.key === 'Enter') && noFocusedButton(e))
      ) {
        e.preventDefault()
        onNext()
      }
      return
    }
    if (/^[1-9]$/.test(e.key)) {
      const free = tiles.filter((t) => !placed.includes(t.id))
      const tile = free[Number(e.key) - 1]
      if (tile) choose(tile.id)
    } else if (e.key === 'Backspace') remove()
  })

  const free = tiles.filter((t) => !placed.includes(t.id))
  const firstWord = firstWordIndex(placed.map(textOf))
  const done = status === 'solved' || status === 'timeup'
  const shown = answerText(sentence, placed.map(textOf), punct)
  const sizeClass = tiles.length > 13 ? 's3' : tiles.length > 9 ? 's2' : 's1'

  return (
    <>
      <TopBar progress={progress} turn={turn} onExit={onExit}>
        {time > 0 && !done && (
          <span className={`g-timer ord-timer ${countdown.seconds <= 10 ? 'low' : ''}`}>
            ⏱️ {countdown.seconds}
          </span>
        )}
      </TopBar>

      {status === 'solved' && <Burst />}
      {done ? (
        <div className={`ord-answer ${status}`}>
          <p>{shown}</p>
          <span className="ord-answer-note">
            {status === 'solved' ? '👏 ¡Muy bien!' : '⏰ Esta era la oración'}
          </span>
        </div>
      ) : (
        <div
          className={`ord-strip ${sizeClass} ${status === 'wrong' ? 'wrong' : ''} ${dragging ? 'over' : ''}`}
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => {
            e.preventDefault()
            setDragging(false)
            const id = Number(e.dataTransfer.getData('text/plain'))
            if (!Number.isNaN(id)) choose(id)
          }}
        >
          {placed.length === 0 && (
            <span className="ord-placeholder">Toca o arrastra las palabras en orden</span>
          )}
          {placed.map((id, i) => {
            const text = textOf(id)
            const shownText = punct && capital && i === firstWord ? capitalize(text) : text
            return (
              <button
                key={id}
                className={`ord-chip ${sizeClass} ${isMark(text) ? 'mark' : ''}`}
                aria-label={`Quitar ${text}`}
                onClick={() => remove(i)}
              >
                {shownText}
              </button>
            )
          })}
        </div>
      )}

      {!done && (
        <div className={`ord-tiles ${sizeClass}`}>
          {free.map((t, i) => (
            <button
              key={t.id}
              className={`ord-tile ${sizeClass} ${isMark(t.text) ? 'mark' : ''}`}
              draggable={status === 'playing'}
              disabled={status !== 'playing'}
              onDragStart={(e) => e.dataTransfer.setData('text/plain', String(t.id))}
              onClick={() => choose(t.id)}
            >
              {i < 9 && (
                <span className="ord-tile-key" aria-hidden>
                  {i + 1}
                </span>
              )}
              {t.text}
            </button>
          ))}
        </div>
      )}

      <div className="row ord-actions">
        {done ? (
          <button className="btn big" onClick={onNext}>
            {last ? 'Terminar' : 'Siguiente →'}
          </button>
        ) : (
          <>
            {punct && (
              <button
                className={`btn secondary ord-cap ${capital ? 'on' : ''} ${status === 'needcap' ? 'hint' : ''}`}
                aria-pressed={capital}
                onClick={toggleCapital}
              >
                Aa Mayúscula inicial
              </button>
            )}
            <button
              className="btn secondary"
              disabled={placed.length === 0}
              onClick={() => remove()}
            >
              ⌫ Borrar
            </button>
            <button className="btn secondary" disabled={placed.length === 0} onClick={clear}>
              ↺ Otra vez
            </button>
            <button className="btn secondary" onClick={skip}>
              Saltar
            </button>
          </>
        )}
      </div>
      <p className="ord-message">
        {status === 'wrong' ? (
          <>
            Todavía no. Toca una palabra para quitarla.{' '}
            <button className="btn small secondary" onClick={accept}>
              ✔ La clase dice que está bien
            </button>
          </>
        ) : status === 'needcap' ? (
          '¡Casi! Falta algo: la oración empieza con mayúscula.'
        ) : done ? (
          <span className="muted">Flecha → o Espacio: siguiente</span>
        ) : (
          <span className="muted">Toca las palabras en orden (o usa las teclas 1, 2, 3…)</span>
        )}
      </p>
    </>
  )
}
