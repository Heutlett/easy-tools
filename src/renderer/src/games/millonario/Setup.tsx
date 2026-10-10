import { useState } from 'react'
import PlayerSetup from '../../components/games/PlayerSetup'
import { QuestionManager } from '../../components/games/BankManager'
import { filterBank, topicsOf, useQuestionBank, type BankFilter } from '../../content/banks'
import { SUBJECTS, gradeLabel } from '../../content/subjects'
import { GRADES, type Grade, type Question, type SubjectId } from '../../content/types'
import type { Player } from '../../lib/games/players'
import { usePersistentState } from '../../lib/usePersistentState'
import Guide from './Guide'
import { useGuide } from './useGuide'
import type { MusicControls } from './music'

/** Cómo se eligen las preguntas */
export type Way = 'auto' | 'pick'

const toggle = <T,>(list: T[], v: T): T[] =>
  list.includes(v) ? list.filter((x) => x !== v) : [...list, v]

interface StepQuestionsProps {
  onAuto: (pool: Question[], count: number) => void
  onPick: () => void
}

/** Paso 1: con qué preguntas se juega */
export function StepQuestions({ onAuto, onPick }: StepQuestionsProps): React.JSX.Element {
  const bank = useQuestionBank()
  const guide = useGuide()
  const [way, setWay] = usePersistentState<Way>('game:millonario:way', 'auto')
  const [grades, setGrades] = usePersistentState<Grade[]>('game:millonario:grades', [])
  const [subjects, setSubjects] = usePersistentState<SubjectId[]>('game:millonario:subjects', [])
  const [topics, setTopics] = usePersistentState<string[]>('game:millonario:topics', [])
  const [onlyMine, setOnlyMine] = usePersistentState('game:millonario:only-mine', false)
  const [count, setCount] = usePersistentState('game:millonario:count', 15)
  const [managing, setManaging] = useState(false)

  if (managing) return <QuestionManager onClose={() => setManaging(false)} />

  const filter: BankFilter = {
    grades,
    subjects,
    topics,
    source: onlyMine ? 'custom' : 'all'
  }
  const pool = filterBank(bank.all, filter)
  const available = filterBank(bank.all, { grades, subjects, source: onlyMine ? 'custom' : 'all' })
  const topicChoices = topicsOf(available)
  const enough = pool.length >= 10
  const mineCount = bank.custom.length

  return (
    <div className="mi-setup">
      <div className="mi-setup-top">
        <p className="mi-step-label">Paso 1 de 2</p>
        {guide.hidden && (
          <button className="btn secondary small" onClick={guide.show}>
            ❓ Cómo se juega
          </button>
        )}
      </div>
      {guide.open && <Guide onHide={guide.hide} />}
      <h2 className="mi-setup-title">¿Con qué preguntas jugamos?</h2>

      <div className="mi-choices" role="radiogroup" aria-label="Cómo elegir las preguntas">
        <button
          className={`mi-choice ${way === 'auto' ? 'on' : ''}`}
          role="radio"
          aria-checked={way === 'auto'}
          onClick={() => setWay('auto')}
        >
          <span className="mi-choice-icon" aria-hidden>
            🎯
          </span>
          <b>Que la app las elija</b>
          <span>Tú dices el grado y la materia. Van de fáciles a difíciles.</span>
        </button>
        <button
          className={`mi-choice ${way === 'pick' ? 'on' : ''}`}
          role="radio"
          aria-checked={way === 'pick'}
          onClick={() => setWay('pick')}
        >
          <span className="mi-choice-icon" aria-hidden>
            ✋
          </span>
          <b>Las elijo yo</b>
          <span>Marcas una por una las preguntas que quieras usar.</span>
        </button>
      </div>

      {way === 'auto' ? (
        <section className="panel mi-auto">
          <div className="bank-filter-row">
            <span className="bank-filter-label">¿De qué grado?</span>
            <div className="pills" role="group" aria-label="Grado">
              <button
                className={`pill ${grades.length === 0 ? 'selected' : ''}`}
                aria-pressed={grades.length === 0}
                onClick={() => (setGrades([]), setTopics([]))}
              >
                Todos
              </button>
              {GRADES.map((g) => (
                <button
                  key={g}
                  className={`pill ${grades.includes(g) ? 'selected' : ''}`}
                  aria-pressed={grades.includes(g)}
                  onClick={() => (setGrades(toggle(grades, g)), setTopics([]))}
                >
                  {gradeLabel(g)}
                </button>
              ))}
            </div>
          </div>
          <div className="bank-filter-row">
            <span className="bank-filter-label">¿De qué materia?</span>
            <div className="pills" role="group" aria-label="Materia">
              <button
                className={`pill ${subjects.length === 0 ? 'selected' : ''}`}
                aria-pressed={subjects.length === 0}
                onClick={() => (setSubjects([]), setTopics([]))}
              >
                Todas
              </button>
              {SUBJECTS.map((s) => (
                <button
                  key={s.id}
                  className={`pill ${subjects.includes(s.id) ? 'selected' : ''}`}
                  aria-pressed={subjects.includes(s.id)}
                  onClick={() => (setSubjects(toggle(subjects, s.id)), setTopics([]))}
                >
                  {s.icon} {s.title}
                </button>
              ))}
            </div>
          </div>
          <div className="bank-filter-row">
            <span className="bank-filter-label">¿Cuántas?</span>
            <div className="pills" role="group" aria-label="Cantidad de preguntas">
              {[10, 15].map((n) => (
                <button
                  key={n}
                  className={`pill ${count === n ? 'selected' : ''}`}
                  aria-pressed={count === n}
                  onClick={() => setCount(n)}
                >
                  {n} preguntas
                </button>
              ))}
            </div>
          </div>
          <details className="bank-more">
            <summary>⚙️ Más opciones (tema y preguntas propias)</summary>
            <div className="mi-more">
              <label className="mi-check">
                <input
                  type="checkbox"
                  checked={onlyMine}
                  onChange={(e) => (setOnlyMine(e.target.checked), setTopics([]))}
                />
                Usar solo las preguntas que yo escribí ({mineCount})
              </label>
              {topicChoices.length > 0 && (
                <div className="bank-filter-row">
                  <span className="bank-filter-label">Tema</span>
                  <div className="pills chips-scroll" role="group" aria-label="Tema">
                    {topicChoices.map(({ topic, count: n }) => (
                      <button
                        key={topic}
                        className={`pill small ${topics.includes(topic) ? 'selected' : ''}`}
                        aria-pressed={topics.includes(topic)}
                        onClick={() => setTopics(toggle(topics, topic))}
                      >
                        {topic} <span className="muted">({n})</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </details>
          <div className="mi-next">
            <p className={enough ? 'muted' : 'notice'}>
              {enough
                ? `✅ Hay ${pool.length} preguntas para jugar`
                : `Hay pocas preguntas (${pool.length}). Hacen falta al menos 10: quita algún filtro.`}
            </p>
            <button
              className="btn big"
              disabled={!enough}
              onClick={() => onAuto(pool, Math.min(count, pool.length))}
            >
              Siguiente →
            </button>
          </div>
        </section>
      ) : (
        <section className="panel mi-auto">
          <p>
            En la pantalla siguiente verás todas las preguntas y marcas las que quieras (de 5 a 15).
            Se harán en el orden en que las marques.
          </p>
          <div className="mi-next">
            <span />
            <button className="btn big" onClick={onPick}>
              Elegir las preguntas →
            </button>
          </div>
        </section>
      )}

      <button className="mi-link" onClick={() => setManaging(true)}>
        ✏️ Escribir mis propias preguntas{mineCount > 0 ? ` (tienes ${mineCount})` : ''}
      </button>
    </div>
  )
}

interface StepPlayersProps {
  /** Resumen de lo elegido en el paso 1 */
  summary: string
  music: MusicControls
  onBack: () => void
  onStart: (players: Player[]) => void
}

/** Paso 2: quién juega y música */
export function StepPlayers({
  summary,
  music,
  onBack,
  onStart
}: StepPlayersProps): React.JSX.Element {
  const [who, setWho] = usePersistentState<'class' | 'teams'>('game:millonario:who', 'class')

  return (
    <div className="mi-setup">
      <div className="mi-setup-top">
        <p className="mi-step-label">Paso 2 de 2</p>
        <button className="btn secondary small" onClick={onBack}>
          ← Cambiar las preguntas
        </button>
      </div>
      <p className="muted mi-summary">{summary}</p>
      <h2 className="mi-setup-title">¿Quién juega?</h2>

      <div className="mi-choices" role="radiogroup" aria-label="Quién juega">
        <button
          className={`mi-choice ${who === 'class' ? 'on' : ''}`}
          role="radio"
          aria-checked={who === 'class'}
          onClick={() => setWho('class')}
        >
          <span className="mi-choice-icon" aria-hidden>
            🏫
          </span>
          <b>Toda la clase</b>
          <span>Una sola partida. La clase decide junta.</span>
        </button>
        <button
          className={`mi-choice ${who === 'teams' ? 'on' : ''}`}
          role="radio"
          aria-checked={who === 'teams'}
          onClick={() => setWho('teams')}
        >
          <span className="mi-choice-icon" aria-hidden>
            👥
          </span>
          <b>Equipos o estudiantes</b>
          <span>Van pasando uno por uno y al final se compara quién ganó más.</span>
        </button>
      </div>

      {who === 'teams' && <PlayerSetup startLabel="¡A jugar! →" onStart={onStart} />}

      <section className="panel mi-music">
        <h3 className="panel-title">🎵 Música</h3>
        <div className="pills" role="group" aria-label="Música">
          <button
            className={`pill ${music.settings.on && !music.settings.file ? 'selected' : ''}`}
            aria-pressed={music.settings.on && !music.settings.file}
            onClick={music.useOurs}
          >
            Con música
          </button>
          <button
            className={`pill ${!music.settings.on ? 'selected' : ''}`}
            aria-pressed={!music.settings.on}
            onClick={music.turnOff}
          >
            🔇 Sin música
          </button>
          <button
            className={`pill ${music.settings.on && music.settings.file ? 'selected' : ''}`}
            aria-pressed={music.settings.on && !!music.settings.file}
            onClick={music.chooseFile}
          >
            📁 Usar mi propia música
          </button>
        </div>
        <p className="muted">
          {music.settings.file
            ? `Suena tu archivo: ${music.settings.fileName}`
            : 'Música original de suspenso que cambia mientras se piensa la respuesta. Si tienes un archivo de audio (MP3), puedes usarlo en su lugar.'}
        </p>
      </section>

      {who === 'class' && (
        <div className="mi-next">
          <span />
          <button className="btn big" onClick={() => onStart([])}>
            ¡A jugar! →
          </button>
        </div>
      )}
    </div>
  )
}
