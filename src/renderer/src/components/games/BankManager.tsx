import { useRef, useState } from 'react'
import { useToolHeader } from '../ToolHeaderContext'
import { BULK_EXAMPLE, parseQuestions } from '../../content/bankText'
import {
  filterBank,
  usePairListBank,
  useQuestionBank,
  useStatementBank,
  useWordListBank,
  type Bank,
  type BankFilter
} from '../../content/banks'
import { bankToFile, readBankFile, type BankKind } from '../../content/bankFile'
import { SUBJECTS, gradeLabel, gradesLabel, subjectOf } from '../../content/subjects'
import { matchesQuery } from '../../lib/search'
import {
  GRADES,
  type Difficulty,
  type Grade,
  type PairList,
  type Question,
  type Statement,
  type SubjectId,
  type WordList
} from '../../content/types'
import BankFilters from './BankFilters'

type Base = { id: string; custom?: boolean; subject: SubjectId }
type Draft<T> = Omit<T, 'id' | 'custom'>

interface ShellProps<T extends Base> {
  title: string
  /** Nombre en plural, en minúsculas: «preguntas», «afirmaciones»… */
  noun: string
  kind: BankKind
  bank: Bank<T>
  searchText: (item: T) => string
  renderRow: (item: T) => React.ReactNode
  renderForm: (p: {
    initial: T | null
    items: T[]
    onSave: (draft: Draft<T>) => void
    onCancel: () => void
  }) => React.ReactNode
  showDifficulty?: boolean
  /** Si se da, aparece «Pegar varias a la vez» (escribir o pegar muchas de una vez) */
  renderBulk?: (p: {
    onSave: (drafts: Draft<T>[]) => void
    onCancel: () => void
  }) => React.ReactNode
  onClose: () => void
}

const PAGE = 40

function Shell<T extends Base>({
  title,
  noun,
  kind,
  bank,
  searchText,
  renderRow,
  renderForm,
  showDifficulty,
  renderBulk,
  onClose
}: ShellProps<T>): React.JSX.Element {
  // Al abrir «Mis preguntas» se ven primero las propias, no las miles que trae la app
  const [filter, setFilter] = useState<BankFilter>({ source: 'custom' })
  const [bulk, setBulk] = useState(false)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<T | 'new' | null>(null)
  const [limit, setLimit] = useState(PAGE)
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const fileInput = useRef<HTMLInputElement>(null)

  const filtered = filterBank(bank.all as never[], filter) as T[]
  const shown = filtered.filter((it) => matchesQuery(query, searchText(it)))

  const save = (draft: Draft<T>): void => {
    if (editing && editing !== 'new') bank.update({ ...draft, id: editing.id, custom: true } as T)
    else bank.add(draft)
    setEditing(null)
    setMessage('')
  }

  const exportMine = async (): Promise<void> => {
    try {
      const out = await window.api.output.saveFile({
        name: `Mis ${noun}`,
        ext: 'json',
        data: bankToFile(kind, bank.custom)
      })
      setMessage(`Guardado en «Mis archivos»: ${out.output.split(/[\\/]/).pop()}`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo guardar el archivo.')
    }
  }

  const importFile = async (file: File): Promise<void> => {
    try {
      const { items, skipped } = await readBankFile(file, kind)
      const added = bank.addMany(items as Draft<T>[])
      setMessage(
        `Se agregaron ${added} ${noun}${skipped ? ` (${skipped} no se pudieron leer)` : ''}.`
      )
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo leer el archivo.')
    }
  }

  const saveBulk = (drafts: Draft<T>[]): void => {
    const added = bank.addMany(drafts)
    setBulk(false)
    setFilter({ source: 'custom' })
    setMessage(`✅ Se agregaron ${added} ${noun}.`)
  }

  // El botón de arriba a la izquierda siempre lleva un paso atrás, con su nombre claro
  useToolHeader(
    editing
      ? {
          title: editing === 'new' ? 'Escribir una nueva' : 'Cambiar la pregunta',
          icon: '✏️',
          backLabel: '← Cancelar',
          onBack: () => setEditing(null)
        }
      : bulk
        ? {
            title: 'Pegar varias a la vez',
            icon: '📋',
            backLabel: '← Cancelar',
            onBack: () => setBulk(false)
          }
        : {
            title,
            icon: '✏️',
            description: 'Las que escribas aquí se guardan en esta computadora.',
            backLabel: '← Volver',
            onBack: onClose
          }
  )

  if (bulk && renderBulk) {
    return (
      <section className="panel bank-manager">
        {renderBulk({ onSave: saveBulk, onCancel: () => setBulk(false) })}
      </section>
    )
  }

  if (editing) {
    return (
      <section className="panel bank-manager">
        {renderForm({
          initial: editing === 'new' ? null : editing,
          items: bank.all,
          onSave: save,
          onCancel: () => setEditing(null)
        })}
      </section>
    )
  }

  const mineCount = bank.custom.length
  return (
    <section className="panel bank-manager">
      <div className="bank-actions">
        <button className="btn big" onClick={() => setEditing('new')}>
          ➕ Escribir una nueva
        </button>
        {renderBulk && (
          <button className="btn big secondary" onClick={() => setBulk(true)}>
            📋 Pegar varias a la vez
          </button>
        )}
      </div>

      <details className="bank-share">
        <summary>📁 Pasar mis {noun} a otra computadora o a otra persona</summary>
        <div className="bank-share-body">
          <p>
            <b>Guardar:</b> crea un archivo con todo lo que escribiste aquí. Queda en la carpeta
            «Mis archivos» (el botón 📁 de la pantalla de inicio) y se lo puedes mandar por WhatsApp
            o correo.
          </p>
          <p>
            <b>Cargar:</b> abre uno de esos archivos que te mandó otra persona (tiene que haberse
            creado con el botón «Guardar» de Educando; otros archivos, como los de Word o Excel, no
            sirven) y sus {noun} se suman a las tuyas.
          </p>
          <div className="row start">
            <button
              className="btn secondary"
              disabled={mineCount === 0}
              onClick={exportMine}
              title={mineCount === 0 ? `Todavía no tienes ${noun} propias` : undefined}
            >
              ⬇ Guardar mis {noun} en un archivo
            </button>
            <button className="btn secondary" onClick={() => fileInput.current?.click()}>
              ⬆ Cargar {noun} de un archivo
            </button>
            <input
              ref={fileInput}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0]
                e.target.value = ''
                if (file) void importFile(file)
              }}
            />
          </div>
        </div>
      </details>

      {message && <p className="notice">{message}</p>}

      <div className="bank-filter-row">
        <span className="bank-filter-label">Ver</span>
        <div className="pills" role="group" aria-label="Qué ver">
          {(
            [
              ['custom', `✏️ Las mías (${mineCount})`],
              ['builtIn', 'Las que trae la app'],
              ['all', 'Todas']
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              className={`pill ${(filter.source ?? 'all') === id ? 'selected' : ''}`}
              aria-pressed={(filter.source ?? 'all') === id}
              onClick={() => (setFilter({ ...filter, source: id }), setLimit(PAGE))}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <details className="bank-more">
        <summary>🔎 Buscar o filtrar por materia y grado</summary>
        <BankFilters
          items={bank.all}
          value={filter}
          onChange={(f) => (setFilter(f), setLimit(PAGE))}
          showDifficulty={showDifficulty}
        />
        <input
          className="field bank-search"
          type="search"
          value={query}
          placeholder="🔍 Buscar por palabras…"
          aria-label="Buscar"
          onChange={(e) => (setQuery(e.target.value), setLimit(PAGE))}
        />
      </details>

      {mineCount === 0 && filter.source === 'custom' ? (
        <div className="bank-empty">
          <p className="bank-empty-title">Todavía no has escrito ninguna</p>
          <p className="muted">
            Pulsa «➕ Escribir una nueva»{renderBulk ? ' o «📋 Pegar varias a la vez»' : ''} para
            empezar. También puedes usar las que trae la app: toca «Las que trae la app» y, en la
            que te guste, «📋 Copiar para editar».
          </p>
        </div>
      ) : (
        <p className="muted">
          {shown.length} {noun}
        </p>
      )}
      <ul className="bank-list">
        {shown.slice(0, limit).map((it) => (
          <li key={it.id} className={`bank-item ${it.custom ? 'mine' : ''}`}>
            <div className="bank-item-body">{renderRow(it)}</div>
            <div className="bank-item-actions">
              {it.custom ? (
                <>
                  <button className="btn secondary small" onClick={() => setEditing(it)}>
                    ✏️ Editar
                  </button>
                  {confirmDelete === it.id ? (
                    <button
                      className="btn danger small"
                      onClick={() => (bank.remove(it.id), setConfirmDelete(null))}
                    >
                      Sí, borrar
                    </button>
                  ) : (
                    <button
                      className="btn secondary small"
                      onClick={() => (
                        setConfirmDelete(it.id),
                        setTimeout(() => setConfirmDelete(null), 3500)
                      )}
                    >
                      🗑 Borrar
                    </button>
                  )}
                </>
              ) : (
                <button
                  className="btn secondary small"
                  title="Hace una copia tuya, que sí puedes cambiar"
                  onClick={() => {
                    const { id: _id, custom: _custom, ...rest } = it as T & { id: string }
                    void _id
                    void _custom
                    bank.add(rest as unknown as unknown as Draft<T>)
                    setMessage('Listo: la copia quedó en «Los míos».')
                  }}
                >
                  📋 Copiar para editar
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
      {shown.length > limit && (
        <button className="btn secondary" onClick={() => setLimit(limit + PAGE)}>
          Mostrar más ({shown.length - limit} restantes)
        </button>
      )}
    </section>
  )
}

/* ---------- Formularios ---------- */

function SubjectGradeFields({
  subject,
  grades,
  single,
  onSubject,
  onGrades
}: {
  subject: SubjectId
  grades: Grade[]
  single?: boolean
  onSubject: (s: SubjectId) => void
  onGrades: (g: Grade[]) => void
}): React.JSX.Element {
  return (
    <>
      <label className="form-field">
        <span>Asignatura</span>
        <select
          className="field"
          value={subject}
          onChange={(e) => onSubject(e.target.value as SubjectId)}
        >
          {SUBJECTS.map((s) => (
            <option key={s.id} value={s.id}>
              {s.icon} {s.title}
            </option>
          ))}
        </select>
      </label>
      <div className="form-field">
        <span>{single ? 'Grado' : 'Grados'}</span>
        <div className="pills" role="group" aria-label="Grados">
          {GRADES.map((g) => (
            <button
              key={g}
              type="button"
              className={`pill ${grades.includes(g) ? 'selected' : ''}`}
              aria-pressed={grades.includes(g)}
              onClick={() =>
                onGrades(
                  single
                    ? [g]
                    : grades.includes(g)
                      ? grades.filter((x) => x !== g)
                      : [...grades, g].sort()
                )
              }
            >
              {gradeLabel(g)}
            </button>
          ))}
        </div>
      </div>
    </>
  )
}

function FormButtons({
  error,
  onSave,
  onCancel
}: {
  error: string
  onSave: () => void
  onCancel: () => void
}): React.JSX.Element {
  return (
    <>
      {error && <p className="notice error">{error}</p>}
      <div className="row start">
        <button className="btn big" onClick={onSave}>
          Guardar
        </button>
        <button className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </>
  )
}

function QuestionForm({
  initial,
  items,
  onSave,
  onCancel
}: {
  initial: Question | null
  items: Question[]
  onSave: (d: Draft<Question>) => void
  onCancel: () => void
}): React.JSX.Element {
  const [subject, setSubject] = useState<SubjectId>(initial?.subject ?? 'matematica')
  const [grade, setGrade] = useState<Grade>(initial?.grade ?? 3)
  const [topic, setTopic] = useState(initial?.topic ?? '')
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? 2)
  const [text, setText] = useState(initial?.text ?? '')
  const [options, setOptions] = useState<string[]>(
    initial ? [...initial.options] : ['', '', '', '']
  )
  const [answer, setAnswer] = useState(initial?.answer ?? 0)
  const [explanation, setExplanation] = useState(initial?.explanation ?? '')
  const [error, setError] = useState('')
  const topics = [...new Set(items.filter((q) => q.subject === subject).map((q) => q.topic))]

  const submit = (): void => {
    const clean = options.map((o) => o.trim())
    if (!text.trim()) return setError('Escribe la pregunta.')
    if (clean.some((o) => !o)) return setError('Escribe las 4 opciones.')
    if (new Set(clean.map((o) => o.toLowerCase())).size !== 4)
      return setError('Las opciones no pueden repetirse.')
    onSave({
      subject,
      grade,
      topic: topic.trim() || 'Mis preguntas',
      difficulty,
      text: text.trim(),
      options: clean,
      answer,
      ...(explanation.trim() ? { explanation: explanation.trim() } : {})
    })
  }

  return (
    <div className="bank-form">
      <SubjectGradeFields
        subject={subject}
        grades={[grade]}
        single
        onSubject={setSubject}
        onGrades={(g) => setGrade(g[0])}
      />
      <label className="form-field">
        <span>Tema</span>
        <input
          className="field"
          list="bank-topics"
          value={topic}
          placeholder="Por ejemplo: Fracciones"
          onChange={(e) => setTopic(e.target.value)}
        />
        <datalist id="bank-topics">
          {topics.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>
      <div className="form-field">
        <span>Dificultad</span>
        <div className="pills" role="group" aria-label="Dificultad">
          {(
            [
              [1, '🟢 Fácil'],
              [2, '🟡 Media'],
              [3, '🔴 Difícil']
            ] as const
          ).map(([d, title]) => (
            <button
              key={d}
              type="button"
              className={`pill ${difficulty === d ? 'selected' : ''}`}
              aria-pressed={difficulty === d}
              onClick={() => setDifficulty(d)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      <label className="form-field">
        <span>Pregunta</span>
        <textarea
          className="field"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="form-field">
        <span>Opciones (marca la correcta)</span>
        {options.map((o, i) => (
          <label key={i} className="option-edit">
            <input
              type="radio"
              name="correct"
              checked={answer === i}
              aria-label={`La opción ${i + 1} es la correcta`}
              onChange={() => setAnswer(i)}
            />
            <input
              className="field"
              value={o}
              placeholder={`Opción ${i + 1}`}
              onChange={(e) => setOptions(options.map((x, k) => (k === i ? e.target.value : x)))}
            />
          </label>
        ))}
      </div>
      <label className="form-field">
        <span>Explicación (opcional)</span>
        <input
          className="field"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </label>
      <FormButtons error={error} onSave={submit} onCancel={onCancel} />
    </div>
  )
}

/** Escribir o pegar muchas preguntas de una vez (por ejemplo desde Word): ver content/bankText.ts */
function BulkQuestions({
  onSave,
  onCancel
}: {
  onSave: (drafts: Draft<Question>[]) => void
  onCancel: () => void
}): React.JSX.Element {
  const [subject, setSubject] = useState<SubjectId>('matematica')
  const [grade, setGrade] = useState<Grade>(3)
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<Difficulty>(2)
  const [text, setText] = useState('')
  const { questions, problems } = parseQuestions(text)

  const save = (): void =>
    onSave(
      questions.map((q) => ({
        subject,
        grade,
        topic: topic.trim() || 'Mis preguntas',
        difficulty,
        text: q.text,
        options: q.options,
        answer: q.answer
      }))
    )

  return (
    <div className="bank-form">
      <div className="bulk-howto">
        <p>
          <b>Cómo hacerlo:</b> escribe (o pega desde Word) una pregunta y, debajo, sus 4 opciones,
          una por renglón. Pon un <b>*</b> antes de la opción correcta. Deja un renglón en blanco
          entre una pregunta y la siguiente.
        </p>
        <pre className="bulk-example">{BULK_EXAMPLE}</pre>
        <button className="btn secondary small" onClick={() => setText(BULK_EXAMPLE)}>
          Usar este ejemplo para probar
        </button>
      </div>
      <SubjectGradeFields
        subject={subject}
        grades={[grade]}
        single
        onSubject={setSubject}
        onGrades={(g) => setGrade(g[0])}
      />
      <div className="form-field">
        <span>Dificultad de todas</span>
        <div className="pills" role="group" aria-label="Dificultad">
          {(
            [
              [1, '🟢 Fácil'],
              [2, '🟡 Media'],
              [3, '🔴 Difícil']
            ] as const
          ).map(([d, title]) => (
            <button
              key={d}
              type="button"
              className={`pill ${difficulty === d ? 'selected' : ''}`}
              aria-pressed={difficulty === d}
              onClick={() => setDifficulty(d)}
            >
              {title}
            </button>
          ))}
        </div>
      </div>
      <label className="form-field">
        <span>Tema (opcional)</span>
        <input
          className="field"
          value={topic}
          placeholder="Por ejemplo: Fracciones"
          onChange={(e) => setTopic(e.target.value)}
        />
      </label>
      <label className="form-field">
        <span>Tus preguntas</span>
        <textarea
          className="field bulk-text"
          rows={12}
          value={text}
          placeholder={BULK_EXAMPLE}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      {text.trim() && (
        <p className={problems.length ? 'notice error' : 'notice'}>
          {questions.length > 0
            ? `✅ ${questions.length} ${questions.length === 1 ? 'pregunta lista' : 'preguntas listas'}`
            : 'Todavía no hay ninguna lista.'}
        </p>
      )}
      {problems.length > 0 && (
        <ul className="bulk-problems">
          {problems.map((p) => (
            <li key={p}>⚠️ {p}</li>
          ))}
        </ul>
      )}
      <div className="row start">
        <button className="btn big" disabled={questions.length === 0} onClick={save}>
          Guardar {questions.length > 0 ? questions.length : ''}{' '}
          {questions.length === 1 ? 'pregunta' : 'preguntas'}
        </button>
        <button className="btn secondary" onClick={onCancel}>
          Cancelar
        </button>
      </div>
    </div>
  )
}

function StatementForm({
  initial,
  items,
  onSave,
  onCancel
}: {
  initial: Statement | null
  items: Statement[]
  onSave: (d: Draft<Statement>) => void
  onCancel: () => void
}): React.JSX.Element {
  const [subject, setSubject] = useState<SubjectId>(initial?.subject ?? 'matematica')
  const [grade, setGrade] = useState<Grade>(initial?.grade ?? 3)
  const [topic, setTopic] = useState(initial?.topic ?? '')
  const [text, setText] = useState(initial?.text ?? '')
  const [answer, setAnswer] = useState(initial?.answer ?? true)
  const [explanation, setExplanation] = useState(initial?.explanation ?? '')
  const [error, setError] = useState('')
  const topics = [...new Set(items.filter((s) => s.subject === subject).map((s) => s.topic))]

  const submit = (): void => {
    if (!text.trim()) return setError('Escribe la afirmación.')
    onSave({
      subject,
      grade,
      topic: topic.trim() || 'Mis afirmaciones',
      text: text.trim(),
      answer,
      ...(explanation.trim() ? { explanation: explanation.trim() } : {})
    })
  }

  return (
    <div className="bank-form">
      <SubjectGradeFields
        subject={subject}
        grades={[grade]}
        single
        onSubject={setSubject}
        onGrades={(g) => setGrade(g[0])}
      />
      <label className="form-field">
        <span>Tema</span>
        <input
          className="field"
          list="bank-topics"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
        />
        <datalist id="bank-topics">
          {topics.map((t) => (
            <option key={t} value={t} />
          ))}
        </datalist>
      </label>
      <label className="form-field">
        <span>Afirmación</span>
        <textarea
          className="field"
          rows={2}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </label>
      <div className="form-field">
        <span>¿Es verdadera?</span>
        <div className="pills" role="group" aria-label="Respuesta">
          <button
            type="button"
            className={`pill ${answer ? 'selected' : ''}`}
            aria-pressed={answer}
            onClick={() => setAnswer(true)}
          >
            ✅ Verdadera
          </button>
          <button
            type="button"
            className={`pill ${!answer ? 'selected' : ''}`}
            aria-pressed={!answer}
            onClick={() => setAnswer(false)}
          >
            ❌ Falsa
          </button>
        </div>
      </div>
      <label className="form-field">
        <span>Explicación (opcional)</span>
        <input
          className="field"
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
        />
      </label>
      <FormButtons error={error} onSave={submit} onCancel={onCancel} />
    </div>
  )
}

/** Lista de palabras («palabra | pista») o de parejas («A | B»): una por renglón */
function ListForm<T extends WordList | PairList>({
  pairs,
  initial,
  onSave,
  onCancel
}: {
  pairs: boolean
  initial: T | null
  onSave: (d: Draft<T>) => void
  onCancel: () => void
}): React.JSX.Element {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [subject, setSubject] = useState<SubjectId>(initial?.subject ?? 'espanol')
  const [grades, setGrades] = useState<Grade[]>(initial?.grades ?? [3])
  const [lines, setLines] = useState(() => {
    if (!initial) return ''
    return pairs
      ? (initial as PairList).pairs.map(([a, b]) => `${a} | ${b}`).join('\n')
      : (initial as WordList).items
          .map((i) => (i.clue ? `${i.text} | ${i.clue}` : i.text))
          .join('\n')
  })
  const [error, setError] = useState('')

  const submit = (): void => {
    if (!title.trim()) return setError('Ponle un nombre a la lista.')
    if (grades.length === 0) return setError('Elige al menos un grado.')
    const rows = lines
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)
    if (pairs) {
      const parsed = rows.map((r) => r.split('|').map((x) => x.trim()))
      if (parsed.some((p) => p.length !== 2 || !p[0] || !p[1]))
        return setError(
          'Cada renglón debe tener dos partes separadas por | (por ejemplo: perro | dog).'
        )
      if (parsed.length < 4) return setError('Escribe al menos 4 parejas.')
      onSave({
        title: title.trim(),
        subject,
        grades,
        pairs: parsed as [string, string][]
      } as unknown as Draft<T>)
    } else {
      if (rows.length < 4) return setError('Escribe al menos 4 palabras.')
      const items = rows.map((r) => {
        const [text, ...clue] = r.split('|')
        return clue.join('|').trim()
          ? { text: text.trim(), clue: clue.join('|').trim() }
          : { text: text.trim() }
      })
      onSave({ title: title.trim(), subject, grades, items } as unknown as Draft<T>)
    }
  }

  return (
    <div className="bank-form">
      <label className="form-field">
        <span>Nombre de la lista</span>
        <input
          className="field"
          value={title}
          maxLength={60}
          onChange={(e) => setTitle(e.target.value)}
        />
      </label>
      <SubjectGradeFields
        subject={subject}
        grades={grades}
        onSubject={setSubject}
        onGrades={setGrades}
      />
      <label className="form-field">
        <span>
          {pairs
            ? 'Parejas, una por renglón: lo de una carta | lo de la otra'
            : 'Palabras, una por renglón (la pista es opcional): palabra | pista'}
        </span>
        <textarea
          className="field"
          rows={8}
          value={lines}
          placeholder={
            pairs ? 'perro | dog\ngato | cat' : 'mariposa | Insecto con alas de colores\ntortuga'
          }
          onChange={(e) => setLines(e.target.value)}
        />
      </label>
      <FormButtons error={error} onSave={submit} onCancel={onCancel} />
    </div>
  )
}

/* ---------- Administradores listos para usar ---------- */

const Tags = ({
  grades,
  subject,
  extra
}: {
  grades: Grade[]
  subject: SubjectId
  extra?: string
}): React.JSX.Element => (
  <span className="bank-tags">
    <span className="bank-tag">
      {subjectOf(subject).icon} {subjectOf(subject).title}
    </span>
    <span className="bank-tag">{gradesLabel(grades)}</span>
    {extra && <span className="bank-tag">{extra}</span>}
  </span>
)

export function QuestionManager({ onClose }: { onClose: () => void }): React.JSX.Element {
  const bank = useQuestionBank()
  return (
    <Shell
      title="Mis preguntas"
      noun="preguntas"
      kind="preguntas"
      bank={bank}
      showDifficulty
      searchText={(q) => `${q.text} ${q.options.join(' ')} ${q.topic}`}
      renderRow={(q) => (
        <>
          <Tags grades={[q.grade]} subject={q.subject} extra={q.topic} />
          <strong>{q.text}</strong>
          <span className="muted">
            ✔ {q.options[q.answer]} · {q.options.filter((_, i) => i !== q.answer).join(' · ')}
          </span>
        </>
      )}
      renderForm={(p) => <QuestionForm {...p} />}
      renderBulk={(p) => <BulkQuestions {...p} />}
      onClose={onClose}
    />
  )
}

export function StatementManager({ onClose }: { onClose: () => void }): React.JSX.Element {
  const bank = useStatementBank()
  return (
    <Shell
      title="Mis afirmaciones"
      noun="afirmaciones"
      kind="afirmaciones"
      bank={bank}
      searchText={(s) => `${s.text} ${s.topic}`}
      renderRow={(s) => (
        <>
          <Tags grades={[s.grade]} subject={s.subject} extra={s.topic} />
          <strong>{s.text}</strong>
          <span className="muted">{s.answer ? '✅ Verdadera' : '❌ Falsa'}</span>
        </>
      )}
      renderForm={(p) => <StatementForm {...p} />}
      onClose={onClose}
    />
  )
}

export function WordListManager({ onClose }: { onClose: () => void }): React.JSX.Element {
  const bank = useWordListBank()
  return (
    <Shell
      title="Mis listas de palabras"
      noun="listas de palabras"
      kind="palabras"
      bank={bank}
      searchText={(l) => `${l.title} ${l.items.map((i) => i.text).join(' ')}`}
      renderRow={(l) => (
        <>
          <Tags grades={l.grades} subject={l.subject} extra={`${l.items.length} palabras`} />
          <strong>{l.title}</strong>
          <span className="muted">
            {l.items
              .slice(0, 8)
              .map((i) => i.text)
              .join(', ')}
            {l.items.length > 8 ? '…' : ''}
          </span>
        </>
      )}
      renderForm={(p) => <ListForm<WordList> pairs={false} {...p} />}
      onClose={onClose}
    />
  )
}

export function PairListManager({ onClose }: { onClose: () => void }): React.JSX.Element {
  const bank = usePairListBank()
  return (
    <Shell
      title="Mis parejas para memoria"
      noun="listas de parejas"
      kind="parejas"
      bank={bank}
      searchText={(l) => `${l.title} ${l.pairs.flat().join(' ')}`}
      renderRow={(l) => (
        <>
          <Tags grades={l.grades} subject={l.subject} extra={`${l.pairs.length} parejas`} />
          <strong>{l.title}</strong>
          <span className="muted">
            {l.pairs
              .slice(0, 5)
              .map(([a, b]) => `${a} ↔ ${b}`)
              .join(' · ')}
            {l.pairs.length > 5 ? '…' : ''}
          </span>
        </>
      )}
      renderForm={(p) => <ListForm<PairList> pairs {...p} />}
      onClose={onClose}
    />
  )
}
