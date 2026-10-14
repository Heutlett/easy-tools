import { useEffect, useRef, useState } from 'react'
import AddStudents from '../../components/AddStudents'
import { useClassrooms } from '../../lib/classrooms'
import { usePersistentState } from '../../lib/usePersistentState'
import { TIERS, pointsLabel, pointsToEmojis } from './tiers'

interface StarEvent {
  id: string
  group: string
  student: string
  reason: string
  /** Momento en que se dio (milisegundos) */
  at: number
}

const PRESETS = [
  'Participó',
  'Ayudó a un compañero',
  'Buen comportamiento',
  'Tarea completa',
  'Sin razón'
]
const OTHER = 'Otra razón…'

/** La hora de ahora (aparte para poder usarla en los botones sin que cuente como parte del dibujo de la pantalla) */
const now = (): number => Date.now()

function timeAgo(at: number): string {
  const minutes = Math.floor((now() - at) / 60000)
  if (minutes < 1) return 'hace un momento'
  if (minutes < 60) return `hace ${minutes} min`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `hace ${hours} h`
  return new Date(at).toLocaleDateString('es-CR')
}

export default function Points(): React.JSX.Element {
  const { groups, addGroup } = useClassrooms()
  const [store, setStore] = usePersistentState<{ events: StarEvent[] }>('stars', { events: [] })
  const [groupId, setGroupId] = usePersistentState<string | null>('stars-group', null)
  const [reasonChoice, setReasonChoice] = usePersistentState('stars-reason', PRESETS[0])
  const [custom, setCustom] = usePersistentState('stars-custom-reason', '')
  const [sort, setSort] = usePersistentState<'list' | 'stars'>('stars-sort', 'list')
  const [confirmReset, setConfirmReset] = useState(false)
  const [bumped, setBumped] = useState<string | null>(null)
  const bumpTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => () => clearTimeout(bumpTimer.current), [])

  const group = groups.find((g) => g.id === groupId) ?? groups[0] ?? null

  if (!group) {
    return (
      <section className="panel students-empty">
        <p className="panel-title">Primero necesitas un grupo de estudiantes</p>
        <p className="muted">
          Escribe o pega aquí los nombres (también puedes guardarlos y editarlos en «Estudiantes»).
        </p>
        <AddStudents
          label="Crear mi grupo"
          onAdd={(names) => setGroupId(addGroup('Mi grupo', names).id)}
        />
      </section>
    )
  }

  const reason = reasonChoice === OTHER ? custom.trim() || 'Otra razón' : reasonChoice
  const events = store.events.filter((e) => e.group === group.id)
  const countOf = (studentId: string): number =>
    events.filter((e) => e.student === studentId).length
  const total = events.filter((e) => group.students.some((s) => s.id === e.student)).length

  const give = (studentId: string): void => {
    setStore({
      events: [
        ...store.events,
        { id: crypto.randomUUID(), group: group.id, student: studentId, reason, at: now() }
      ]
    })
    setBumped(studentId)
    clearTimeout(bumpTimer.current)
    bumpTimer.current = setTimeout(() => setBumped(null), 700)
  }

  /** Quita el punto más reciente de un estudiante (o del grupo si no se dice cuál) */
  const takeBack = (studentId?: string): void => {
    for (let i = store.events.length - 1; i >= 0; i--) {
      const e = store.events[i]
      if (e.group === group.id && (!studentId || e.student === studentId)) {
        setStore({ events: store.events.filter((_, k) => k !== i) })
        return
      }
    }
  }

  const students =
    sort === 'stars'
      ? [...group.students].sort((a, b) => countOf(b.id) - countOf(a.id))
      : group.students
  const recent = [...events].reverse().slice(0, 8)
  const nameOf = (id: string): string =>
    group.students.find((s) => s.id === id)?.name ?? '(ya no está en la lista)'

  const last = recent[0]

  return (
    <>
      <div className="points-top">
        {groups.length > 1 && (
          <div className="chips" role="group" aria-label="Grupo">
            {groups.map((g) => (
              <button
                key={g.id}
                className={`chip ${g.id === group.id ? 'on' : ''}`}
                aria-pressed={g.id === group.id}
                onClick={() => (setGroupId(g.id), setConfirmReset(false))}
              >
                👥 {g.name || 'Sin nombre'}
              </button>
            ))}
          </div>
        )}
        <div className="segmented push" role="group" aria-label="Orden">
          <button className={sort === 'list' ? 'on' : ''} onClick={() => setSort('list')}>
            En orden de lista
          </button>
          <button className={sort === 'stars' ? 'on' : ''} onClick={() => setSort('stars')}>
            Más puntos primero
          </button>
        </div>
      </div>

      <div className="reason-panel">
        <b>El punto es por:</b>
        <div className="chips" role="group" aria-label="Razón del punto">
          {[...PRESETS, OTHER].map((r) => (
            <button
              key={r}
              className={`chip ${reasonChoice === r ? 'on' : ''}`}
              aria-pressed={reasonChoice === r}
              onClick={() => setReasonChoice(r)}
            >
              {r}
            </button>
          ))}
        </div>
        <div className="tiers" aria-label="Equivalencias">
          {[...TIERS].reverse().map((t) => (
            <span key={t.value} className="tier">
              {t.emoji} {t.value}
            </span>
          ))}
        </div>
        {reasonChoice === OTHER && (
          <input
            className="field reason-custom"
            value={custom}
            placeholder="Escribe la razón"
            aria-label="Otra razón"
            onChange={(e) => setCustom(e.target.value)}
          />
        )}
      </div>

      {group.students.length === 0 ? (
        <p className="notice">
          Este grupo no tiene estudiantes todavía. Agrégalos en «Estudiantes».
        </p>
      ) : (
        <div className="star-grid">
          {students.map((s) => {
            const n = countOf(s.id)
            return (
              <div
                key={s.id}
                className={`star-card ${bumped === s.id ? 'bump' : ''} ${last?.student === s.id ? 'last' : ''}`}
              >
                <strong className="star-name">{s.name}</strong>
                <div className="star-count" aria-live="polite" aria-label={pointsLabel(n)}>
                  <span className="star-number">{n}</span>
                  <span className="star-emojis" aria-hidden="true">
                    {pointsToEmojis(n).map((emoji, i) => (
                      <span key={i}>{emoji}</span>
                    ))}
                  </span>
                </div>
                <div className="star-actions">
                  <button className="btn star-give" onClick={() => give(s.id)}>
                    ⭐ +1
                  </button>
                  <button
                    className="icon-btn"
                    title="Quitar el último punto"
                    aria-label={`Quitar un punto a ${s.name}`}
                    disabled={n === 0}
                    onClick={() => takeBack(s.id)}
                  >
                    −
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      <div className="total-bar">
        <b>Total del grupo: {pointsLabel(total)}</b>
        {last && (
          <span className="muted total-last">
            Último: +1 a {nameOf(last.student)} ({last.reason})
          </span>
        )}
        <button
          className="btn secondary small"
          disabled={events.length === 0}
          onClick={() => takeBack()}
        >
          ↶ Deshacer
        </button>
        {confirmReset ? (
          <button
            className="btn danger small"
            onClick={() => {
              setStore({ events: store.events.filter((e) => e.group !== group.id) })
              setConfirmReset(false)
            }}
          >
            Sí, empezar de cero
          </button>
        ) : (
          <button
            className="btn secondary small"
            disabled={events.length === 0}
            onClick={() => (setConfirmReset(true), setTimeout(() => setConfirmReset(false), 3500))}
          >
            Reiniciar
          </button>
        )}
      </div>
      {recent.length > 1 && (
        <details className="star-history-box">
          <summary>Últimos puntos</summary>
          <ul className="star-history">
            {recent.map((e) => (
              <li key={e.id}>
                <strong>{nameOf(e.student)}</strong> · {e.reason}{' '}
                <span className="muted">· {timeAgo(e.at)}</span>
              </li>
            ))}
          </ul>
        </details>
      )}
    </>
  )
}
