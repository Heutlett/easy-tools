import { useClassrooms } from '../lib/classrooms'
import { usePersistentState } from '../lib/usePersistentState'
import { useNav, type ClassTab } from '../lib/nav'
import Points from '../tools/stars/Points'
import Ranking from '../tools/stars/Ranking'
import Students from '../tools/students'

const TABS: { id: ClassTab; icon: string; title: string; sub: string }[] = [
  { id: 'points', icon: '⭐', title: 'Puntos', sub: 'Los das tú, a mano' },
  { id: 'ranking', icon: '🏆', title: 'Ranking de juegos', sub: 'Se llena solo al jugar' },
  { id: 'students', icon: '📋', title: 'Estudiantes', sub: 'Nombres de tus grupos' }
]

/** Mi clase: los grupos de estudiantes, los puntos que se dan a mano y el ranking de los juegos. */
export default function ClassPage(): React.JSX.Element {
  const { place, patch } = useNav()
  const tab = place.classTab
  const { groups } = useClassrooms()
  const [selectedId] = usePersistentState<string | null>('students-selected', null)
  const selected = groups.find((g) => g.id === selectedId) ?? groups[0] ?? null

  return (
    <div className="page class-page">
      <header className="page-head">
        <div>
          <h1>Mi clase</h1>
          <p className="page-sub">Tus grupos, los puntos que das y el ranking de los juegos.</p>
        </div>
        {selected && (
          <button
            className="group-badge"
            title="Cambia de grupo en cada pestaña"
            onClick={() => patch({ classTab: 'students' })}
          >
            👥 {selected.name || 'Sin nombre'} · {selected.students.length}{' '}
            {selected.students.length === 1 ? 'estudiante' : 'estudiantes'}
          </button>
        )}
      </header>

      <div className="tabs-wide" role="tablist" aria-label="Mi clase">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            className={tab === t.id ? 'on' : ''}
            onClick={() => patch({ classTab: t.id })}
          >
            <span className="tab-icon" aria-hidden>
              {t.icon}
            </span>
            <span>
              <b>{t.title}</b>
              <small>{t.sub}</small>
            </span>
          </button>
        ))}
      </div>

      {tab === 'points' && (
        <div className="pr-pane points">
          <p className="pr-note points">
            ⭐ Estos puntos <b>los das tú</b>, cuando quieras. No se mezclan con el ranking de los
            juegos.
          </p>
          <Points />
        </div>
      )}
      {tab === 'ranking' && (
        <div className="pr-pane ranking">
          <p className="pr-note ranking">
            🏆 El ranking <b>se llena solo</b> cuando juegan en «Juegos» con estudiantes de tus
            grupos. No se mezcla con los puntos que das tú.
          </p>
          <Ranking />
        </div>
      )}
      {tab === 'students' && <Students />}
    </div>
  )
}
