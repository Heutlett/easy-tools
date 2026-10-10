import { useMemo, useRef, useState } from 'react'
import './style.css'
import '../_palabras/palabras.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import { WordListPicker } from '../../components/games/Pickers'
import Scoreboard from '../../components/games/Scoreboard'
import type { WordItem } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import ChipRow from '../_palabras/Chips'
import {
  KEY_ROWS,
  baseLetter,
  cleanText,
  countOptions,
  fitCount,
  isLetter,
  itemsFromLists,
  lettersOnly
} from '../_palabras/text'
import { noFocusedButton, useKeys } from '../_palabras/useKeys'
import IceCream, { MAX_ERRORS } from './IceCream'

type Phase =
  | { name: 'menu' }
  | { name: 'lists' }
  | { name: 'setup'; pool: WordItem[] }
  | { name: 'secret' }
  | {
      name: 'play'
      run: number
      words: WordItem[]
      players: Player[]
      pool: WordItem[] | null
      count: number
    }

export default function Hangman(): React.JSX.Element {
  const [phase, setPhase] = useState<Phase>({ name: 'menu' })

  if (phase.name === 'menu')
    return (
      <Menu
        onClass={() => setPhase({ name: 'lists' })}
        onSecret={() => setPhase({ name: 'secret' })}
      />
    )

  if (phase.name === 'lists')
    return (
      <div className="g-stage">
        <button className="btn secondary ah-back" onClick={() => setPhase({ name: 'menu' })}>
          ← Volver
        </button>
        <WordListPicker
          startLabel="Siguiente →"
          onStart={(lists) => setPhase({ name: 'setup', pool: itemsFromLists(lists) })}
        />
      </div>
    )

  if (phase.name === 'setup')
    return (
      <Setup
        pool={phase.pool}
        onBack={() => setPhase({ name: 'lists' })}
        onStart={(players, n) =>
          setPhase({
            name: 'play',
            run: 0,
            words: phase.pool.slice(0, n),
            players,
            pool: phase.pool,
            count: n
          })
        }
      />
    )

  if (phase.name === 'secret')
    return (
      <Secret
        onBack={() => setPhase({ name: 'menu' })}
        onStart={(item) =>
          setPhase({
            name: 'play',
            run: Date.now(),
            words: [item],
            players: [],
            pool: null,
            count: 1
          })
        }
      />
    )

  const again = (): void => {
    if (!phase.pool) return setPhase({ name: 'secret' })
    // Se vuelve a mezclar para que no salgan las mismas palabras
    const pool = shuffle(phase.pool)
    setPhase({ ...phase, run: phase.run + 1, words: pool.slice(0, phase.count), pool })
  }
  return (
    <Round
      key={phase.run}
      words={phase.words}
      players={phase.players}
      secret={phase.pool === null}
      onExit={() => setPhase({ name: 'menu' })}
      onAgain={again}
    />
  )
}

function Menu({
  onClass,
  onSecret
}: {
  onClass: () => void
  onSecret: () => void
}): React.JSX.Element {
  return (
    <div className="ah-menu">
      <div className="ah-menu-art" aria-hidden>
        <IceCream errors={0} />
      </div>
      <div className="ah-menu-cards">
        <button className="ah-menu-card" onClick={onClass}>
          <span className="ah-menu-emoji" aria-hidden>
            🏫
          </span>
          <strong>Toda la clase</strong>
          <span>Palabras de las listas, con equipos si quieren</span>
        </button>
        <button className="ah-menu-card" onClick={onSecret}>
          <span className="ah-menu-emoji" aria-hidden>
            🤫
          </span>
          <strong>Mi palabra</strong>
          <span>Escribo una palabra secreta para que la adivinen</span>
        </button>
      </div>
    </div>
  )
}

function Setup({
  pool,
  onStart,
  onBack
}: {
  pool: WordItem[]
  onStart: (players: Player[], count: number) => void
  onBack: () => void
}): React.JSX.Element {
  const [saved, setSaved] = usePersistentState('game:ahorcado:count', 10)
  const options = countOptions(pool.length, [5, 10, 15, 20])
  const count = fitCount(saved, options)
  return (
    <div className="g-stage">
      <button className="btn secondary ah-back" onClick={onBack}>
        ← Cambiar de listas
      </button>
      <section className="panel pw-options">
        <ChipRow
          label="Cuántas palabras"
          value={count}
          options={options.map((n) => ({ value: n, label: String(n) }))}
          onChange={setSaved}
        />
      </section>
      <PlayerSetup optional onStart={(players) => onStart(players, count)} />
    </div>
  )
}

function Secret({
  onStart,
  onBack
}: {
  onStart: (item: WordItem) => void
  onBack: () => void
}): React.JSX.Element {
  const [word, setWord] = useState('')
  const [clue, setClue] = useState('')
  const [visible, setVisible] = useState(false)
  const valid = lettersOnly(word).length > 0
  return (
    <form
      className="panel ah-secret"
      onSubmit={(e) => {
        e.preventDefault()
        if (valid) onStart({ text: cleanText(word), ...(clue.trim() ? { clue: clue.trim() } : {}) })
      }}
    >
      <label className="form-field">
        <span>Palabra secreta</span>
        <div className="ah-secret-row">
          <input
            className="field ah-secret-input"
            type={visible ? 'text' : 'password'}
            value={word}
            maxLength={30}
            autoFocus
            autoComplete="off"
            spellCheck={false}
            aria-label="Palabra secreta"
            onChange={(e) => setWord(e.target.value)}
          />
          <button
            type="button"
            className="icon-btn"
            aria-label={visible ? 'Ocultar la palabra' : 'Mostrar la palabra'}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? '🙈' : '👁️'}
          </button>
        </div>
      </label>
      <label className="form-field">
        <span>Pista (opcional)</span>
        <input
          className="field"
          value={clue}
          maxLength={80}
          autoComplete="off"
          aria-label="Pista"
          onChange={(e) => setClue(e.target.value)}
        />
      </label>
      <div className="row start">
        <button className="btn big" type="submit" disabled={!valid}>
          Empezar
        </button>
        <button className="btn secondary" type="button" onClick={onBack}>
          ← Volver
        </button>
      </div>
    </form>
  )
}

function Round({
  words,
  players,
  secret,
  onExit,
  onAgain
}: {
  words: WordItem[]
  players: Player[]
  secret: boolean
  onExit: () => void
  onAgain: () => void
}): React.JSX.Element {
  const [index, setIndex] = useState(0)
  const [guessed, setGuessed] = useState<string[]>([])
  const [extraErrors, setExtraErrors] = useState(0)
  const [solved, setSolved] = useState(false)
  const [clueOpen, setClueOpen] = useState(false)
  const [saying, setSaying] = useState(false)
  const [said, setSaid] = useState('')
  const [saidWrong, setSaidWrong] = useState(false)
  const [turn, setTurn] = useState(0)
  const [won, setWon] = useState(0)
  const [finished, setFinished] = useState(false)
  const { scores, add, ranking, leaders } = useScores(players)
  const sayRef = useRef<HTMLInputElement>(null)

  const item = words[index]
  const chars = useMemo(() => Array.from(cleanText(item.text)), [item])
  const wanted = useMemo(() => new Set(chars.filter(isLetter).map(baseLetter)), [chars])
  const wrongLetters = guessed.filter((g) => !wanted.has(g))
  const errors = wrongLetters.length + extraErrors
  const complete = solved || [...wanted].every((l) => guessed.includes(l))
  const lost = !complete && errors >= MAX_ERRORS
  const over = complete || lost
  const current = players.length > 0 ? players[turn % players.length] : undefined

  const credit = (points: number): void => {
    if (current) add(current.id, points)
  }

  const pickLetter = (letter: string): void => {
    if (over || guessed.includes(letter)) return
    const next = [...guessed, letter]
    setGuessed(next)
    if (wanted.has(letter)) {
      credit(1)
      if ([...wanted].every((l) => next.includes(l))) {
        credit(3)
        setWon(won + 1)
        sfx.win()
      } else sfx.correct()
    } else {
      sfx.wrong()
      setTurn(turn + 1)
    }
  }

  const sayWord = (): void => {
    if (over) return
    if (lettersOnly(said) === lettersOnly(item.text)) {
      credit(3 + [...wanted].filter((l) => !guessed.includes(l)).length)
      setSolved(true)
      setWon(won + 1)
      setSaying(false)
      sfx.win()
    } else {
      setExtraErrors(extraErrors + 1)
      setTurn(turn + 1)
      setSaidWrong(true)
      setSaid('')
      sfx.wrong()
    }
  }

  const nextWord = (): void => {
    if (!over) return
    if (index + 1 >= words.length) {
      setFinished(true)
      sfx.win()
      return
    }
    setIndex(index + 1)
    setGuessed([])
    setExtraErrors(0)
    setSolved(false)
    setClueOpen(false)
    setSaying(false)
    setSaid('')
    setSaidWrong(false)
    // Cada palabra empieza con el equipo siguiente
    setTurn(index + 1)
  }

  useKeys((e) => {
    if (finished) return
    if (e.key.length === 1 && isLetter(e.key)) {
      if (!saying) pickLetter(baseLetter(e.key))
    } else if (over && !secret && (e.key === 'ArrowRight' || e.key === 'PageDown')) {
      e.preventDefault()
      nextWord()
    } else if (over && (e.key === 'Enter' || e.key === ' ') && noFocusedButton(e)) {
      e.preventDefault()
      if (secret) onAgain()
      else nextWord()
    }
  })

  if (finished) {
    return (
      <div className="g-stage g-center">
        <p className="g-win">🎉 ¡Terminamos!</p>
        <p className="ah-final">
          {won} de {words.length} palabras adivinadas
        </p>
        {players.length > 0 && (
          <>
            <p className="ah-final">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        )}
        <div className="row start">
          <button className="btn big" onClick={onAgain}>
            Jugar otra vez
          </button>
          <button className="btn secondary" onClick={onExit}>
            Salir
          </button>
        </div>
      </div>
    )
  }

  // Tamaño de las casillas según la palabra más larga, para que quepa en la pantalla
  const longest = Math.max(
    ...cleanText(item.text)
      .split(' ')
      .map((w) => w.length)
  )
  const slot = Math.max(34, Math.min(80, Math.floor(690 / longest) - 8))
  const groups: { ch: string; key: number }[][] = [[]]
  chars.forEach((ch, key) => {
    if (ch === ' ') groups.push([])
    else groups[groups.length - 1].push({ ch, key })
  })

  return (
    <div className="g-stage ah">
      <div className="row ah-top">
        <div className="row start">
          {!secret && (
            <span className="g-badge">
              Palabra {index + 1} / {words.length}
            </span>
          )}
          {current && (
            <span className="g-badge ah-turn" style={{ borderColor: current.color }}>
              Turno: {current.emoji} {current.name}
            </span>
          )}
        </div>
        <div className="row start">
          {item.clue && (
            <button
              className="btn secondary"
              aria-pressed={clueOpen}
              onClick={() => setClueOpen(!clueOpen)}
            >
              💡 Pista
            </button>
          )}
          {!over && (
            <button
              className="btn secondary"
              onClick={() => {
                setSaying(!saying)
                setSaidWrong(false)
                setTimeout(() => sayRef.current?.focus(), 0)
              }}
            >
              🗣️ Decir la palabra
            </button>
          )}
          <button className="btn secondary" onClick={onExit}>
            Salir
          </button>
        </div>
      </div>

      <div className="ah-main">
        <div className="ah-art">
          <IceCream errors={errors} />
          <div
            className="ah-lives"
            aria-label={`Intentos que quedan: ${Math.max(0, MAX_ERRORS - errors)}`}
          >
            {Array.from({ length: MAX_ERRORS }, (_, i) => (
              <span key={i} className={i < MAX_ERRORS - errors ? 'on' : ''} />
            ))}
          </div>
        </div>

        <div className="ah-side">
          <div className="ah-word" style={{ '--slot': `${slot}px` } as React.CSSProperties}>
            {groups.map((group, gi) => (
              <span key={gi} className="ah-group">
                {group.map(({ ch, key }) =>
                  isLetter(ch) ? (
                    <span
                      key={key}
                      className={`ah-slot ${
                        over
                          ? guessed.includes(baseLetter(ch)) || complete
                            ? 'shown'
                            : 'missed'
                          : guessed.includes(baseLetter(ch))
                            ? 'shown'
                            : ''
                      }`}
                    >
                      {over || guessed.includes(baseLetter(ch))
                        ? over
                          ? ch.toLocaleUpperCase('es')
                          : baseLetter(ch)
                        : ''}
                    </span>
                  ) : (
                    <span key={key} className="ah-sep">
                      {ch}
                    </span>
                  )
                )}
              </span>
            ))}
          </div>

          <p className="ah-clue" aria-live="polite">
            {clueOpen && item.clue ? `💡 ${item.clue}` : ''}
          </p>

          {over ? (
            <div className={`ah-result ${complete ? 'good' : 'bad'}`}>
              <p className="ah-result-title">
                {complete ? '🎉 ¡Muy bien, la adivinaron!' : '🍦 ¡Se derritió! La palabra era:'}
              </p>
              <div className="row start">
                {secret ? (
                  <>
                    <button className="btn big" autoFocus onClick={onAgain}>
                      Otra palabra
                    </button>
                    <button className="btn secondary" onClick={onExit}>
                      Salir
                    </button>
                  </>
                ) : (
                  <button className="btn big" autoFocus onClick={nextWord}>
                    {index + 1 < words.length ? 'Siguiente palabra →' : 'Ver resultados'}
                  </button>
                )}
              </div>
            </div>
          ) : saying ? (
            <form
              className="ah-say"
              onSubmit={(e) => {
                e.preventDefault()
                sayWord()
              }}
            >
              <input
                ref={sayRef}
                className="field ah-say-input"
                value={said}
                maxLength={40}
                autoComplete="off"
                placeholder="Escribe la palabra completa"
                aria-label="La palabra completa"
                onChange={(e) => (setSaid(e.target.value), setSaidWrong(false))}
              />
              <button className="btn big" type="submit" disabled={!said.trim()}>
                Probar
              </button>
              <button className="btn secondary" type="button" onClick={() => setSaying(false)}>
                Cancelar
              </button>
              {saidWrong && <span className="ah-say-wrong">No es esa. ¡Cuenta como un fallo!</span>}
            </form>
          ) : (
            <div className="ah-keys" role="group" aria-label="Letras">
              {KEY_ROWS.map((row) => (
                <div key={row} className="ah-keyrow">
                  {Array.from(row).map((letter) => {
                    const used = guessed.includes(letter)
                    const hit = used && wanted.has(letter)
                    return (
                      <button
                        key={letter}
                        className={`ah-key ${used ? (hit ? 'hit' : 'miss') : ''}`}
                        disabled={used}
                        onClick={() => pickLetter(letter)}
                      >
                        {letter}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {players.length > 0 && (
        <Scoreboard players={players} scores={scores} currentId={current?.id} compact />
      )}
    </div>
  )
}
