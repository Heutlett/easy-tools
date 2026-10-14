import { useMemo, useState } from 'react'
import EndScreen from '../_lengua/EndScreen'
import { useGameKeys } from '../_lengua/useGameKeys'
import { useTurns } from '../_lengua/useTurns'
import Scoreboard from '../../components/games/Scoreboard'
import { gradeLabel } from '../../content/subjects'
import type { Grade } from '../../content/types'
import { useScores, type Player } from '../../lib/games/players'
import { pickOne, shuffleOptions } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { useVoice } from '../../lib/games/useVoice'
import { usePersistentState } from '../../lib/usePersistentState'
import { readingTexts } from './data'
import { QUESTION_KIND_LABEL, TEXT_KINDS, type ReadingText, type TextKind } from './types'

interface Props {
  grade: Grade
  kind: TextKind | null
  firstId: string | null
  players: Player[]
  onExit: () => void
}

const LETTERS = ['A', 'B', 'C', 'D']
const SIZES = [1, 1.15, 1.3, 1.5, 1.7, 1.9, 2.2]

type Stage = 'read' | 'ask' | 'result'

/** Una sesión: uno o varios textos seguidos con el mismo marcador. */
export default function Session({
  grade,
  kind,
  firstId,
  players,
  onExit
}: Props): React.JSX.Element {
  const pool = useMemo(
    () => readingTexts.filter((t) => t.grade === grade && (!kind || t.kind === kind)),
    [grade, kind]
  )
  const [played, setPlayed] = useState<string[]>(firstId ? [firstId] : [])
  const [finished, setFinished] = useState(false)
  const [hits, setHits] = useState(0)
  const [asked, setAsked] = useState(0)
  const { scores, add, reset, ranking, leaders } = useScores(players)
  const turns = useTurns(players)

  const pickNext = (): string | null => {
    const fresh = pool.filter((t) => !played.includes(t.id))
    const from = fresh.length ? fresh : pool
    return pickOne(from)?.id ?? null
  }
  const [currentId, setCurrentId] = useState<string | null>(() => firstId ?? pickNext())
  const text = readingTexts.find((t) => t.id === currentId)

  if (!text) {
    return (
      <div className="g-stage g-center">
        <p className="g-question">No hay textos con esos filtros.</p>
        <button className="btn" onClick={onExit}>
          Volver
        </button>
      </div>
    )
  }

  if (finished) {
    return (
      <EndScreen
        players={players}
        scores={scores}
        ranking={ranking}
        leaders={leaders}
        summary={`${hits} de ${asked} respuestas correctas`}
        onAgain={() => {
          reset()
          turns.reset()
          setHits(0)
          setAsked(0)
          setPlayed([])
          const first = pickOne(pool)?.id ?? null
          if (first) setPlayed([first])
          setCurrentId(first)
          setFinished(false)
        }}
        againLabel="Jugar otra vez"
        onExit={onExit}
        exitLabel="Elegir otro texto"
      />
    )
  }

  return (
    <TextRound
      key={text.id + played.length}
      text={text}
      players={players}
      scores={scores}
      add={add}
      turns={turns}
      textsRead={played.length}
      onAnswer={(ok) => {
        setAsked((n) => n + 1)
        if (ok) setHits((n) => n + 1)
      }}
      onNextText={() => {
        const next = pickNext()
        if (next) {
          setPlayed((p) => [...p, next])
          setCurrentId(next)
        }
      }}
      onFinish={() => {
        sfx.win()
        setFinished(true)
      }}
      onExit={onExit}
    />
  )
}

interface RoundProps {
  text: ReadingText
  players: Player[]
  scores: Record<string, number>
  add: (id: string, delta: number) => void
  turns: ReturnType<typeof useTurns>
  textsRead: number
  onAnswer: (ok: boolean) => void
  onNextText: () => void
  onFinish: () => void
  onExit: () => void
}

function TextRound({
  text,
  players,
  scores,
  add,
  turns,
  textsRead,
  onAnswer,
  onNextText,
  onFinish,
  onExit
}: RoundProps): React.JSX.Element {
  const voice = useVoice('es')
  const [stage, setStage] = useState<Stage>('read')
  const [size, setSize] = usePersistentState('game:comprension:size', 2)
  const [index, setIndex] = useState(0)
  const [picked, setPicked] = useState<number | null>(null)
  const [results, setResults] = useState<boolean[]>([])
  const [showText, setShowText] = useState(false)

  const questions = useMemo(
    () =>
      text.questions.map((q) => {
        const s = shuffleOptions({ options: q.options, answer: 0 })
        return { ...q, options: s.options, answer: s.answer }
      }),
    [text]
  )
  const q = questions[index]
  const kindInfo = TEXT_KINDS.find((k) => k.id === text.kind)
  const fontSize = SIZES[Math.max(0, Math.min(SIZES.length - 1, size))]

  const startAsking = (): void => {
    voice.stop()
    sfx.pop()
    setStage('ask')
  }

  const choose = (i: number): void => {
    if (stage !== 'ask' || picked !== null || i >= q.options.length) return
    setPicked(i)
    const ok = i === q.answer
    ok ? sfx.correct() : sfx.wrong()
    if (ok && turns.current) add(turns.current.id, 1)
    setResults((r) => [...r, ok])
    onAnswer(ok)
  }

  const next = (): void => {
    if (stage === 'read') return startAsking()
    if (stage === 'ask') {
      if (picked === null) return
      voice.stop()
      turns.next()
      if (index + 1 < questions.length) {
        setIndex(index + 1)
        setPicked(null)
      } else {
        sfx.win()
        setStage('result')
      }
      return
    }
    onNextText()
  }

  useGameKeys({ onOption: choose, onNext: next })

  const sizeControls = (
    <div className="cp-size" role="group" aria-label="Tamaño de la letra">
      <button
        className="icon-btn"
        aria-label="Letra más pequeña"
        disabled={size <= 0}
        onClick={() => setSize(size - 1)}
      >
        A−
      </button>
      <button
        className="icon-btn"
        aria-label="Letra más grande"
        disabled={size >= SIZES.length - 1}
        onClick={() => setSize(size + 1)}
      >
        A+
      </button>
    </div>
  )

  const body = (
    <div
      className={`cp-text cp-kind-${text.kind}`}
      style={{ fontSize: `${stage === 'ask' ? fontSize * 0.82 : fontSize}rem` }}
    >
      {text.paragraphs.map((p, i) => (
        <p key={i}>{p}</p>
      ))}
    </div>
  )

  const header = (
    <div className="ln-bar">
      <div className="ln-bar-left">
        <span className="g-badge">
          {kindInfo?.icon} {kindInfo?.title}
        </span>
        <span className="g-badge">{gradeLabel(text.grade)}</span>
        {textsRead > 1 && <span className="g-badge">Texto {textsRead}</span>}
      </div>
      <div className="ln-bar-left">
        <button className="btn secondary small" onClick={onExit}>
          Salir
        </button>
      </div>
    </div>
  )

  if (stage === 'read') {
    return (
      <div className="g-stage cp-read">
        {header}
        <h2 className="cp-title">
          <span aria-hidden>{text.emoji}</span> {text.title}
        </h2>
        {body}
        <div className="ln-bar cp-read-bar">
          <div className="ln-bar-left">
            {sizeControls}
            {voice.available && (
              <>
                <button
                  className="btn secondary"
                  onClick={() => voice.speak([text.title, ...text.paragraphs].join('\n'), 0.85)}
                >
                  🔊 Escuchar
                </button>
                <button className="btn secondary" onClick={voice.stop} aria-label="Detener la voz">
                  ⏹
                </button>
              </>
            )}
          </div>
          <button className="btn big" onClick={startAsking}>
            Ya lo leímos →
          </button>
        </div>
        <p className="muted ln-hint">Lean con calma. Cuando terminen, pasen a las preguntas.</p>
      </div>
    )
  }

  if (stage === 'result') {
    const good = results.filter(Boolean).length
    return (
      <div className="g-stage g-center cp-result">
        <p className="g-win">
          {good === questions.length
            ? '🌟 ¡Excelente!'
            : good >= questions.length / 2
              ? '👏 ¡Buen trabajo!'
              : '💪 ¡Sigamos practicando!'}
        </p>
        <p className="ln-winner">
          {good} de {questions.length} respuestas correctas
        </p>
        <div className="cp-dots" aria-hidden>
          {results.map((ok, i) => (
            <span key={i} className={`cp-dot ${ok ? 'ok' : 'bad'}`}>
              {ok ? '✓' : '✗'}
            </span>
          ))}
        </div>
        {players.length > 0 && <Scoreboard players={players} scores={scores} onAdd={add} compact />}
        <div className="row start">
          <button className="btn big" onClick={onNextText}>
            Otro texto →
          </button>
          <button className="btn secondary" onClick={onFinish}>
            Terminar
          </button>
        </div>
      </div>
    )
  }

  const revealed = picked !== null
  return (
    <div className="g-stage cp-ask">
      {header}
      <div className="cp-split">
        <div className={`cp-pane cp-text-pane ${showText ? 'open' : ''}`}>
          <h2 className="cp-title small">
            <span aria-hidden>{text.emoji}</span> {text.title}
          </h2>
          {body}
          {sizeControls}
        </div>
        <div className="cp-pane cp-q-pane">
          <div className="ln-bar">
            <div className="ln-bar-left">
              <span className="g-badge">
                {index + 1} / {questions.length}
              </span>
              <span className="g-badge">{QUESTION_KIND_LABEL[q.kind]}</span>
            </div>
            <div className="ln-bar-left">
              <button
                className="btn secondary small cp-toggle"
                onClick={() => setShowText(!showText)}
              >
                📖 {showText ? 'Ocultar el texto' : 'Ver el texto'}
              </button>
              {voice.available && (
                <button
                  className="btn secondary small"
                  onClick={() => voice.speak(q.text, 0.85)}
                  aria-label="Escuchar la pregunta"
                >
                  🔊
                </button>
              )}
            </div>
          </div>
          {turns.current && (
            <span
              className="ln-turn cp-turn"
              style={{ '--team': turns.current.color } as React.CSSProperties}
            >
              {turns.current.emoji} Turno de {turns.current.name}
            </span>
          )}
          <div className="g-question cp-question">{q.text}</div>
          <div className="g-options cp-options" role="group" aria-label="Opciones">
            {q.options.map((option, i) => (
              <button
                key={`${index}-${i}`}
                className={`g-option ${
                  revealed ? (i === q.answer ? 'correct' : i === picked ? 'wrong' : 'dim') : ''
                }`}
                disabled={revealed}
                onClick={() => choose(i)}
              >
                <span className="g-letter">{LETTERS[i]}</span>
                {option}
              </button>
            ))}
          </div>
          {revealed ? (
            <div className="cp-after">
              <p className="cp-note">
                {picked === q.answer ? '✅ ¡Correcto!' : '❌ No era esa.'}
                {q.explanation ? ` ${q.explanation}` : ''}
              </p>
              <button className="btn big" onClick={next}>
                {index + 1 < questions.length ? 'Siguiente →' : 'Ver el resultado'}
              </button>
            </div>
          ) : (
            <p className="muted ln-hint">Piensen y elijan (también con las teclas A, B, C y D)</p>
          )}
        </div>
        {players.length > 0 && (
          <div className="cp-score">
            <Scoreboard
              players={players}
              scores={scores}
              onAdd={add}
              currentId={turns.current?.id}
              compact
            />
          </div>
        )}
      </div>
    </div>
  )
}
