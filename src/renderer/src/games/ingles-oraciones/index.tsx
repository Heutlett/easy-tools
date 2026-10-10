import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import type { Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { useVoice } from '../../lib/games/useVoice'
import { LETTERS, optionKey, useKeys, usePrefs } from '../_ingles/hooks'
import { core, sentenceTopics, sentencesFor, type Sentence } from '../_ingles/sentences'
import { GradeRow, PillRow, VoiceNotice } from '../_ingles/ui'

type Mode = 'build' | 'fill' | 'mix'

interface Prefs {
  grade: Grade
  topics: string[]
  mode: Mode
  hint: boolean
  rounds: number
}

const DEFAULTS: Prefs = { grade: 1, topics: [], mode: 'mix', hint: true, rounds: 10 }

interface Item {
  sentence: Sentence
  kind: 'build' | 'fill'
}

function buildItems(prefs: Prefs): Item[] {
  const topics = prefs.topics.filter((t) => sentenceTopics(prefs.grade).includes(t))
  const pool = sentencesFor(prefs.grade, topics, prefs.mode === 'fill')
  return shuffle(pool)
    .slice(0, prefs.rounds)
    .map((sentence, i) => ({
      sentence,
      kind:
        prefs.mode === 'build'
          ? 'build'
          : prefs.mode === 'fill'
            ? 'fill'
            : sentence.fill && i % 2 === 1
              ? 'fill'
              : 'build'
    }))
}

type Phase =
  | { name: 'setup' }
  | { name: 'players' }
  | { name: 'play'; players: Player[]; items: Item[]; run: number }

export default function BuildTheSentence(): React.JSX.Element {
  const [prefs, setPrefs] = usePrefs('ingles-oraciones', DEFAULTS)
  const [phase, setPhase] = useState<Phase>({ name: 'setup' })

  if (phase.name === 'setup')
    return <Setup prefs={prefs} onChange={setPrefs} onNext={() => setPhase({ name: 'players' })} />

  if (phase.name === 'players')
    return (
      <div className="ing-stage">
        <PlayerSetup
          optional
          startLabel="Start ▶"
          onStart={(players) =>
            setPhase({ name: 'play', players, items: buildItems(prefs), run: 0 })
          }
        />
        <div className="row start">
          <button className="btn secondary" onClick={() => setPhase({ name: 'setup' })}>
            ← Volver
          </button>
        </div>
      </div>
    )

  return (
    <Round
      key={phase.run}
      hint={prefs.hint}
      players={phase.players}
      items={phase.items}
      onAgain={() => setPhase({ ...phase, items: buildItems(prefs), run: phase.run + 1 })}
      onExit={() => setPhase({ name: 'setup' })}
    />
  )
}

function Setup({
  prefs,
  onChange,
  onNext
}: {
  prefs: Prefs
  onChange: (patch: Partial<Prefs>) => void
  onNext: () => void
}): React.JSX.Element {
  const topics = sentenceTopics(prefs.grade)
  const active = prefs.topics.filter((t) => topics.includes(t))
  const pool = sentencesFor(prefs.grade, active, prefs.mode === 'fill')
  return (
    <section className="panel ing-setup">
      <GradeRow value={prefs.grade} onChange={(grade) => onChange({ grade, topics: [] })} />
      <div className="bank-filter-row">
        <span className="bank-filter-label">Temas</span>
        <div className="pills" role="group" aria-label="Temas">
          <button
            className={`pill small ${active.length === 0 ? 'selected' : ''}`}
            aria-pressed={active.length === 0}
            onClick={() => onChange({ topics: [] })}
          >
            ⭐ All
          </button>
          {topics.map((t) => {
            const on = active.includes(t)
            return (
              <button
                key={t}
                className={`pill small ${on ? 'selected' : ''}`}
                aria-pressed={on}
                onClick={() =>
                  onChange({ topics: on ? active.filter((x) => x !== t) : [...active, t] })
                }
              >
                {t}
              </button>
            )
          })}
        </div>
      </div>
      <PillRow
        label="Cómo"
        value={prefs.mode}
        options={[
          { id: 'mix', label: '🔀 Both' },
          { id: 'build', label: '🧩 Build the sentence' },
          { id: 'fill', label: '✏️ Fill the blank' }
        ]}
        onChange={(mode) => onChange({ mode })}
      />
      <PillRow
        label="Pista"
        value={prefs.hint ? 1 : 0}
        options={[
          { id: 1, label: '🇪🇸 Con traducción' },
          { id: 0, label: '🙈 Sin traducción' }
        ]}
        onChange={(v) => onChange({ hint: v === 1 })}
      />
      <PillRow
        label="Cuántas"
        value={prefs.rounds}
        options={[10, 15, 20].map((n) => ({ id: n, label: String(n) }))}
        onChange={(rounds) => onChange({ rounds })}
      />
      <div className="ing-info">
        <p className="muted">{pool.length} oraciones</p>
        <button className="btn big" disabled={pool.length < 4} onClick={onNext}>
          Siguiente →
        </button>
      </div>
    </section>
  )
}

/** Lo que cada ejercicio le dice a la partida cuando se resuelve */
interface ItemProps {
  item: Sentence
  hint: boolean
  voice: ReturnType<typeof useVoice>
  isLast: boolean
  onResolve: (firstTry: boolean) => void
  onNext: () => void
  onExit: () => void
}

function Round({
  hint,
  players,
  items,
  onAgain,
  onExit
}: {
  hint: boolean
  players: Player[]
  items: Item[]
  onAgain: () => void
  onExit: () => void
}): React.JSX.Element {
  const voice = useVoice('en')
  const { scores, add, ranking, leaders } = useScores(players)
  const [index, setIndex] = useState(0)
  const [finished, setFinished] = useState(false)
  const [perfect, setPerfect] = useState(0)
  const player = players.length ? players[index % players.length] : null
  const item = items[index]

  const resolve = (firstTry: boolean): void => {
    if (firstTry) {
      setPerfect((n) => n + 1)
      if (player) add(player.id, 1)
    }
  }
  const next = (): void => {
    if (index + 1 < items.length) setIndex(index + 1)
    else {
      setFinished(true)
      sfx.win()
    }
  }

  if (finished) {
    return (
      <div className="g-stage g-center ing-end">
        <p className="g-win">🎉 Well done!</p>
        {players.length > 0 && (
          <>
            <p className="ing-winner">
              {leaders.length === 1
                ? `Ganó ${leaders[0].emoji} ${leaders[0].name}`
                : leaders.length > 1
                  ? `Empate: ${leaders.map((l) => l.name).join(' y ')}`
                  : 'Nadie sumó puntos'}
            </p>
            <Scoreboard players={ranking} scores={scores} />
          </>
        )}
        <div className="ing-stats">
          <div className="ing-stat">
            <b>
              {perfect}/{items.length}
            </b>
            <span>at first try</span>
          </div>
        </div>
        <div className="row start">
          <button className="btn big" onClick={onAgain}>
            Play again
          </button>
          <button className="btn secondary" onClick={onExit}>
            Cambiar ajustes
          </button>
        </div>
      </div>
    )
  }

  const common: ItemProps = {
    item: item.sentence,
    hint,
    voice,
    isLast: index + 1 === items.length,
    onResolve: resolve,
    onNext: next,
    onExit
  }

  return (
    <div className="ing-stage">
      <div className="ing-hud">
        <span className="g-badge">
          {index + 1} / {items.length}
        </span>
        <span className="g-badge">{item.sentence.topic}</span>
        {player && (
          <span className="g-badge" style={{ background: `${player.color}22` }}>
            {player.emoji} {player.name}
          </span>
        )}
        <span className="spacer" />
        <VoiceNotice available={voice.available} />
      </div>
      {item.kind === 'build' ? (
        <BuildItem key={index} {...common} />
      ) : (
        <FillItem key={index} {...common} />
      )}
      {players.length > 0 && (
        <div className="io-scores">
          <Scoreboard players={players} scores={scores} currentId={player?.id} compact />
        </div>
      )}
    </div>
  )
}

interface Tile {
  id: number
  text: string
}

function BuildItem({
  item,
  hint,
  voice,
  isLast,
  onResolve,
  onNext,
  onExit
}: ItemProps): React.JSX.Element {
  const tiles = useMemo<Tile[]>(() => {
    const base = item.tokens.map((text, id) => ({ id, text }))
    // Que no salgan ya en orden
    for (let tries = 0; tries < 8; tries++) {
      const mixed = shuffle(base)
      if (mixed.some((t, i) => t.text !== item.tokens[i])) return mixed
    }
    return [...base].reverse()
  }, [item])
  const [placed, setPlaced] = useState<number[]>([])
  const [bad, setBad] = useState<number[]>([])
  const [tries, setTries] = useState(0)
  const [status, setStatus] = useState<'playing' | 'right' | 'shown'>('playing')
  const [showHint, setShowHint] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)

  const byId = (id: number): Tile => tiles.find((t) => t.id === id) as Tile
  const bank = tiles.filter((t) => !placed.includes(t.id))
  const done = status !== 'playing'
  const complete = placed.length === tiles.length

  const place = (id: number): void => {
    if (done) return
    sfx.pop()
    setBad([])
    setPlaced([...placed, id])
  }
  const unplace = (id: number): void => {
    if (done) return
    sfx.pop()
    setBad([])
    setPlaced(placed.filter((p) => p !== id))
  }
  const speakIt = (): void => voice.speak(item.en, 0.85)

  const check = (): void => {
    if (done || !complete) return
    const wrong = placed.flatMap((id, i) => (byId(id).text !== item.tokens[i] ? [i] : []))
    if (wrong.length === 0) {
      setStatus('right')
      sfx.correct()
      onResolve(tries === 0)
      window.setTimeout(speakIt, 400)
    } else {
      setTries(tries + 1)
      setBad(wrong)
      sfx.wrong()
    }
  }
  const show = (): void => {
    if (done) return
    const used = new Set<number>()
    setPlaced(
      item.tokens.map((text) => {
        const tile = tiles.find((t) => t.text === text && !used.has(t.id)) as Tile
        used.add(tile.id)
        return tile.id
      })
    )
    setStatus('shown')
    onResolve(false)
    window.setTimeout(speakIt, 300)
  }

  useEffect(() => {
    if (done) nextRef.current?.focus({ preventScroll: true })
  }, [done])

  useKeys((e, bodyFocus) => {
    if (e.key === 'Backspace' && !done && placed.length > 0) {
      e.preventDefault()
      unplace(placed[placed.length - 1])
    } else if (bodyFocus && e.key === 'Enter') {
      e.preventDefault()
      if (done) onNext()
      else check()
    } else if (e.key === 'ArrowRight' && done) {
      e.preventDefault()
      onNext()
    }
  })

  const hintOn = hint || showHint
  return (
    <>
      <div className="io-hint">
        {hintOn ? (
          <span>🇪🇸 {item.es}</span>
        ) : (
          <button className="btn secondary small" onClick={() => setShowHint(true)}>
            💡 Show hint
          </button>
        )}
        {voice.available && (
          <button className="ing-speak" onClick={speakIt}>
            🔊 Listen
          </button>
        )}
      </div>

      <div
        className={`io-line ${status === 'right' ? 'ok' : ''} ${placed.length === 0 ? 'empty' : ''}`}
        aria-label="Tu oración"
      >
        {placed.map((id, i) => (
          <button
            key={id}
            className={`io-tile placed ${bad.includes(i) ? 'bad' : ''}`}
            disabled={done}
            onClick={() => unplace(id)}
          >
            {byId(id).text}
          </button>
        ))}
        {placed.length > 0 && <span className="io-end">{item.end}</span>}
      </div>

      <div className="io-bank" aria-label="Palabras">
        {bank.map((t) => (
          <button key={t.id} className="io-tile" onClick={() => place(t.id)}>
            {t.text}
          </button>
        ))}
      </div>

      <div className="io-controls">
        {!done ? (
          <>
            <button className="btn big" disabled={!complete} onClick={check}>
              Check ✔
            </button>
            <button
              className="btn secondary"
              disabled={placed.length === 0}
              onClick={() => (setPlaced([]), setBad([]))}
            >
              Clear
            </button>
            <button className="btn secondary" onClick={show}>
              Show answer
            </button>
          </>
        ) : (
          <>
            <span className={`ing-sub ${status === 'right' ? 'good' : 'bad'}`}>
              {status === 'right'
                ? tries === 0
                  ? '✅ Perfect!'
                  : '✅ Correct!'
                : '👀 Look at the answer'}
            </span>
            <button className="btn big" ref={nextRef} onClick={onNext}>
              {isLast ? 'Finish' : 'Next →'}
            </button>
          </>
        )}
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
        {tries > 0 && !done && <span className="ing-sub bad">Try again</span>}
      </div>
    </>
  )
}

function FillItem({
  item,
  hint,
  voice,
  isLast,
  onResolve,
  onNext,
  onExit
}: ItemProps): React.JSX.Element {
  const fill = item.fill as NonNullable<Sentence['fill']>
  const options = useMemo(() => shuffle(fill.options), [fill])
  const [picked, setPicked] = useState<number | null>(null)
  const [showHint, setShowHint] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)
  const answerIndex = options.indexOf(fill.answer)
  const revealed = picked !== null
  const ok = revealed && picked === answerIndex
  const speakIt = (): void => voice.speak(item.en, 0.85)

  const answer = (i: number): void => {
    if (revealed) return
    setPicked(i)
    if (i === answerIndex) sfx.correct()
    else sfx.wrong()
    onResolve(i === answerIndex)
    window.setTimeout(speakIt, i === answerIndex ? 400 : 700)
  }

  useEffect(() => {
    if (revealed) nextRef.current?.focus({ preventScroll: true })
  }, [revealed])

  useKeys((e, bodyFocus) => {
    const n = optionKey(e, options.length)
    if (n >= 0 && !revealed) {
      e.preventDefault()
      answer(n)
    } else if (revealed && (e.key === 'ArrowRight' || (bodyFocus && /^( |Enter)$/.test(e.key)))) {
      e.preventDefault()
      onNext()
    }
  })

  const cls = (i: number): string =>
    !revealed ? '' : i === answerIndex ? 'correct' : i === picked ? 'wrong' : 'dim'
  const hintOn = hint || showHint
  // La puntuación pegada a la palabra que se quita («recycle,») se conserva
  const target = item.words[fill.index]
  const suffix = target.slice(
    target.toLowerCase().indexOf(core(target).toLowerCase()) + core(target).length
  )

  return (
    <>
      <div className="ing-card">
        <p className="io-sentence">
          {item.words.map((w, i) =>
            i === fill.index ? (
              <span
                key={i}
                className={`io-blank ${revealed ? (ok ? 'good' : 'bad') : ''}`}
                aria-label="palabra que falta"
              >
                {revealed ? fill.answer : ' '}
                {suffix}
              </span>
            ) : (
              <span key={i}>{w}</span>
            )
          )}
          <span>{item.end}</span>
        </p>
        <p className={`ing-sub ${revealed ? (ok ? 'good' : 'bad') : ''}`}>
          {revealed ? (ok ? '✅ Correct!' : `❌ It is “${fill.answer}”`) : 'Which word is missing?'}
        </p>
      </div>

      <div className="io-hint">
        {hintOn ? (
          <span>🇪🇸 {item.es}</span>
        ) : (
          <button className="btn secondary small" onClick={() => setShowHint(true)}>
            💡 Show hint
          </button>
        )}
        {voice.available && revealed && (
          <button className="ing-speak" onClick={speakIt}>
            🔊 Listen
          </button>
        )}
      </div>

      <div className="ing-options" role="group" aria-label="Opciones">
        {options.map((o, i) => (
          <button
            key={o}
            className={`g-option ${cls(i)}`}
            disabled={revealed}
            onClick={() => answer(i)}
          >
            <span className="g-letter">{LETTERS[i]}</span>
            {o}
          </button>
        ))}
      </div>

      <div className="io-controls">
        <button className="btn big" ref={nextRef} disabled={!revealed} onClick={onNext}>
          {isLast ? 'Finish' : 'Next →'}
        </button>
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
      </div>
    </>
  )
}
