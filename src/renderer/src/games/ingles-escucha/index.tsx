import { useEffect, useMemo, useRef, useState } from 'react'
import './style.css'
import PlayerSetup from '../../components/games/PlayerSetup'
import Scoreboard from '../../components/games/Scoreboard'
import type { Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { shuffle } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { useVoice } from '../../lib/games/useVoice'
import { LETTERS, optionKey, topicName, useKeys, usePrefs } from '../_ingles/hooks'
import { makeChoices, sampleWords } from '../_ingles/quiz'
import { GradeRow, PillRow, TopicRow, Visual, VoiceNotice } from '../_ingles/ui'
import { wordsFor, type TopicId, type Word } from '../_ingles/vocab'
import { FAMILIES, QUESTIONS, typesConflict } from './data'

type Kind = 'words' | 'phrases' | 'qa' | 'dict'

interface Prefs {
  grade: Grade
  kind: Kind
  topics: TopicId[]
  pics: boolean
  rounds: number
  slow: boolean
  clue: boolean
}

const DEFAULTS: Prefs = {
  grade: 1,
  kind: 'words',
  topics: [],
  pics: true,
  rounds: 10,
  slow: false,
  clue: true
}

type Question =
  | { type: 'word'; word: Word; options: Word[]; pics: boolean }
  | { type: 'text'; label: string; say: string; es: string; options: string[]; answer: string }
  | { type: 'dict'; word: Word }

/** Palabras que se pueden deletrear: una sola palabra, de 3 a 9 letras */
const spellable = (w: Word): boolean => /^[a-z]{3,9}$/.test(w.en)

function phrasePool(grade: Grade): { family: number; en: string; es: string }[] {
  return FAMILIES.flatMap((f, family) =>
    f.grade === grade ? f.phrases.map(([en, es]) => ({ family, en, es })) : []
  )
}

function buildQuestions(prefs: Prefs): Question[] {
  const { grade, kind, rounds } = prefs
  if (kind === 'words') {
    const pool = wordsFor(grade, prefs.topics)
    return sampleWords(pool, rounds).map((word) => ({
      type: 'word',
      word,
      options: makeChoices(word, pool),
      pics: prefs.pics
    }))
  }
  if (kind === 'dict') {
    return sampleWords(wordsFor(grade, prefs.topics).filter(spellable), rounds).map((word) => ({
      type: 'dict',
      word
    }))
  }
  if (kind === 'phrases') {
    return shuffle(phrasePool(grade))
      .slice(0, rounds)
      .map((p) => {
        const siblings = phrasePool(grade).filter((x) => x.family === p.family && x.en !== p.en)
        const wrong = shuffle(siblings)
          .slice(0, 3)
          .map((x) => x.en)
        return {
          type: 'text',
          label: FAMILIES[p.family].topic,
          say: p.en,
          es: p.es,
          options: shuffle([p.en, ...wrong]),
          answer: p.en
        }
      })
  }
  const all = QUESTIONS.filter((q) => q[0] === grade)
  return shuffle(all)
    .slice(0, rounds)
    .map(([, type, question, answer, es]) => {
      const others = shuffle(all.filter((o) => !typesConflict(type, o[1]) && o[3] !== answer))
      const wrong: string[] = []
      for (const o of others) if (wrong.length < 3 && !wrong.includes(o[3])) wrong.push(o[3])
      return {
        type: 'text',
        label: 'Questions',
        say: question,
        es,
        options: shuffle([answer, ...wrong]),
        answer
      }
    })
}

/** Cuántas preguntas hay para lo elegido */
function available(prefs: Prefs): number {
  if (prefs.kind === 'words') return wordsFor(prefs.grade, prefs.topics).length
  if (prefs.kind === 'dict') return wordsFor(prefs.grade, prefs.topics).filter(spellable).length
  if (prefs.kind === 'phrases') return phrasePool(prefs.grade).length
  return QUESTIONS.filter((q) => q[0] === prefs.grade).length
}

type Phase =
  | { name: 'setup' }
  | { name: 'players' }
  | { name: 'play'; players: Player[]; questions: Question[]; run: number }

export default function ListenAndChoose(): React.JSX.Element {
  const [prefs, setPrefs] = usePrefs('ingles-escucha', DEFAULTS)
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
  const count = available(prefs)
  const wordKind = prefs.kind === 'words' || prefs.kind === 'dict'
  return (
    <section className="panel ing-setup">
      <GradeRow value={prefs.grade} onChange={(grade) => onChange({ grade, topics: [] })} />
      <PillRow
        label="Qué"
        value={prefs.kind}
        options={[
          { id: 'words', label: '🔤 Words' },
          { id: 'phrases', label: '💬 Phrases' },
          { id: 'qa', label: '❓ Questions and answers' },
          { id: 'dict', label: '✍️ Dictation' }
        ]}
        onChange={(kind) => onChange({ kind })}
      />
      {wordKind && (
        <TopicRow
          grade={prefs.grade}
          value={prefs.topics}
          onChange={(topics) => onChange({ topics })}
        />
      )}
      {prefs.kind === 'words' && (
        <PillRow
          label="Respuestas"
          value={prefs.pics ? 1 : 0}
          options={[
            { id: 1, label: '🖼️ Dibujos' },
            { id: 0, label: '🔡 Palabras escritas' }
          ]}
          onChange={(v) => onChange({ pics: v === 1 })}
        />
      )}
      {prefs.kind === 'dict' && (
        <PillRow
          label="Pista"
          value={prefs.clue ? 1 : 0}
          options={[
            { id: 1, label: '🖼️ Con dibujo' },
            { id: 0, label: '🙈 Solo la voz' }
          ]}
          onChange={(v) => onChange({ clue: v === 1 })}
        />
      )}
      <PillRow
        label="Voz"
        value={prefs.slow ? 1 : 0}
        options={[
          { id: 0, label: '🔊 Normal' },
          { id: 1, label: '🐢 Lenta' }
        ]}
        onChange={(v) => onChange({ slow: v === 1 })}
      />
      <PillRow
        label="Cuántas"
        value={prefs.rounds}
        options={[10, 15, 20].map((n) => ({ id: n, label: String(n) }))}
        onChange={(rounds) => onChange({ rounds })}
      />
      <div className="ing-info">
        <p className={count < 4 ? 'notice' : 'muted'}>{count} disponibles</p>
        <button className="btn big" disabled={count < 4} onClick={onNext}>
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
  const [finished, setFinished] = useState(false)
  const [perfect, setPerfect] = useState(0)
  const q = questions[index]
  const player = players.length ? players[index % players.length] : null

  const rate = prefs.slow ? 0.55 : 0.9
  const say = (text: string, slow = false): void => voice.speak(text, slow ? 0.5 : rate)
  const spoken = q?.type === 'text' ? q.say : q?.word.en

  const resolve = (ok: boolean): void => {
    if (ok) {
      setPerfect((n) => n + 1)
      if (player) add(player.id, 1)
    }
  }
  const next = (): void => {
    if (index + 1 < questions.length) setIndex(index + 1)
    else {
      setFinished(true)
      sfx.win()
    }
  }

  // Cada pregunta nueva: la voz la dice sola
  useEffect(() => {
    if (finished || !spoken) return
    const id = window.setTimeout(() => voice.speak(spoken, rate), 450)
    return () => window.clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, finished, voice.available])

  if (finished) {
    return (
      <div className="g-stage g-center ing-end">
        <p className="g-win">🎉 Great listening!</p>
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
              {perfect}/{questions.length}
            </b>
            <span>{prefs.kind === 'dict' ? 'at first try' : 'correct'}</span>
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

  const common = {
    voice,
    say,
    isLast: index + 1 === questions.length,
    onResolve: resolve,
    onNext: next,
    onExit
  }
  const label =
    q.type === 'text' ? q.label : q.type === 'word' ? topicName(q.word.topic) : 'Dictation'

  return (
    <div className="ing-stage">
      <div className="ing-hud">
        <span className="g-badge">
          {index + 1} / {questions.length}
        </span>
        <span className="g-badge">{label}</span>
        {player && (
          <span className="g-badge" style={{ background: `${player.color}22` }}>
            {player.emoji} {player.name}
          </span>
        )}
        <span className="spacer" />
        <VoiceNotice available={voice.available} />
      </div>
      {q.type === 'dict' ? (
        <Dictation key={index} word={q.word} clue={prefs.clue} {...common} />
      ) : (
        <Choice key={index} q={q} {...common} />
      )}
      {players.length > 0 && (
        <div className="ie-scores">
          <Scoreboard players={players} scores={scores} currentId={player?.id} compact />
        </div>
      )}
    </div>
  )
}

interface CommonProps {
  voice: ReturnType<typeof useVoice>
  say: (text: string, slow?: boolean) => void
  isLast: boolean
  onResolve: (ok: boolean) => void
  onNext: () => void
  onExit: () => void
}

/** Los botones de «escuchar otra vez» y «más despacio» */
function ListenButtons({
  voice,
  say,
  text
}: {
  voice: CommonProps['voice']
  say: CommonProps['say']
  text: string
}): React.JSX.Element | null {
  if (!voice.available) return null
  return (
    <div className="ie-buttons">
      <button className="ing-speak" onClick={() => say(text)}>
        🔊 Repeat
      </button>
      <button className="ing-speak" onClick={() => say(text, true)}>
        🐢 Slow
      </button>
    </div>
  )
}

function Choice({
  q,
  voice,
  say,
  isLast,
  onResolve,
  onNext,
  onExit
}: CommonProps & { q: Exclude<Question, { type: 'dict' }> }): React.JSX.Element {
  const [picked, setPicked] = useState<number | null>(null)
  const nextRef = useRef<HTMLButtonElement>(null)
  const isWord = q.type === 'word'
  const options = isWord ? q.options.map((o) => o.en) : q.options
  const answerIndex = isWord ? options.indexOf(q.word.en) : options.indexOf(q.answer)
  const text = isWord ? q.word.en : q.say
  const es = isWord ? q.word.es : q.es
  const revealed = picked !== null
  const ok = revealed && picked === answerIndex
  const full = !isWord && q.label === 'Questions' ? `${q.say} → ${q.answer}` : text

  const answer = (i: number): void => {
    if (revealed) return
    setPicked(i)
    const right = i === answerIndex
    if (right) sfx.correct()
    else sfx.wrong()
    onResolve(right)
    // La voz dice lo correcto (una frase de respuesta se dice completa)
    window.setTimeout(() => say(options[answerIndex]), right ? 450 : 750)
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
    } else if (!revealed && (e.key === 'r' || e.key === 'R')) say(text)
  })

  const cls = (i: number): string =>
    !revealed ? '' : i === answerIndex ? 'correct' : i === picked ? 'wrong' : 'dim'

  return (
    <>
      <div className="ing-card ie-stage-card">
        {!voice.available || revealed ? (
          // Sin voz en inglés (o ya respondida): se muestra lo escrito
          <span className="ie-text">{revealed ? full : text}</span>
        ) : (
          <span className="ie-ear">👂</span>
        )}
        {voice.available && !revealed && <ListenButtons voice={voice} say={say} text={text} />}
        <p className={`ing-sub ${revealed ? (ok ? 'good' : 'bad') : ''}`}>
          {revealed
            ? `${ok ? '✅ Correct!' : '❌ Oops!'}  ${es}`
            : voice.available
              ? 'What do you hear?'
              : 'Choose the answer'}
        </p>
      </div>

      {isWord && q.pics ? (
        <div className="ing-picks" role="group" aria-label="Opciones">
          {q.options.map((o, i) => (
            <button
              key={o.en}
              className={`ing-pick ${cls(i)}`}
              disabled={revealed}
              aria-label={revealed ? o.en : `Opción ${LETTERS[i]}`}
              onClick={() => answer(i)}
            >
              <span className="ing-letter">{LETTERS[i]}</span>
              <Visual v={o.visual} />
              <span className="ing-pick-label">{revealed ? o.en : ''}</span>
            </button>
          ))}
        </div>
      ) : (
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
      )}

      <div className="ie-controls">
        <button className="btn big" ref={nextRef} disabled={!revealed} onClick={onNext}>
          {isLast ? 'Finish' : 'Next →'}
        </button>
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
        <span className="spacer" />
        <span className="muted ing-hint">Teclas 1–4 o A–D · R: repetir</span>
      </div>
    </>
  )
}

interface Letter {
  id: number
  ch: string
}

function Dictation({
  word,
  clue,
  voice,
  say,
  isLast,
  onResolve,
  onNext,
  onExit
}: CommonProps & { word: Word; clue: boolean }): React.JSX.Element {
  const letters = useMemo<Letter[]>(() => {
    const base = [...word.en].map((ch, id) => ({ id, ch }))
    for (let tries = 0; tries < 8; tries++) {
      const mixed = shuffle(base)
      if (mixed.some((l, i) => l.ch !== word.en[i])) return mixed
    }
    return [...base].reverse()
  }, [word])
  const [placed, setPlaced] = useState<number[]>([])
  const [bad, setBad] = useState<number[]>([])
  const [tries, setTries] = useState(0)
  const [status, setStatus] = useState<'playing' | 'right' | 'shown'>('playing')
  const nextRef = useRef<HTMLButtonElement>(null)
  const done = status !== 'playing'
  const byId = (id: number): Letter => letters.find((l) => l.id === id) as Letter
  // Sin voz no se puede dictar: se enseña el dibujo y el significado
  const showClue = clue || !voice.available

  const place = (id: number): void => {
    if (done) return
    sfx.pop()
    const nextPlaced = [...placed, id]
    setBad([])
    setPlaced(nextPlaced)
    if (nextPlaced.length === letters.length) {
      const wrong = nextPlaced.flatMap((p, i) => (byId(p).ch !== word.en[i] ? [i] : []))
      if (wrong.length === 0) {
        setStatus('right')
        sfx.correct()
        onResolve(tries === 0)
        window.setTimeout(() => say(word.en), 450)
      } else {
        setTries(tries + 1)
        setBad(wrong)
        sfx.wrong()
      }
    }
  }
  const unplace = (id: number): void => {
    if (done) return
    sfx.pop()
    setBad([])
    setPlaced(placed.filter((p) => p !== id))
  }
  const show = (): void => {
    if (done) return
    const used = new Set<number>()
    setPlaced(
      [...word.en].map((ch) => {
        const l = letters.find((x) => x.ch === ch && !used.has(x.id)) as Letter
        used.add(l.id)
        return l.id
      })
    )
    setBad([])
    setStatus('shown')
    onResolve(false)
    window.setTimeout(() => say(word.en), 300)
  }

  useEffect(() => {
    if (done) nextRef.current?.focus({ preventScroll: true })
  }, [done])

  useKeys((e, bodyFocus) => {
    if (e.key === 'Backspace' && !done && placed.length > 0) {
      e.preventDefault()
      unplace(placed[placed.length - 1])
    } else if (/^[a-z]$/i.test(e.key) && !done) {
      // Con el teclado se escribe la letra (la primera ficha libre que la tenga)
      const tile = letters.find((l) => l.ch === e.key.toLowerCase() && !placed.includes(l.id))
      if (tile) place(tile.id)
    } else if (done && (e.key === 'ArrowRight' || (bodyFocus && /^( |Enter)$/.test(e.key)))) {
      e.preventDefault()
      onNext()
    } else if (e.key === 'Enter' && !done && bodyFocus) say(word.en)
  })

  return (
    <>
      <div className="ing-card ie-stage-card">
        {showClue ? (
          <div className="ie-clue">
            <Visual v={word.visual} />
          </div>
        ) : (
          <span className="ie-ear">👂</span>
        )}
        <ListenButtons voice={voice} say={say} text={word.en} />
        <p className={`ing-sub ${status === 'right' ? 'good' : status === 'shown' ? 'bad' : ''}`}>
          {status === 'right'
            ? `${tries === 0 ? '✅ Perfect!' : '✅ Correct!'}  ${word.es}`
            : status === 'shown'
              ? `👀 ${word.en} = ${word.es}`
              : tries > 0
                ? 'Try again'
                : voice.available
                  ? 'Listen and spell the word'
                  : `Spell the word: ${word.es}`}
        </p>
      </div>

      <div className="ie-slots" aria-label="La palabra">
        {letters.map((_, i) => {
          const id = placed[i]
          return id === undefined ? (
            <span key={i} className="ie-slot" />
          ) : (
            <button
              key={i}
              className={`ie-slot filled ${bad.includes(i) ? 'bad' : status === 'right' ? 'good' : ''}`}
              disabled={done}
              onClick={() => unplace(id)}
            >
              {byId(id).ch}
            </button>
          )
        })}
      </div>

      <div className="ie-letters" aria-label="Letras">
        {letters
          .filter((l) => !placed.includes(l.id))
          .map((l) => (
            <button key={l.id} className="ie-letter" onClick={() => place(l.id)}>
              {l.ch}
            </button>
          ))}
      </div>

      <div className="ie-controls">
        {done ? (
          <button className="btn big" ref={nextRef} onClick={onNext}>
            {isLast ? 'Finish' : 'Next →'}
          </button>
        ) : (
          <>
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
        )}
        <button className="btn secondary" onClick={onExit}>
          Salir
        </button>
        <span className="spacer" />
        <span className="muted ing-hint">Escribe las letras con el teclado · Borrar: ←</span>
      </div>
    </>
  )
}
