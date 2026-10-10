import { useState } from 'react'
import BankFilters from '../../components/games/BankFilters'
import { QuestionManager } from '../../components/games/BankManager'
import { filterBank, useQuestionBank, type BankFilter } from '../../content/banks'
import { gradeLabel, subjectOf } from '../../content/subjects'
import { pick } from '../../lib/games/shuffle'
import { sfx } from '../../lib/games/sfx'
import { usePersistentState } from '../../lib/usePersistentState'
import {
  DEFAULT_SETTINGS,
  MAX_CATEGORIES,
  MIN_CATEGORIES,
  MIN_QUESTIONS,
  categoriesOf,
  type Category,
  type Settings
} from './board'

function Choice<T extends string | number | boolean>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: [T, string][]
  onChange: (v: T) => void
}): React.JSX.Element {
  return (
    <div className="cq-rule">
      <span className="bank-filter-label">{label}</span>
      <div className="pills" role="group" aria-label={label}>
        {options.map(([v, title]) => (
          <button
            key={String(v)}
            className={`pill small ${value === v ? 'selected' : ''}`}
            aria-pressed={value === v}
            onClick={() => onChange(v)}
          >
            {title}
          </button>
        ))}
      </div>
    </div>
  )
}

export default function Setup({
  onStart
}: {
  onStart: (categories: Category[], settings: Settings) => void
}): React.JSX.Element {
  const bank = useQuestionBank()
  const [filter, setFilter] = usePersistentState<BankFilter>('game:concurso:filter', {})
  const [keys, setKeys] = usePersistentState<string[]>('game:concurso:categories', [])
  const [columns, setColumns] = usePersistentState('game:concurso:columns', 5)
  const [saved, setSettings] = usePersistentState<Partial<Settings>>('game:concurso:settings', {})
  const [managing, setManaging] = useState(false)
  if (managing) return <QuestionManager onClose={() => setManaging(false)} />

  const settings: Settings = { ...DEFAULT_SETTINGS, ...saved }
  const set = (patch: Partial<Settings>): void => setSettings({ ...settings, ...patch })

  // Las elegidas se buscan sin los filtros de asignatura y grado, para poder mezclar temas de varios
  const available = categoriesOf(filterBank(bank.all, { source: filter.source }))
  const shown = categoriesOf(filterBank(bank.all, filter))
  const chosen = keys
    .map((k) => available.find((c) => c.key === k))
    .filter((c): c is Category => !!c)

  const toggle = (key: string): void => {
    sfx.pop()
    setKeys(
      chosen.some((c) => c.key === key)
        ? chosen.filter((c) => c.key !== key).map((c) => c.key)
        : [...chosen.map((c) => c.key), key]
    )
  }
  const randomBoard = (): void => {
    sfx.pop()
    const count = Math.min(columns, shown.length)
    // Se evitan dos temas con el mismo nombre en un tablero
    const unique = [...new Map(pick(shown, shown.length).map((c) => [c.topic, c])).values()]
    setKeys(pick(unique.length >= count ? unique : shown, count).map((c) => c.key))
  }
  const onlyMine = filter.source === 'custom'

  return (
    <section className="panel picker cq-setup">
      <div className="cq-filters">
        <BankFilters items={bank.all} value={filter} onChange={setFilter} showSource />
      </div>

      <div className="row">
        <div className="row start">
          <button className="btn" disabled={shown.length < MIN_CATEGORIES} onClick={randomBoard}>
            🎲 Armar el tablero por mí
          </button>
          <div className="pills" role="group" aria-label="Columnas del tablero al azar">
            {Array.from({ length: MAX_CATEGORIES - MIN_CATEGORIES + 1 }, (_, i) => i + 3).map(
              (n) => (
                <button
                  key={n}
                  className={`pill small ${columns === n ? 'selected' : ''}`}
                  aria-pressed={columns === n}
                  aria-label={`${n} columnas`}
                  onClick={() => setColumns(n)}
                >
                  {n}
                </button>
              )
            )}
          </div>
        </div>
        <div className="row start">
          <button
            className={`pill ${onlyMine ? 'selected' : ''}`}
            aria-pressed={onlyMine}
            onClick={() => setFilter({ ...filter, source: onlyMine ? 'all' : 'custom' })}
          >
            ✏️ Usar solo mis preguntas
          </button>
          <button className="btn secondary" onClick={() => setManaging(true)}>
            Mis preguntas
          </button>
        </div>
      </div>

      {shown.length === 0 ? (
        <p className="notice">
          No hay temas con al menos {MIN_QUESTIONS} preguntas con esos filtros. Quita alguno
          {onlyMine && ' o agrega más preguntas propias del mismo tema y grado'}.
        </p>
      ) : (
        <div className="cq-cats" role="group" aria-label="Temas">
          {shown.map((c) => {
            const index = chosen.findIndex((x) => x.key === c.key)
            const subject = subjectOf(c.subject)
            return (
              <button
                key={c.key}
                className={`cq-cat ${index >= 0 ? 'selected' : ''}`}
                style={{ '--cat': subject.color } as React.CSSProperties}
                aria-pressed={index >= 0}
                disabled={index < 0 && chosen.length >= MAX_CATEGORIES}
                onClick={() => toggle(c.key)}
              >
                <strong>{c.topic}</strong>
                <span className="muted">
                  {subject.icon} {gradeLabel(c.grade)} · {c.questions.length}
                </span>
                {index >= 0 && <span className="cq-cat-n">{index + 1}</span>}
              </button>
            )
          })}
        </div>
      )}

      <div className="cq-rules">
        <Choice
          label="Tiempo"
          value={settings.seconds}
          options={[
            [0, 'Sin tiempo'],
            [15, '15 s'],
            [30, '30 s'],
            [45, '45 s'],
            [60, '60 s']
          ]}
          onChange={(seconds) => set({ seconds })}
        />
        <Choice
          label="Al acertar"
          value={settings.keepTurn}
          options={[
            [false, 'Pasa el turno'],
            [true, 'Sigue el mismo']
          ]}
          onChange={(keepTurn) => set({ keepTurn })}
        />
        <Choice
          label="Al fallar"
          value={settings.penalty}
          options={[
            [false, 'Sin penalización'],
            [true, 'Resta puntos']
          ]}
          onChange={(penalty) => set({ penalty })}
        />
        <Choice
          label="Robar"
          value={settings.steal}
          options={[
            [true, 'Sí'],
            [false, 'No']
          ]}
          onChange={(steal) => set({ steal })}
        />
        <Choice
          label="Doble o nada"
          value={settings.doubles}
          options={[
            [0, 'Ninguna'],
            [1, '1 casilla'],
            [2, '2 casillas']
          ]}
          onChange={(doubles) => set({ doubles })}
        />
      </div>

      <div className="cq-footer">
        <div className="cq-chosen">
          {chosen.length === 0 ? (
            <span className="muted">
              Elige de {MIN_CATEGORIES} a {MAX_CATEGORIES} temas
            </span>
          ) : (
            chosen.map((c) => (
              <button
                key={c.key}
                className="pill small selected"
                style={{ '--cat': subjectOf(c.subject).color } as React.CSSProperties}
                aria-label={`Quitar ${c.topic}`}
                onClick={() => toggle(c.key)}
              >
                {subjectOf(c.subject).icon} {c.topic} ✕
              </button>
            ))
          )}
        </div>
        <button
          className="btn big"
          disabled={chosen.length < MIN_CATEGORIES}
          onClick={() => onStart(chosen, settings)}
        >
          Empezar ({chosen.length})
        </button>
      </div>
    </section>
  )
}
