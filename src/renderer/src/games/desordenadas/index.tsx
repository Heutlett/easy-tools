import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import '../_palabras/palabras.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { WordListPicker } from '../../components/games/Pickers'
import Scoreboard from '../../components/games/Scoreboard'
import type { WordItem } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { shuffle } from '../../lib/games/shuffle'
import { useCountdown } from '../../lib/games/useCountdown'
import { usePersistentState } from '../../lib/usePersistentState'
import ChipRow from '../_palabras/Chips'
import {
  baseLetter,
  cleanText,
  countOptions,
  fitCount,
  isLetter,
  itemsFromLists
} from '../_palabras/text'
import { noFocusedButton, useKeys } from '../_palabras/useKeys'
import { scrambleIds } from './scramble'

type Status = 'playing' | 'solved' | 'timeout' | 'skipped'

interface Settings {
  count: number
  seconds: number
}

type Phase =
  | { name: 'lists' }
  | { name: 'setup'; pool: WordItem[] }
  | {
      name: 'play'
      run: number
      pool: WordItem[]
      words: WordItem[]
      players: Player[]
      settings: Settings
    }

export default function Unscramble(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'lists' })

  if (phase.name === 'lists')
    return (
      <WordListPicker
        startLabel="Siguiente →"
        onStart={(lists) => setPhase({ name: 'setup', pool: itemsFromLists(lists) })}
      />
    )

  if (phase.name === 'setup')
    return (
      <Setup
        pool={phase.pool}
        onBack={() => setPhase({ name: 'lists' })}
        onStart={(players, settings) =>
          setPhase({
            name: 'play',
            run: 0,
            pool: phase.pool,
            words: phase.pool.slice(0, settings.count),
            players,
            settings
          })
        }
      />
    )

  const again = (): void => {
    const pool = shuffle(phase.pool)
    setPhase({ ...phase, run: phase.run + 1, pool, words: pool.slice(0, phase.settings.count) })
  }
  return (
    <Round
      key={phase.run}
      words={phase.words}
      players={phase.players}
      seconds={phase.settings.seconds}
      onAgain={again}
      onChange={() => setPhase({ name: 'lists' })}
    />
  )
}

function Setup({
  pool,
  onStart,
  onBack
}: {
  pool: WordItem[]
  onStart: (players: Player[], settings: Settings) => void
  onBack: () => void
}): React.JSX.Element {
  const [savedCount, setSavedCount] = usePersistentState('game:desordenadas:count', 10)
  const [seconds, setSeconds] = usePersistentState('game:desordenadas:seconds', 0)
  const options = countOptions(pool.length, [5, 10, 15, 20])
  const count = fitCount(savedCount, options)
  return (
    <div className="g-stage">
      <button className="btn secondary ds-back" onClick={onBack}>
        ← Cambiar de listas
      </button>
      <section className="panel pw-options">
        <ChipRow
          label="Cuántas palabras"
          value={count}
          options={options.map((n) => ({ value: n, label: String(n) }))}
          onChange={setSavedCount}
        />
        <ChipRow
          label="Tiempo por palabra"
          value={seconds}
          options={[
            { value: 0, label: 'Sin tiempo' },
            { value: 30, label: '30 s' },
            { value: 60, label: '1 min' },
            { value: 90, label: '1 min 30 s' }
          ]}
          onChange={setSeconds}
        />
      </section>
      <PlayerSetup optional onStart={(players) => onStart(players, { count, seconds })} />
    </div>
  )
}

function Round({
  words,
  players,
  seconds,
  onAgain,
  onChange
}: {
  words: WordItem[]
  players: Player[]
  seconds: number
  onAgain: () => void
  onChange: () => void
}): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [solved, setSolved] = useState(0)
  const [points, setPoints] = useState(0)
  const [finished, setFinished] = useState(false)
  const { scores, add, ranking, leaders } = useScores(players)
  const player = players.length > 0 ? players[index % players.length] : undefined

  const resolved = (status: Status, earned: number): void => {
    if (status === 'solved') setSolved((n) => n + 1)
    setPoints((p) => p + earned)
    if (player && earned > 0) add(player.id, earned)
  }
  const next = (): void => {
    if (index + 1 >= words.length) {
      setFinished(true)
      sfx.win()
    } else setIndex(index + 1)
  }

  if (finished) {
    return (
      <div className="g-stage g-center">
        <p className="g-win">🎉 ¡Terminamos!</p>
        <p className="ds-final">
          {solved} de {words.length} palabras armadas
        </p>
        {players.length > 0 ? (
          <>
            <p className="ds-final">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        ) : (
          <p className="ds-final">⭐ {points} puntos</p>
        )}
        <div className="row start">
          <button className="btn big" onClick={onAgain}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onChange}>
            Cambiar de listas
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="g-stage ds">
      <WordRound
        key={index}
        item={words[index]}
        label={`Palabra ${index + 1} / ${words.length}`}
        player={player}
        seconds={seconds}
        last={index + 1 >= words.length}
        onResolved={resolved}
        onNext={next}
        onExit={onChange}
      />
      {players.length > 0 && (
        <Scoreboard players={players} scores={scores} currentId={player?.id} compact />
      )}
    </div>
  )
}

interface Tile {
  id: number
  /** Cómo se ve (mayúscula, con su tilde) */
  ch: string
  /** La letra sin tilde, para comparar */
  base: string
}

function WordRound({
  item,
  label,
  player,
  seconds,
  last,
  onResolved,
  onNext,
  onExit
}: {
  item: WordItem
  label: string
  player: Player | undefined
  seconds: number
  last: boolean
  onResolved: (status: Status, earned: number) => void
  onNext: () => void
  onExit: () => void
}): React.JSX.Element {
  const chars = useMemo(() => Array.from(cleanText(item.text)), [item])
  const tiles = useMemo<Tile[]>(
    () =>
      chars
        .filter(isLetter)
        .map((ch, id) => ({ id, ch: ch.toLocaleUpperCase('es'), base: baseLetter(ch) })),
    [chars]
  )
  const bases = useMemo(() => tiles.map((t) => t.base), [tiles])
  const goal = bases.join('')
  const total = tiles.length

  const [order, setOrder] = useState<number[]>(() =>
    scrambleIds(
      tiles.map((t) => t.id),
      bases,
      goal
    )
  )
  const [placed, setPlaced] = useState<number[]>([])
  const [locked, setLocked] = useState(0)
  const [hints, setHints] = useState(0)
  const [clueOpen, setClueOpen] = useState(false)
  const [status, setStatus] = useState<Status>('playing')
  const [earned, setEarned] = useState(0)
  const [wrongTry, setWrongTry] = useState(false)
  const notified = useRef(false)

  const countdown = useCountdown({
    ticks: true,
    onEnd: () => setStatus((s) => (s === 'playing' ? 'timeout' : s))
  })
  const { start: startTimer, stop: stopTimer } = countdown

  useEffect(() => {
    if (seconds > 0) startTimer(seconds)
    return stopTimer
  }, [seconds, startTimer, stopTimer])

  // Avisa una sola vez a la partida cuando esta palabra se resolvió (o se acabó el tiempo)
  const resolvedRef = useRef(onResolved)
  useEffect(() => {
    resolvedRef.current = onResolved
  })
  useEffect(() => {
    if (status === 'playing' || notified.current) return
    notified.current = true
    stopTimer()
    resolvedRef.current(status, status === 'solved' ? earned : 0)
  }, [status, earned, stopTimer])

  const playing = status === 'playing'
  const tileById = (id: number): Tile => tiles[id]

  const check = (next: number[], usedHints: number): void => {
    if (next.length < total) return
    if (next.map((id) => tileById(id).base).join('') === goal) {
      const fast = seconds > 0 && countdown.seconds * 2 >= seconds
      setEarned(Math.max(1, 3 - usedHints) + (fast ? 1 : 0))
      setStatus('solved')
      sfx.correct()
    } else {
      setWrongTry(true)
      sfx.wrong()
    }
  }

  const place = (id: number): void => {
    if (!playing || placed.includes(id) || placed.length >= total) return
    const next = [...placed, id]
    setPlaced(next)
    setWrongTry(false)
    sfx.pop()
    check(next, hints)
  }
  const placeLetter = (letter: string): void => {
    const id = order.find((i) => !placed.includes(i) && tileById(i).base === letter)
    if (id !== undefined) place(id)
  }
  const remove = (position: number): void => {
    if (!playing || position < locked) return
    setPlaced(placed.filter((_, i) => i !== position))
    setWrongTry(false)
    sfx.pop()
  }
  const clear = (): void => {
    if (!playing) return
    setPlaced(placed.slice(0, locked))
    setWrongTry(false)
  }
  const reshuffle = (): void => {
    if (!playing) return
    const keep = placed.slice(0, locked)
    const rest = order.filter((id) => !keep.includes(id))
    setPlaced(keep)
    setOrder([...keep, ...scrambleIds(rest, bases, goal.slice(locked))])
    setWrongTry(false)
    sfx.pop()
  }
  const hint = (): void => {
    if (!playing) return
    if (item.clue && !clueOpen) {
      setClueOpen(true)
      setHints(hints + 1)
      return
    }
    if (locked >= total) return
    const keep = placed.slice(0, locked)
    const tile = tiles.find((t) => !keep.includes(t.id) && t.base === bases[locked])
    if (!tile) return
    const next = [...keep, tile.id]
    setPlaced(next)
    setLocked(locked + 1)
    setHints(hints + 1)
    setWrongTry(false)
    sfx.pop()
    check(next, hints + 1)
  }
  const skip = (): void => {
    if (!playing) return
    setStatus('skipped')
    sfx.pop()
  }

  useKeys((e) => {
    if (playing) {
      if (e.key.length === 1 && isLetter(e.key)) placeLetter(baseLetter(e.key))
      else if (e.key === 'Backspace') {
        e.preventDefault()
        if (placed.length > locked) remove(placed.length - 1)
      }
    } else if (
      e.key === 'ArrowRight' ||
      e.key === 'PageDown' ||
      ((e.key === 'Enter' || e.key === ' ') && noFocusedButton(e))
    ) {
      e.preventDefault()
      onNext()
    }
  })

  // Tamaño de las fichas según cuántas letras hay
  const size = total <= 8 ? 72 : total <= 12 ? 64 : total <= 16 ? 54 : total <= 22 ? 46 : 38
  let letterIndex = -1
  const groups: { ch: string; key: number; slot: number }[][] = [[]]
  chars.forEach((ch, key) => {
    if (ch === ' ') groups.push([])
    else groups[groups.length - 1].push({ ch, key, slot: isLetter(ch) ? ++letterIndex : -1 })
  })

  const done = !playing
  return (
    <>
      <div className="row ds-top">
        <div className="row start">
          <span className="g-badge">{label}</span>
          {player && (
            <span className="g-badge ds-turn" style={{ borderColor: player.color }}>
              Turno: {player.emoji} {player.name}
            </span>
          )}
        </div>
        <div className="row start">
          {seconds > 0 && (
            <span className={`g-timer ${playing && countdown.seconds <= 5 ? 'low' : ''}`}>
              ⏱ {countdown.seconds}
            </span>
          )}
          <button className="btn secondary" onClick={onExit}>
            Salir
          </button>
        </div>
      </div>

      <p className="ds-clue" aria-live="polite">
        {clueOpen && item.clue ? `💡 ${item.clue}` : ' '}
      </p>

      <div
        className={`ds-slots ${wrongTry ? 'wrong pw-shake' : ''}`}
        style={{ '--tile': `${size}px` } as React.CSSProperties}
      >
        {groups.map((group, gi) => (
          <span key={gi} className="ds-group">
            {group.map(({ ch, key, slot }) => {
              if (slot < 0)
                return (
                  <span key={key} className="ds-sep">
                    {ch}
                  </span>
                )
              const id = placed[slot]
              const shown = done ? tiles[slot].ch : id !== undefined ? tileById(id).ch : ''
              return (
                <button
                  key={key}
                  className={`ds-slot ${shown ? 'filled' : ''} ${slot < locked ? 'locked' : ''} ${
                    done ? (status === 'solved' ? 'ok' : 'miss') : ''
                  } ${playing && slot === placed.length ? 'next' : ''}`}
                  disabled={!playing || id === undefined || slot < locked}
                  aria-label={shown ? `Quitar la letra ${shown}` : 'Casilla vacía'}
                  onClick={() => remove(slot)}
                >
                  {shown}
                </button>
              )
            })}
          </span>
        ))}
      </div>

      {playing ? (
        <>
          <div className="ds-pool" style={{ '--tile': `${size}px` } as React.CSSProperties}>
            {order.map((id) => (
              <button
                key={id}
                className={`ds-tile ${placed.includes(id) ? 'used' : ''}`}
                disabled={placed.includes(id)}
                onClick={() => place(id)}
              >
                {tileById(id).ch}
              </button>
            ))}
          </div>
          <div className="row ds-actions">
            <div className="row start">
              <button className="btn secondary" onClick={hint}>
                💡 Pista
              </button>
              <button className="btn secondary" onClick={reshuffle}>
                🔀 Mezclar de nuevo
              </button>
              <button className="btn secondary" onClick={clear} disabled={placed.length <= locked}>
                ↩ Borrar
              </button>
            </div>
            <button className="btn secondary" onClick={skip}>
              Saltar ⏭
            </button>
          </div>
          <p className="muted pw-hint">
            Toca las letras o escríbelas con el teclado · Borrar letra: Retroceso
          </p>
        </>
      ) : (
        <div className={`ds-result ${status === 'solved' ? 'good' : 'bad'}`}>
          <p className="ds-result-title">
            {status === 'solved'
              ? `🎉 ¡Correcto! +${earned} ${earned === 1 ? 'punto' : 'puntos'}`
              : status === 'timeout'
                ? '⏰ ¡Se acabó el tiempo! La palabra era:'
                : 'La palabra era:'}
          </p>
          <button className="btn big" autoFocus onClick={onNext}>
            {last ? 'Ver resultados' : 'Siguiente palabra →'}
          </button>
        </div>
      )}
    </>
  )
}
