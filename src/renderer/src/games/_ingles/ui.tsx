import './style.css'
import { gradeLabel } from '../../content/subjects'
import { GRADES, type Grade } from '../../content/types'
import { topicsForGrade, wordsFor, type TopicId, type Visual as VisualType } from './vocab'

/** Dibujo de una palabra: emoji, color, forma o número. Su tamaño depende del font-size del contenedor. */
export function Visual({ v }: { v: VisualType }): React.JSX.Element {
  if (v.startsWith('#'))
    return <span className="ing-swatch" style={{ background: v }} aria-hidden />
  if (v.startsWith('shape:')) return <span className={`ing-shape ${v.slice(6)}`} aria-hidden />
  if (v.startsWith('num:')) {
    const text = v.slice(4)
    return (
      <span className={`ing-num ${text.length >= 3 ? 'long' : ''}`} aria-hidden>
        {text}
      </span>
    )
  }
  return (
    <span className="ing-emoji" aria-hidden>
      {v}
    </span>
  )
}

interface PillsProps<T extends string | number> {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (id: T) => void
}

/** Una fila «Etiqueta: [opción] [opción]…» para elegir una sola cosa */
export function PillRow<T extends string | number>({
  label,
  options,
  value,
  onChange
}: PillsProps<T>): React.JSX.Element {
  return (
    <div className="bank-filter-row">
      <span className="bank-filter-label">{label}</span>
      <div className="pills" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.id)}
            className={`pill ${value === o.id ? 'selected' : ''}`}
            aria-pressed={value === o.id}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function GradeRow({
  value,
  onChange,
  grades = GRADES
}: {
  value: Grade
  onChange: (g: Grade) => void
  grades?: Grade[]
}): React.JSX.Element {
  return (
    <PillRow
      label="Grado"
      value={value}
      options={grades.map((g) => ({ id: g, label: gradeLabel(g) }))}
      onChange={onChange}
    />
  )
}

/** Temas del banco de vocabulario para un grado; sin ninguno elegido se usan todos */
export function TopicRow({
  grade,
  value,
  onChange
}: {
  grade: Grade
  value: TopicId[]
  onChange: (t: TopicId[]) => void
}): React.JSX.Element {
  const topics = topicsForGrade(grade).filter((t) => wordsFor(grade, [t.id]).length >= 4)
  const active = value.filter((id) => topics.some((t) => t.id === id))
  return (
    <div className="bank-filter-row">
      <span className="bank-filter-label">Temas</span>
      <div className="pills ing-topics" role="group" aria-label="Temas">
        <button
          className={`pill small ${active.length === 0 ? 'selected' : ''}`}
          aria-pressed={active.length === 0}
          onClick={() => onChange([])}
        >
          ⭐ All
        </button>
        {topics.map((t) => {
          const on = active.includes(t.id)
          return (
            <button
              key={t.id}
              className={`pill small ${on ? 'selected' : ''}`}
              aria-pressed={on}
              title={t.es}
              onClick={() => onChange(on ? active.filter((x) => x !== t.id) : [...active, t.id])}
            >
              {t.icon} {t.en}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Aviso discreto mientras las voces todavía no se han descargado */
export function VoiceNotice({ available }: { available: boolean }): React.JSX.Element | null {
  if (available) return null
  return (
    <span
      className="ing-novoice"
      title="Las voces se descargan solas con internet desde la pantalla de inicio"
    >
      🔇 sin voz
    </span>
  )
}
