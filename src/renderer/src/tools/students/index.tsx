import { useState } from 'react'
import AddStudents from '../../components/AddStudents'
import { newStudents, useClassrooms, type Group } from '../../lib/classrooms'
import { usePersistentState } from '../../lib/usePersistentState'

export default function Students(): React.JSX.Element {
  const { groups, setGroups, addGroup } = useClassrooms()
  // Se recuerda qué grupo se estaba editando
  const [selectedId, setSelectedId] = usePersistentState<string | null>('students-selected', null)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const selected = groups.find((g) => g.id === selectedId) ?? groups[0] ?? null

  const update = (patch: Partial<Group>): void => {
    if (!selected) return
    setGroups(groups.map((g) => (g.id === selected.id ? { ...g, ...patch } : g)))
  }

  const createGroup = (): void => {
    const group = addGroup(`Grupo ${groups.length + 1}`, [])
    setSelectedId(group.id)
    setConfirmDelete(false)
  }

  const removeGroup = (): void => {
    if (!selected) return
    setGroups(groups.filter((g) => g.id !== selected.id))
    setSelectedId(null)
    setConfirmDelete(false)
  }

  return (
    <div className="students-layout">
      <aside className="panel students-groups">
        <p className="panel-title">Mis grupos</p>
        {groups.map((g) => (
          <button
            key={g.id}
            className={`group-btn ${selected?.id === g.id ? 'selected' : ''}`}
            onClick={() => (setSelectedId(g.id), setConfirmDelete(false))}
          >
            <strong>{g.name || 'Sin nombre'}</strong>
            <span className="muted">
              {g.students.length} {g.students.length === 1 ? 'estudiante' : 'estudiantes'}
            </span>
          </button>
        ))}
        <button className="btn secondary" onClick={createGroup}>
          ＋ Nuevo grupo
        </button>
      </aside>

      {selected ? (
        <section className="panel students-editor">
          <div className="row">
            <input
              className="field group-name"
              aria-label="Nombre del grupo"
              value={selected.name}
              placeholder="Nombre del grupo, por ejemplo 3°A"
              onChange={(e) => update({ name: e.target.value })}
            />
            <span className="muted">
              {selected.students.length}{' '}
              {selected.students.length === 1 ? 'estudiante' : 'estudiantes'}
            </span>
          </div>

          <AddStudents
            onAdd={(names) => update({ students: [...selected.students, ...newStudents(names)] })}
          />

          {selected.students.length > 0 && (
            <>
              <div className="row">
                <p className="panel-title">Estudiantes</p>
                <button
                  className="btn secondary small"
                  onClick={() =>
                    update({
                      students: [...selected.students].sort((a, b) =>
                        a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
                      )
                    })
                  }
                >
                  Ordenar de la A a la Z
                </button>
              </div>
              <ol className="student-list">
                {selected.students.map((s, i) => (
                  <li key={s.id} className="student-row">
                    <span className="file-number">{i + 1}</span>
                    <input
                      className="field"
                      aria-label={`Nombre del estudiante ${i + 1}`}
                      value={s.name}
                      onChange={(e) =>
                        update({
                          students: selected.students.map((x) =>
                            x.id === s.id ? { ...x, name: e.target.value } : x
                          )
                        })
                      }
                      onBlur={(e) => {
                        // Un nombre vacío significa quitar al estudiante
                        if (!e.target.value.trim())
                          update({ students: selected.students.filter((x) => x.id !== s.id) })
                      }}
                    />
                    <button
                      className="icon-btn danger"
                      title="Quitar"
                      aria-label={`Quitar a ${s.name}`}
                      onClick={() =>
                        update({ students: selected.students.filter((x) => x.id !== s.id) })
                      }
                    >
                      ✕
                    </button>
                  </li>
                ))}
              </ol>
            </>
          )}

          <div className="row start">
            {confirmDelete ? (
              <button className="btn danger small" onClick={removeGroup}>
                Sí, borrar este grupo
              </button>
            ) : (
              <button className="btn secondary small" onClick={() => setConfirmDelete(true)}>
                Borrar este grupo
              </button>
            )}
          </div>
        </section>
      ) : (
        <section className="panel students-empty">
          <p className="panel-title">Todavía no tienes ningún grupo</p>
          <p className="muted">
            Crea uno y agrega a tus estudiantes: después los puedes usar en la ruleta y en los
            puntos.
          </p>
          <div>
            <button className="btn big" onClick={createGroup}>
              ＋ Crear mi primer grupo
            </button>
          </div>
        </section>
      )}
    </div>
  )
}
