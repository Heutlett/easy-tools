import { useEffect, useRef, useState } from 'react'
import { PlayerPicker } from '../../components/games/PlayerSetup'
import { usePlayerChoice } from '../../lib/games/playerChoice'
import { QuestionManager } from '../../components/games/BankManager'
import { filterBank, topicsOf, useQuestionBank, type BankFilter } from '../../content/banks'
import { SUBJECTS, gradeLabel } from '../../content/subjects'
import { GRADES, type Grade, type Question, type SubjectId } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { useLastGame } from '../../lib/games/lastGame'
import { useGameChrome, useNav } from '../../lib/nav'
import { usePersistentState } from '../../lib/usePersistentState'
import Guide from './Guide'
import { useGuide } from './useGuide'
import type { MusicControls } from './music'

/** Cómo se eligen las preguntas */
export type Way = 'auto' | 'pick'

/** Lo que se eligió en el paso 1: o un grupo de preguntas del que la app arma la escalera, o preguntas fijas */
export type Source =
  { kind: 'auto'; pool: Question[]; count: number } | { kind: 'fixed'; questions: Question[] }

const toggle = <T,>(list: T[], v: T): T[] =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v]

const STEPS = ['Preguntas', 'Quién juega', 'Detalles'] as const

interface Props {
  music: MusicControls
  /** Preguntas marcadas una por una en «Elegir las preguntas» (null si todavía no se eligieron) */
  fixed: Question[] | null
  onPick: () => void
  /** `summary`: lo elegido en una frase, para «Seguir donde quedaste» del inicio */
  onStart: (source: Source, players: Player[], summary: string) => void
  /** Viene de «Jugar otra vez» en el inicio: empieza enseguida con lo de la última vez */
  quick: boolean
}

/**
 * Preparar la partida en tres pasos (preguntas, quién juega, detalles) con el resumen siempre a la vista.
 * Lo elegido se recuerda, así que «¡A jugar!» sirve desde cualquier paso.
 */
export default function Wizard({ music, fixed, onPick, onStart, quick }: Props): React.JSX.Element {
  useGameChrome({ sidebar: true, ownHeader: true })
  const { go } = useNav()
  const bank = useQuestionBank()
  const guide = useGuide()
  const { last } = useLastGame()
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [way, setWay] = usePersistentState<Way>('game:millonario:way', 'auto')
  const [grades, setGrades] = usePersistentState<Grade[]>('game:millonario:grades', [])
  const [subjects, setSubjects] = usePersistentState<SubjectId[]>('game:millonario:subjects', [])
  const [topics, setTopics] = usePersistentState<string[]>('game:millonario:topics', [])
  const [onlyMine, setOnlyMine] = usePersistentState('game:millonario:only-mine', false)
  const [count, setCount] = usePersistentState('game:millonario:count', 15)
  const [managing, setManaging] = useState(false)
  const choice = usePlayerChoice({ optional: true, storageKey: 'game:millonario:who' })

  const filter: BankFilter = { grades, subjects, topics, source: onlyMine ? 'custom' : 'all' }
  const pool = filterBank(bank.all, filter)
  const available = filterBank(bank.all, { grades, subjects, source: onlyMine ? 'custom' : 'all' })
  const topicChoices = topicsOf(available)
  const enough = pool.length >= 10
  const mineCount = bank.custom.length

  // Con «las elijo yo» hacen falta las preguntas ya marcadas; con «que la app las elija», un grupo con al menos 10
  const source: Source | null =
    way === 'pick'
      ? fixed && fixed.length >= 5
        ? { kind: 'fixed', questions: fixed }
        : null
      : enough
        ? { kind: 'auto', pool, count: Math.min(count, pool.length) }
        : null
  const players = choice.players

  const questionsSummary =
    way === 'pick'
      ? fixed && fixed.length > 0
        ? `Elegidas por ti (${fixed.length})`
        : 'Todavía no has elegido'
      : [
          subjects.length
            ? subjects.map((s) => SUBJECTS.find((x) => x.id === s)?.title).join(', ')
            : 'Todas las materias',
          grades.length ? grades.map(gradeLabel).join(', ') : 'Todos los grados',
          `${Math.min(count, pool.length)} preguntas`
        ].join(' · ')
  const musicSummary = !music.settings.on
    ? 'Sin música'
    : music.settings.file
      ? 'Mi propia música'
      : 'Con música'
  // Lo elegido ahora, en una frase: igual a la de la última partida cuando no se ha cambiado nada
  const current = `${questionsSummary} · ${choice.summary}`
  const quickSummary = `${current} · ${musicSummary}`

  const canStart = source !== null && players !== null
  const start = (): void => {
    if (source && players) onStart(source, players, current)
  }

  // «Jugar otra vez» desde el inicio: si lo de la última vez sirve, se empieza enseguida
  const quickDone = useRef(false)
  useEffect(() => {
    if (!quick || quickDone.current || !canStart) return
    quickDone.current = true
    start()
    // Solo una vez, cuando ya se sabe si se puede
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quick, canStart])

  if (managing) return <QuestionManager onClose={() => setManaging(false)} />

  const stepProblem =
    step === 1 && source === null
      ? way === 'pick'
        ? 'Elige las preguntas para poder jugar.'
        : `Hay pocas preguntas (${pool.length}). Hacen falta al menos 10: quita algún filtro.`
      : null

  return (
    <div className="wiz">
      <header className="wiz-head">
        <button className="btn secondary small" onClick={() => go({ page: 'games' })}>
          ← Juegos
        </button>
        <span
          className="game-head-icon"
          style={{ '--tint': '#8a63d2' } as React.CSSProperties}
          aria-hidden
        >
          💰
        </span>
        <div className="wiz-title">
          <p className="wiz-kicker">Preparar la partida</p>
          <h1>¿Quién quiere ser millonario?</h1>
        </div>
        <button className="btn secondary small" onClick={guide.show}>
          ❓ ¿Cómo se juega?
        </button>
      </header>

      {last?.id === 'millonario' && last.summary === current && canStart && (
        <div className="quick-bar">
          <span aria-hidden>⚡</span>
          <span className="quick-bar-text">Igual que la última vez: {quickSummary}</span>
          <button className="btn small dark" onClick={start}>
            Jugar así →
          </button>
        </div>
      )}

      <div className="wiz-grid">
        <div className="wiz-main">
          <ol className="steps wiz-steps" aria-label="Pasos">
            {STEPS.map((name, i) => {
              const n = (i + 1) as 1 | 2 | 3
              const state = step === n ? 'on' : step > n ? 'done' : ''
              return (
                <li key={name} className={`step ${state}`}>
                  <button onClick={() => setStep(n)} aria-current={step === n ? 'step' : undefined}>
                    <span className="step-dot">{step > n ? '✓' : n}</span>
                    <b>{name}</b>
                  </button>
                </li>
              )
            })}
          </ol>

          {step === 1 && (
            <section className="wiz-step">
              <h2>¿Con qué preguntas jugamos?</h2>
              <div className="way-cards" role="radiogroup" aria-label="Cómo elegir las preguntas">
                <button
                  className={`way-card ${way === 'auto' ? 'on' : ''}`}
                  role="radio"
                  aria-checked={way === 'auto'}
                  onClick={() => setWay('auto')}
                >
                  <span className="who-icon" aria-hidden>
                    🎯
                  </span>
                  <span>
                    <b>Que la app las elija</b>
                    <span>Tú dices grado y materia; van de fáciles a difíciles.</span>
                  </span>
                </button>
                <button
                  className={`way-card ${way === 'pick' ? 'on' : ''}`}
                  role="radio"
                  aria-checked={way === 'pick'}
                  onClick={() => setWay('pick')}
                >
                  <span className="who-icon" aria-hidden>
                    ✋
                  </span>
                  <span>
                    <b>Las elijo yo</b>
                    <span>Marcas una por una las que quieras usar.</span>
                  </span>
                </button>
              </div>

              {way === 'auto' ? (
                <div className="wiz-panel">
                  <div className="wiz-row">
                    <span className="wiz-label">Grado</span>
                    <div className="chips" role="group" aria-label="Grado">
                      <button
                        className={`chip ${grades.length === 0 ? 'on' : ''}`}
                        aria-pressed={grades.length === 0}
                        onClick={() => (setGrades([]), setTopics([]))}
                      >
                        Todos
                      </button>
                      {GRADES.map((g) => (
                        <button
                          key={g}
                          className={`chip ${grades.includes(g) ? 'on' : ''}`}
                          aria-pressed={grades.includes(g)}
                          onClick={() => (setGrades(toggle(grades, g)), setTopics([]))}
                        >
                          {gradeLabel(g)}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="wiz-row top">
                    <span className="wiz-label">Materia</span>
                    <div className="chips" role="group" aria-label="Materia">
                      <button
                        className={`chip ${subjects.length === 0 ? 'on' : ''}`}
                        aria-pressed={subjects.length === 0}
                        onClick={() => (setSubjects([]), setTopics([]))}
                      >
                        Todas
                      </button>
                      {SUBJECTS.map((s) => (
                        <button
                          key={s.id}
                          className={`chip ${subjects.includes(s.id) ? 'on' : ''}`}
                          aria-pressed={subjects.includes(s.id)}
                          onClick={() => (setSubjects(toggle(subjects, s.id)), setTopics([]))}
                        >
                          {s.icon} {s.title}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="wiz-row">
                    <span className="wiz-label">¿Cuántas?</span>
                    <div className="segmented" role="group" aria-label="Cantidad de preguntas">
                      {[10, 15].map((n) => (
                        <button
                          key={n}
                          className={count === n ? 'on' : ''}
                          aria-pressed={count === n}
                          onClick={() => setCount(n)}
                        >
                          {n} preguntas
                        </button>
                      ))}
                    </div>
                  </div>
                  <details className="wiz-more">
                    <summary>Más opciones: tema y preguntas propias</summary>
                    <div className="wiz-more-body">
                      <label className="check left">
                        <input
                          type="checkbox"
                          checked={onlyMine}
                          onChange={(e) => (setOnlyMine(e.target.checked), setTopics([]))}
                        />
                        Usar solo las preguntas que yo escribí ({mineCount})
                      </label>
                      {topicChoices.length > 0 && (
                        <div className="wiz-row top">
                          <span className="wiz-label">Tema</span>
                          <div className="chips chips-scroll" role="group" aria-label="Tema">
                            {topicChoices.map(({ topic, count: n }) => (
                              <button
                                key={topic}
                                className={`chip ${topics.includes(topic) ? 'on' : ''}`}
                                aria-pressed={topics.includes(topic)}
                                onClick={() => setTopics(toggle(topics, topic))}
                              >
                                {topic} ({n})
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </details>
                  <div className="wiz-foot">
                    <span className={enough ? 'ok' : 'bad'}>
                      {enough
                        ? `✅ Hay ${pool.length} preguntas para jugar`
                        : `Hay pocas preguntas (${pool.length}). Quita algún filtro.`}
                    </span>
                    <button className="link-btn" onClick={() => setManaging(true)}>
                      ✏️ Mis preguntas ({mineCount})
                    </button>
                  </div>
                </div>
              ) : (
                <div className="wiz-panel row-panel">
                  <p>
                    {fixed && fixed.length > 0
                      ? `Elegiste ${fixed.length} preguntas. Se harán en el orden en que las marcaste.`
                      : 'Verás todas las preguntas y marcas las que quieras (de 5 a 15). Se hacen en el orden en que las marques.'}
                  </p>
                  <button className="btn secondary" onClick={onPick}>
                    {fixed && fixed.length > 0 ? 'Cambiar las preguntas →' : 'Elegir preguntas →'}
                  </button>
                </div>
              )}
              {stepProblem && way === 'pick' && <p className="notice">{stepProblem}</p>}
            </section>
          )}

          {step === 2 && (
            <section className="wiz-step">
              <h2>¿Quién juega?</h2>
              <PlayerPicker choice={choice} />
            </section>
          )}

          {step === 3 && (
            <section className="wiz-step">
              <h2>Últimos detalles</h2>
              <div className="wiz-panel">
                <b className="wiz-panel-title">🎵 Música</b>
                <div className="music-cards" role="group" aria-label="Música">
                  <button
                    className={`music-card ${music.settings.on && !music.settings.file ? 'on' : ''}`}
                    aria-pressed={music.settings.on && !music.settings.file}
                    onClick={music.useOurs}
                  >
                    <b>Con música</b>
                    <span>Suspenso original que cambia mientras piensan.</span>
                  </button>
                  <button
                    className={`music-card ${!music.settings.on ? 'on' : ''}`}
                    aria-pressed={!music.settings.on}
                    onClick={music.turnOff}
                  >
                    <b>🔇 Sin música</b>
                    <span>Solo los efectos de acierto y error.</span>
                  </button>
                  <button
                    className={`music-card ${music.settings.on && music.settings.file ? 'on' : ''}`}
                    aria-pressed={music.settings.on && !!music.settings.file}
                    onClick={music.chooseFile}
                  >
                    <b>📁 Mi propia música</b>
                    <span>
                      {music.settings.file
                        ? `Suena: ${music.settings.fileName}`
                        : 'Usa un archivo de audio tuyo (MP3).'}
                    </span>
                  </button>
                </div>
              </div>
              <div className="wiz-panel row-panel keys">
                <span className="who-icon" aria-hidden>
                  ⌨️
                </span>
                <p>
                  Durante el juego: teclas <b>A, B, C, D</b> para elegir y <b>Enter</b> para
                  confirmar. Funciona con un control de presentaciones.
                </p>
              </div>
            </section>
          )}

          <div className="wiz-nav">
            <button
              className="btn secondary"
              style={{ visibility: step > 1 ? 'visible' : 'hidden' }}
              onClick={() => setStep((s) => Math.max(1, s - 1) as 1 | 2 | 3)}
            >
              ← Atrás
            </button>
            <button
              className="btn dark"
              style={{ visibility: step < 3 ? 'visible' : 'hidden' }}
              onClick={() => setStep((s) => Math.min(3, s + 1) as 1 | 2 | 3)}
            >
              Siguiente →
            </button>
          </div>
        </div>

        <aside className="wiz-summary" aria-label="Tu partida">
          <p className="wiz-kicker">Tu partida</p>
          {(
            [
              ['❓', 'Preguntas', questionsSummary, 1],
              ['👥', 'Juegan', choice.summary, 2],
              ['🎵', 'Música', musicSummary, 3]
            ] as const
          ).map(([icon, label, value, to]) => (
            <button key={label} className="summary-row" onClick={() => setStep(to)}>
              <span className="summary-icon" aria-hidden>
                {icon}
              </span>
              <span className="summary-text">
                <small>{label}</small>
                <b>{value}</b>
              </span>
              <span className="summary-change">Cambiar</span>
            </button>
          ))}
          <button className="play-btn" disabled={!canStart} onClick={start}>
            ¡A jugar! →
          </button>
          <p className="summary-note">
            {canStart
              ? 'Puedes empezar en cualquier paso.'
              : (stepProblem ?? 'Falta elegir algo para poder jugar.')}
          </p>
        </aside>
      </div>

      {guide.open && <Guide onClose={guide.hide} />}
    </div>
  )
}
