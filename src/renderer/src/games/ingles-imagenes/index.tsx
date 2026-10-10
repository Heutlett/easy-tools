import { useEffect, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import type { Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { sfx } from '../../lib/games/sfx'
import { useCountdown } from '../../lib/games/useCountdown'
import { useVoice } from '../../lib/games/useVoice'
import { makeChoices, sampleWords } from '../_ingles/quiz'
import { GradeRow, PillRow, TopicRow, Visual, VoiceNotice } from '../_ingles/ui'
import { LETTERS, optionKey, topicName, useKeys, usePrefs } from '../_ingles/hooks'
import { wordsFor, type TopicId, type Word } from '../_ingles/vocab'

type Mode = 'auto' | 'see' | 'read' | 'mix'

interface Prefs {
  grade: Grade
  topics: TopicId[]
  mode: Mode
  rounds: number
  seconds: number
}

const DEFAULTS: Prefs = { grade: 1, topics: [], mode: 'auto', rounds: 15, seconds: 0 }

interface Question {
  word: Word
  options: Word[]
  /** see: se ve el dibujo y se elige la palabra; read: se lee la palabra y se elige el dibujo */
  dir: 'see' | 'read'
}

function buildQuestions(prefs: Prefs): Question[] {
  const pool = wordsFor(prefs.grade, prefs.topics)
  return sampleWords(pool, prefs.rounds).map((word, i) => {
    const dir =
      prefs.mode === 'mix'
        ? i % 2 === 0
          ? 'see'
          : 'read'
        : prefs.mode === 'auto'
          ? prefs.grade <= 2
            ? 'read'
            : 'see'
          : prefs.mode
    return { word, options: makeChoices(word, pool), dir }
  })
}

type Phase =
  | { name: 'setup' }
  | { name: 'players' }
  | { name: 'play'; players: Player[]; questions: Question[]; run: number }

export default function WhatIsIt(): React.JSX.Element {
  const [prefs, setPrefs] = usePrefs('ingles-imagenes', DEFAULTS)
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
            setPhase({ name: 'play', players, questions: buildQuestions(prefs), run: 0 })
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
      prefs={prefs}
      players={phase.players}
      questions={phase.questions}
      onAgain={() => setPhase({ ...phase, questions: buildQuestions(prefs), run: phase.run + 1 })}
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
  const pool = wordsFor(prefs.grade, prefs.topics)
  const rounds = Math.min(prefs.rounds, pool.length)
  return (
    <section className="panel ing-setup">
      <GradeRow value={prefs.grade} onChange={(grade) => onChange({ grade, topics: [] })} />
      <TopicRow
        grade={prefs.grade}
        value={prefs.topics}
        onChange={(topics) => onChange({ topics })}
      />
      <PillRow
        label="Cómo"
        value={prefs.mode}
        options={[
          { id: 'auto', label: '✨ Según el grado' },
          { id: 'see', label: '👀 Dibujo → palabra' },
          { id: 'read', label: '🔤 Palabra → dibujo' },
          { id: 'mix', label: '🔀 Mezclado' }
        ]}
        onChange={(mode) => onChange({ mode })}
      />
      <PillRow
        label="Preguntas"
        value={prefs.rounds}
        options={[10, 15, 20, 30].map((n) => ({ id: n, label: String(n) }))}
        onChange={(n) => onChange({ rounds: n })}
      />
      <PillRow
        label="Tiempo"
        value={prefs.seconds}
        options={[
          { id: 0, label: '♾️ Sin tiempo' },
          { id: 20, label: '20 s' },
          { id: 10, label: '10 s' },
          { id: 5, label: '5 s' }
        ]}
        onChange={(seconds) => onChange({ seconds })}
      />
      <div className="ing-info">
        <p className={pool.length < 4 ? 'notice' : 'muted'}>
          {pool.length} palabras{rounds < prefs.rounds ? ` (se jugarán ${rounds})` : ''}
        </p>
        <button className="btn big" disabled={pool.length < 4} onClick={onNext}>
          Siguiente →
        </button>
      </div>
    </section>
  )
}

function Round({
  prefs,
  players,
  questions,
  onAgain,
  onExit
}: {
  prefs: Prefs
  players: Player[]
  questions: Question[]
  onAgain: () => void
  onExit: () => void
}): React.JSX.Element {
  const voice = useVoice('en')
  const { scores, add, ranking, leaders } = useScores(players)
  const [index, setIndex] = useState(0)
  /** Opción elegida: null = todavía no, -1 = se acabó el tiempo */
  const [picked, setPicked] = useState<number | null>(null)
  const [finished, setFinished] = useState(false)
  const [streaks, setStreaks] = useState<Record<string, number>>({})
  const [correctCount, setCorrectCount] = useState(0)
  const [bestStreak, setBestStreak] = useState(0)
  const [bonus, setBonus] = useState(false)
  const nextRef = useRef<HTMLButtonElement>(null)

  const q = questions[index]
  const player = players.length ? players[index % players.length] : null
  const key = player?.id ?? 'solo'
  const streak = streaks[key] ?? 0
  const answerIndex = q ? q.options.findIndex((o) => o.en === q.word.en) : -1

  const timer = useCountdown({ onEnd: () => answer(-1), ticks: true })

  function answer(i: number): void {
    if (picked !== null || finished) return
    timer.stop()
    const ok = i === answerIndex
    const run = ok ? streak + 1 : 0
    const extra = ok && run >= 3
    setPicked(i)
    setBonus(extra)
    setStreaks({ ...streaks, [key]: run })
    if (ok) {
      setCorrectCount((n) => n + 1)
      setBestStreak((b) => Math.max(b, run))
      if (player) add(player.id, extra ? 2 : 1)
      sfx.correct()
    } else if (i >= 0) sfx.wrong()
    // La voz dice la palabra correcta, para que la clase la escuche y la repita
    window.setTimeout(() => voice.speak(q.word.en, 0.8), ok ? 350 : 650)
  }

  const next = (): void => {
    if (picked === null) return
    if (index + 1 < questions.length) {
      setIndex(index + 1)
      setPicked(null)
      setBonus(false)
    } else {
      setFinished(true)
      sfx.win()
    }
  }

  // Cada pregunta nueva: arranca el tiempo y, si se lee la palabra, la voz la dice
  useEffect(() => {
    if (finished) return
    if (prefs.seconds > 0) timer.start(prefs.seconds)
    if (q?.dir === 'read') {
      const id = window.setTimeout(() => voice.speak(q.word.en, 0.8), 300)
      return () => window.clearTimeout(id)
    }
    return undefined
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished])

  useEffect(() => {
    if (picked !== null) nextRef.current?.focus({ preventScroll: true })
  }, [picked])

  useKeys((e, bodyFocus) => {
    if (finished) return
    const n = optionKey(e)
    if (n >= 0 && picked === null) {
      e.preventDefault()
      answer(n)
    } else if (
      e.key === 'ArrowRight' ||
      e.key === 'PageDown' ||
      (bodyFocus && /^( |Enter)$/.test(e.key))
    ) {
      if (picked !== null) {
        e.preventDefault()
        next()
      }
    }
  })

  if (finished) {
    const total = questions.length
    return (
      <div className="g-stage g-center ing-end">
        <p className="g-win">🎉 Great job!</p>
        {players.length > 0 ? (
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
        ) : null}
        <div className="ing-stats">
          <div className="ing-stat">
            <b>
              {correctCount}/{total}
            </b>
            <span>correct</span>
          </div>
          <div className="ing-stat">
            <b>🔥 {bestStreak}</b>
            <span>best streak</span>
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

  const revealed = picked !== null
  const ok = revealed && picked === answerIndex
  const meaning = `${q.word.en} = ${q.word.es}`
  const message = !revealed
    ? q.dir === 'read'
      ? 'Which one is it?'
      : 'What is it?'
    : ok
      ? `${bonus ? '✅ Great! +2 🔥' : '✅ Correct!'}  ${meaning}`
      : `${picked === -1 ? '⏰ Time is up!' : '❌ Oops!'}  ${meaning}`
  return (
    <div className="ing-stage">
      <div className="ing-hud">
        <span className="g-badge">
          {index + 1} / {questions.length}
        </span>
        <span className="g-badge">{topicName(q.word.topic)}</span>
        {player && (
          <span className="g-badge ii-turn" style={{ background: `${player.color}22` }}>
            {player.emoji} {player.name}
          </span>
        )}
        {streak >= 2 && (
          <span className="ing-streak" key={streak + key}>
            🔥 {streak}
          </span>
        )}
        <span className="spacer" />
        <VoiceNotice available={voice.available} />
        {prefs.seconds > 0 && !revealed && (
          <span className={`g-timer ${timer.seconds <= 5 ? 'low' : ''}`} aria-live="off">
            ⏱ {timer.seconds}
          </span>
        )}
      </div>

      {q.dir === 'see' ? (
        <div className="ing-card big-visual ii-prompt">
          <Visual v={q.word.visual} />
          <p className={`ing-sub ${revealed ? (ok ? 'good' : 'bad') : ''}`}>{message}</p>
        </div>
      ) : (
        <div className="ing-card ii-prompt">
          <div className="ii-word-line">
            <span className="ing-word">{q.word.en}</span>
            {voice.available && (
              <button className="ing-speak" onClick={() => voice.speak(q.word.en, 0.8)}>
                🔊 Listen
              </button>
            )}
          </div>
          <p className={`ing-sub ${revealed ? (ok ? 'good' : 'bad') : ''}`}>{message}</p>
        </div>
      )}

      {q.dir === 'see' ? (
        <div className="ing-options" role="group" aria-label="Opciones">
          {q.options.map((o, i) => {
            const cls = !revealed
              ? ''
              : i === answerIndex
                ? 'correct'
                : i === picked
                  ? 'wrong'
                  : 'dim'
            return (
              <button
                key={o.en}
                className={`g-option ${cls}`}
                disabled={revealed}
                onClick={() => answer(i)}
              >
                <span className="g-letter">{LETTERS[i]}</span>
                {o.en}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="ing-picks" role="group" aria-label="Opciones">
          {q.options.map((o, i) => {
            const cls = !revealed
              ? ''
              : i === answerIndex
                ? 'correct'
                : i === picked
                  ? 'wrong'
                  : 'dim'
            return (
              <button
                key={o.en}
                className={`ing-pick ${cls}`}
                disabled={revealed}
                aria-label={revealed ? o.en : `Opción ${LETTERS[i]}`}
                onClick={() => answer(i)}
              >
                <span className="ing-letter">{LETTERS[i]}</span>
                <Visual v={o.visual} />
                <span className="ing-pick-label">{revealed ? o.en : ''}</span>
              </button>
            )
          })}
        </div>
      )}

      <div className="ii-controls">
        <button className="btn big" ref={nextRef} disabled={!revealed} onClick={next}>
          {index + 1 < questions.length ? 'Next →' : 'Finish'}
        </button>
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
        <span className="spacer" />
        <span className="muted ing-hint">Teclas 1–4 o A–D · → siguiente</span>
      </div>

      {players.length > 0 && (
        <div className="ii-scores">
          <Scoreboard players={players} scores={scores} currentId={player?.id} compact />
        </div>
      )}
    </div>
  )
}
