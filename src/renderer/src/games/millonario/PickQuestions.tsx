import { useMemo, useState } from 'react'
import { useToolHeader } from '../../components/ToolHeaderContext'
import { filterBank, useQuestionBank } from '../../content/banks'
import { SUBJECTS, gradeLabel, subjectOf } from '../../content/subjects'
import { GRADES, type Grade, type Question, type SubjectId } from '../../content/types'
import { matchesQuery } from '../../lib/search'
import { pick } from '../../lib/games/shuffle'
import { MAX_PICKED, MIN_PICKED } from './data'

const LEVEL = { 1: '🟢 Fácil', 2: '🟡 Media', 3: '🔴 Difícil' } as const
const PAGE = 30

interface Props {
  /** Las que ya estaban marcadas (por ejemplo al volver atrás) */
  initial: string[]
  onBack: () => void
  onDone: (questions: Question[]) => void
}

/** Marcar una por una las preguntas con las que se quiere jugar */
export default function PickQuestions({ initial, onBack, onDone }: Props): React.JSX.Element {
  const bank = useQuestionBank()
  const [chosen, setChosen] = useState<string[]>(initial)
  const [subjects, setSubjects] = useState<SubjectId[]>([])
  const [grades, setGrades] = useState<Grade[]>([])
  const [query, setQuery] = useState('')
  const [mine, setMine] = useState(false)
  const [limit, setLimit] = useState(PAGE)

  useToolHeader({
    title: 'Elegir las preguntas',
    icon: '✋',
    description: 'Toca las que quieras usar. Se harán en el orden en que las marques.',
    backLabel: '← Atrás',
    onBack
  })

  const byId = useMemo(() => new Map(bank.all.map((q) => [q.id, q])), [bank.all])
  const visible = useMemo(
    () =>
      filterBank(bank.all, { subjects, grades, source: mine ? 'custom' : 'all' }).filter((q) =>
        matchesQuery(query, q.text, q.options.join(' '), q.topic)
      ),
    [bank.all, subjects, grades, mine, query]
  )
  const full = chosen.length >= MAX_PICKED

  const toggle = (id: string): void =>
    setChosen(
      chosen.includes(id) ? chosen.filter((x) => x !== id) : full ? chosen : [...chosen, id]
    )

  const randomFill = (): void => {
    // Completa hasta 10 (una partida normal) y, si ya hay 10 o más, hasta el máximo
    const target = chosen.length < 10 ? 10 : MAX_PICKED
    const extra = pick(
      visible.filter((q) => !chosen.includes(q.id)),
      target - chosen.length
    )
    setChosen([...chosen, ...extra.map((q) => q.id)])
  }

  const done = (): void =>
    onDone(chosen.map((id) => byId.get(id)).filter((q): q is Question => q !== undefined))

  const toggleIn = <T,>(list: T[], v: T): T[] =>
    list.includes(v) ? list.filter((x) => x !== v) : [...list, v]

  return (
    <div className="mi-pick">
      <section className="panel mi-pick-filters">
        <div className="bank-filter-row">
          <span className="bank-filter-label">Materia</span>
          <div className="pills" role="group" aria-label="Materia">
            {SUBJECTS.map((s) => (
              <button
                key={s.id}
                className={`pill small ${subjects.includes(s.id) ? 'selected' : ''}`}
                aria-pressed={subjects.includes(s.id)}
                onClick={() => (setSubjects(toggleIn(subjects, s.id)), setLimit(PAGE))}
              >
                {s.icon} {s.title}
              </button>
            ))}
          </div>
        </div>
        <div className="bank-filter-row">
          <span className="bank-filter-label">Grado</span>
          <div className="pills" role="group" aria-label="Grado">
            {GRADES.map((g) => (
              <button
                key={g}
                className={`pill small ${grades.includes(g) ? 'selected' : ''}`}
                aria-pressed={grades.includes(g)}
                onClick={() => (setGrades(toggleIn(grades, g)), setLimit(PAGE))}
              >
                {gradeLabel(g)}
              </button>
            ))}
            <button
              className={`pill small ${mine ? 'selected' : ''}`}
              aria-pressed={mine}
              onClick={() => (setMine(!mine), setLimit(PAGE))}
            >
              ✏️ Solo las mías
            </button>
          </div>
        </div>
        <input
          className="field bank-search"
          type="search"
          value={query}
          placeholder="🔍 Buscar por palabras…"
          aria-label="Buscar"
          onChange={(e) => (setQuery(e.target.value), setLimit(PAGE))}
        />
      </section>

      <ul className="mi-pick-list">
        {visible.slice(0, limit).map((q) => {
          const at = chosen.indexOf(q.id)
          const on = at >= 0
          const s = subjectOf(q.subject)
          return (
            <li key={q.id}>
              <button
                className={`mi-pick-item ${on ? 'on' : ''}`}
                aria-pressed={on}
                disabled={!on && full}
                onClick={() => toggle(q.id)}
              >
                <span className="mi-pick-mark" aria-hidden>
                  {on ? at + 1 : ''}
                </span>
                <span className="mi-pick-body">
                  <span className="bank-tags">
                    <span className="bank-tag">
                      {s.icon} {s.title}
                    </span>
                    <span className="bank-tag">{gradeLabel(q.grade)}</span>
                    <span className="bank-tag">{q.topic}</span>
                    <span className="bank-tag">{LEVEL[q.difficulty]}</span>
                  </span>
                  <strong>{q.text}</strong>
                  <span className="muted">
                    ✔ {q.options[q.answer]} ·{' '}
                    {q.options.filter((_, i) => i !== q.answer).join(' · ')}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
      {visible.length === 0 && (
        <p className="notice">No hay preguntas con eso. Cambia lo que buscas.</p>
      )}
      {visible.length > limit && (
        <button className="btn secondary" onClick={() => setLimit(limit + PAGE)}>
          Ver más ({visible.length - limit} restantes)
        </button>
      )}

      <div className="mi-pick-bar" role="region" aria-label="Tu selección">
        <div>
          <b>
            {chosen.length} {chosen.length === 1 ? 'pregunta elegida' : 'preguntas elegidas'}
          </b>
          <span className="muted">
            {chosen.length < MIN_PICKED
              ? ` · faltan ${MIN_PICKED - chosen.length} como mínimo`
              : full
                ? ` · es el máximo (${MAX_PICKED})`
                : ` · puedes elegir hasta ${MAX_PICKED}`}
          </span>
        </div>
        <div className="row start">
          <button className="btn secondary small" disabled={full} onClick={randomFill}>
            🎲 Completar al azar
          </button>
          <button
            className="btn secondary small"
            disabled={chosen.length === 0}
            onClick={() => setChosen([])}
          >
            Quitar todas
          </button>
          <button className="btn big" disabled={chosen.length < MIN_PICKED} onClick={done}>
            Siguiente →
          </button>
        </div>
      </div>
    </div>
  )
}
