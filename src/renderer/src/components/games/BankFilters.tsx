import './games.css'
import { filterBank, topicsOf, type BankFilter } from '../../content/banks'
import { SUBJECTS, gradeLabel } from '../../content/subjects'
import { GRADES, type Difficulty, type Grade, type SubjectId } from '../../content/types'

type Item = Parameters<typeof topicsOf>[0][number]

interface Props {
  /** Todo el banco: de aquí salen las asignaturas y los temas que se ofrecen */
  items: Item[]
  value: BankFilter
  onChange: (value: BankFilter) => void
  showDifficulty?: boolean
  showSource?: boolean
}

const DIFFICULTIES: { id: Difficulty; title: string }[] = [
  { id: 1, title: '🟢 Fácil' },
  { id: 2, title: '🟡 Media' },
  { id: 3, title: '🔴 Difícil' }
]

const toggle = <T,>(list: T[] | undefined, v: T): T[] =>
  list?.includes(v) ? list.filter((x) => x !== v) : [...(list ?? []), v]

/** Chips para filtrar un banco por asignatura, grado, tema, dificultad y origen. Sin nada marcado no se filtra. */
export default function BankFilters({
  items,
  value,
  onChange,
  showDifficulty,
  showSource
}: Props): React.JSX.Element {
  const present = new Set(items.map((i) => i.subject))
  const subjects = SUBJECTS.filter((s) => present.has(s.id) || value.subjects?.includes(s.id))
  const topics = topicsOf(
    filterBank(items as Parameters<typeof filterBank>[0], {
      subjects: value.subjects,
      grades: value.grades
    })
  )
  const set = (patch: Partial<BankFilter>): void => onChange({ ...value, ...patch })

  return (
    <div className="bank-filters">
      <div className="bank-filter-row">
        <span className="bank-filter-label">Asignatura</span>
        <div className="pills" role="group" aria-label="Asignatura">
          {subjects.map((s) => (
            <button
              key={s.id}
              className={`pill ${value.subjects?.includes(s.id) ? 'selected' : ''}`}
              aria-pressed={!!value.subjects?.includes(s.id)}
              onClick={() => set({ subjects: toggle<SubjectId>(value.subjects, s.id), topics: [] })}
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
              className={`pill ${value.grades?.includes(g) ? 'selected' : ''}`}
              aria-pressed={!!value.grades?.includes(g)}
              onClick={() => set({ grades: toggle<Grade>(value.grades, g), topics: [] })}
            >
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>
      {topics.length > 0 && (
        <div className="bank-filter-row">
          <span className="bank-filter-label">Tema</span>
          <div className="pills chips-scroll" role="group" aria-label="Tema">
            {topics.map(({ topic, count }) => (
              <button
                key={topic}
                className={`pill small ${value.topics?.includes(topic) ? 'selected' : ''}`}
                aria-pressed={!!value.topics?.includes(topic)}
                onClick={() => set({ topics: toggle(value.topics, topic) })}
              >
                {topic} <span className="muted">({count})</span>
              </button>
            ))}
          </div>
        </div>
      )}
      {showDifficulty && (
        <div className="bank-filter-row">
          <span className="bank-filter-label">Dificultad</span>
          <div className="pills" role="group" aria-label="Dificultad">
            {DIFFICULTIES.map((d) => (
              <button
                key={d.id}
                className={`pill ${value.difficulties?.includes(d.id) ? 'selected' : ''}`}
                aria-pressed={!!value.difficulties?.includes(d.id)}
                onClick={() => set({ difficulties: toggle<Difficulty>(value.difficulties, d.id) })}
              >
                {d.title}
              </button>
            ))}
          </div>
        </div>
      )}
      {showSource && (
        <div className="bank-filter-row">
          <span className="bank-filter-label">Origen</span>
          <div className="pills" role="group" aria-label="Origen">
            {(
              [
                ['all', 'Todo'],
                ['builtIn', 'Los que trae la app'],
                ['custom', '✏️ Los míos']
              ] as const
            ).map(([id, title]) => (
              <button
                key={id}
                className={`pill ${(value.source ?? 'all') === id ? 'selected' : ''}`}
                aria-pressed={(value.source ?? 'all') === id}
                onClick={() => set({ source: id })}
              >
                {title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
