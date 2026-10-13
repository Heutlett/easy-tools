import { useState } from 'react'
import {
  filterBank,
  usePairListBank,
  useQuestionBank,
  useStatementBank,
  useWordListBank,
  type BankFilter
} from '../../content/banks'
import { gradesLabel, subjectOf } from '../../content/subjects'
import type { PairList, Question, Statement, WordList } from '../../content/types'
import { usePersistentState } from '../../lib/usePersistentState'
import BankFilters from './BankFilters'
import { PairListManager, QuestionManager, StatementManager, WordListManager } from './BankManager'
import Hint from '..//Hint'

interface CountProps {
  /** Opciones de cantidad (por ejemplo [10, 15, 20]) */
  counts: number[]
  defaultCount: number
}

function CountChips({
  counts,
  value,
  onChange,
  available,
  noun
}: {
  counts: number[]
  value: number
  onChange: (n: number) => void
  available: number
  noun: string
}): React.JSX.Element {
  return (
    <div className="bank-filter-row">
      <span className="bank-filter-label">Cuántas {noun}</span>
      <div className="pills" role="group" aria-label={`Cantidad de ${noun}`}>
        {counts.map((n) => (
          <button
            key={n}
            className={`pill ${value === n ? 'selected' : ''}`}
            aria-pressed={value === n}
            disabled={available < n && n !== counts[0]}
            onClick={() => onChange(n)}
          >
            {n}
          </button>
        ))}
      </div>
    </div>
  )
}

interface QuestionPickerProps extends CountProps {
  startLabel?: string
  /** Se llama con TODAS las preguntas que cumplen los filtros y cuántas quiere la persona; el juego decide cómo elegirlas */
  onStart: (pool: Question[], count: number) => void
  /** Mínimo de preguntas para poder empezar (por defecto 1) */
  minPool?: number
}

/**
 * Pantalla para elegir con qué preguntas se juega: asignatura, grado, tema y dificultad, o solo las propias.
 * Incluye el acceso a «Mis preguntas» para agregar, editar, guardar y abrir archivos. Recuerda lo último elegido.
 */
export function QuestionPicker({
  counts,
  defaultCount,
  startLabel = 'Empezar',
  minPool = 1,
  onStart
}: QuestionPickerProps): React.JSX.Element {
  const bank = useQuestionBank()
  const [filter, setFilter] = usePersistentState<BankFilter>('picker-questions', {})
  const [count, setCount] = usePersistentState('picker-questions-count', defaultCount)
  const [managing, setManaging] = useState(false)
  if (managing) return <QuestionManager onClose={() => setManaging(false)} />

  const pool = filterBank(bank.all, filter)
  return (
    <section className="panel picker">
      <Hint id="own-questions">
        Puedes usar tus propias preguntas: toca «✏️ Mis preguntas» (escribe una o pega varias de
        golpe).
      </Hint>
      <BankFilters items={bank.all} value={filter} onChange={setFilter} showDifficulty showSource />
      <CountChips
        counts={counts}
        value={count}
        onChange={setCount}
        available={pool.length}
        noun="preguntas"
      />
      <div className="row">
        <p className={pool.length < minPool ? 'notice' : 'muted'}>
          {pool.length} preguntas disponibles
          {pool.length < minPool && ` (hacen falta al menos ${minPool}: quita algún filtro)`}
        </p>
        <div className="row start">
          <button className="btn secondary" onClick={() => setManaging(true)}>
            ✏️ Mis preguntas
          </button>
          <button
            className="btn big"
            disabled={pool.length < minPool}
            onClick={() => onStart(pool, Math.min(count, pool.length))}
          >
            {startLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

interface StatementPickerProps extends CountProps {
  startLabel?: string
  onStart: (pool: Statement[], count: number) => void
}

/** Igual que QuestionPicker, pero para afirmaciones de verdadero o falso. */
export function StatementPicker({
  counts,
  defaultCount,
  startLabel = 'Empezar',
  onStart
}: StatementPickerProps): React.JSX.Element {
  const bank = useStatementBank()
  const [filter, setFilter] = usePersistentState<BankFilter>('picker-statements', {})
  const [count, setCount] = usePersistentState('picker-statements-count', defaultCount)
  const [managing, setManaging] = useState(false)
  if (managing) return <StatementManager onClose={() => setManaging(false)} />

  const pool = filterBank(bank.all, filter)
  return (
    <section className="panel picker">
      <Hint id="own-statements">
        Puedes escribir tus propias afirmaciones con «✏️ Mis afirmaciones».
      </Hint>
      <BankFilters items={bank.all} value={filter} onChange={setFilter} showSource />
      <CountChips
        counts={counts}
        value={count}
        onChange={setCount}
        available={pool.length}
        noun="afirmaciones"
      />
      <div className="row">
        <p className={pool.length === 0 ? 'notice' : 'muted'}>
          {pool.length} afirmaciones disponibles
        </p>
        <div className="row start">
          <button className="btn secondary" onClick={() => setManaging(true)}>
            ✏️ Mis afirmaciones
          </button>
          <button
            className="btn big"
            disabled={pool.length === 0}
            onClick={() => onStart(pool, Math.min(count, pool.length))}
          >
            {startLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

type AnyList = WordList | PairList

function ListCards<T extends AnyList>({
  lists,
  selected,
  onToggle,
  size
}: {
  lists: T[]
  selected: string[]
  onToggle: (id: string) => void
  size: (l: T) => string
}): React.JSX.Element {
  if (lists.length === 0) return <p className="notice">No hay listas con esos filtros.</p>
  return (
    <div className="list-cards">
      {lists.map((l) => (
        <button
          key={l.id}
          className={`list-card ${selected.includes(l.id) ? 'selected' : ''}`}
          aria-pressed={selected.includes(l.id)}
          onClick={() => onToggle(l.id)}
        >
          <strong>{l.title}</strong>
          <span className="muted">
            {subjectOf(l.subject).icon} {gradesLabel(l.grades)} · {size(l)}
            {l.custom ? ' · ✏️ mía' : ''}
          </span>
        </button>
      ))}
    </div>
  )
}

interface WordListPickerProps {
  startLabel?: string
  /** Se llama con las listas que eligió la persona (una o varias) */
  onStart: (lists: WordList[]) => void
}

/** Elegir una o varias listas de palabras (ahorcado, palabras desordenadas…), con filtros y acceso a «Mis listas». */
export function WordListPicker({
  startLabel = 'Empezar',
  onStart
}: WordListPickerProps): React.JSX.Element {
  const bank = useWordListBank()
  const [filter, setFilter] = usePersistentState<BankFilter>('picker-words', {})
  const [selected, setSelected] = useState<string[]>([])
  const [managing, setManaging] = useState(false)
  if (managing) return <WordListManager onClose={() => setManaging(false)} />

  const lists = filterBank(bank.all, filter)
  const chosen = lists.filter((l) => selected.includes(l.id))
  return (
    <section className="panel picker">
      <Hint id="own-words">Puedes crear tus propias listas de palabras con «✏️ Mis listas».</Hint>
      <BankFilters items={bank.all} value={filter} onChange={setFilter} showSource />
      <ListCards
        lists={lists}
        selected={selected}
        size={(l) => `${l.items.length} palabras`}
        onToggle={(id) =>
          setSelected(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
        }
      />
      <div className="row">
        <p className="muted">
          {chosen.length === 0
            ? 'Elige una o varias listas'
            : `${chosen.length} lista(s): ${chosen.reduce((n, l) => n + l.items.length, 0)} palabras`}
        </p>
        <div className="row start">
          <button className="btn secondary" onClick={() => setSelected(lists.map((l) => l.id))}>
            Elegir todas las que se ven
          </button>
          <button className="btn secondary" onClick={() => setManaging(true)}>
            ✏️ Mis listas
          </button>
          <button
            className="btn big"
            disabled={chosen.length === 0}
            onClick={() => onStart(chosen)}
          >
            {startLabel}
          </button>
        </div>
      </div>
    </section>
  )
}

interface PairListPickerProps {
  startLabel?: string
  /** Se llama con la lista elegida (una sola, para que las parejas tengan sentido juntas) */
  onStart: (list: PairList) => void
}

/** Elegir una lista de parejas para el juego de memoria, con filtros y acceso a «Mis parejas». */
export function PairListPicker({
  startLabel = 'Jugar',
  onStart
}: PairListPickerProps): React.JSX.Element {
  const bank = usePairListBank()
  const [filter, setFilter] = usePersistentState<BankFilter>('picker-pairs', {})
  const [selected, setSelected] = useState<string | null>(null)
  const [managing, setManaging] = useState(false)
  if (managing) return <PairListManager onClose={() => setManaging(false)} />

  const lists = filterBank(bank.all, filter)
  const chosen = lists.find((l) => l.id === selected)
  return (
    <section className="panel picker">
      <Hint id="own-pairs">Puedes crear tus propias parejas con «✏️ Mis parejas».</Hint>
      <BankFilters items={bank.all} value={filter} onChange={setFilter} showSource />
      <ListCards
        lists={lists}
        selected={selected ? [selected] : []}
        size={(l) => `${l.pairs.length} parejas`}
        onToggle={setSelected}
      />
      <div className="row">
        <p className="muted">{chosen ? chosen.title : 'Elige una lista'}</p>
        <div className="row start">
          <button className="btn secondary" onClick={() => setManaging(true)}>
            ✏️ Mis parejas
          </button>
          <button className="btn big" disabled={!chosen} onClick={() => chosen && onStart(chosen)}>
            {startLabel}
          </button>
        </div>
      </div>
    </section>
  )
}
