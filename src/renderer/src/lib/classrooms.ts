import { usePersistentState } from './usePersistentState'

/** Cada estudiante tiene un identificador propio: así se puede cambiar su nombre, o tener dos con el mismo nombre, sin mezclar sus puntos. */
export interface Student {
  id: string
  name: string
}

export interface Group {
  id: string
  name: string
  students: Student[]
}

/**
 * Una lista de nombres, uno por línea. Acepta lo que se pega desde Word o Excel: se ignoran las líneas vacías,
 * los números de lista ("1. Ana", "2) Luis") y las tabulaciones.
 */
export function parseNames(text: string): string[] {
  return text
    .split(/\r?\n/)
    .map((line) =>
      line
        .replace(/\t+/g, ' ')
        .replace(/^\s*\d+\s*[.)\-–]\s*/, '')
        .replace(/\s+/g, ' ')
        .trim()
    )
    .filter(Boolean)
}

export const newStudents = (names: string[]): Student[] =>
  names.map((name) => ({ id: crypto.randomUUID(), name }))

/** Los grupos de estudiantes de la persona usuaria. Se guardan en la computadora y los usan varias herramientas. */
export function useClassrooms(): {
  groups: Group[]
  setGroups: (groups: Group[]) => void
  addGroup: (name: string, names: string[]) => Group
} {
  const [data, setData] = usePersistentState<{ groups: Group[] }>('classrooms', { groups: [] })
  return {
    groups: data.groups,
    setGroups: (groups) => setData({ groups }),
    addGroup: (name, names) => {
      const group: Group = { id: crypto.randomUUID(), name, students: newStudents(names) }
      setData({ groups: [...data.groups, group] })
      return group
    }
  }
}
