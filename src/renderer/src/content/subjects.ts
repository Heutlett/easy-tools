import type { Grade, SubjectId } from './types'

export interface Subject {
  id: SubjectId
  title: string
  icon: string
  color: string
}

/** Asignaturas, en el orden en que se muestran en los filtros */
export const SUBJECTS: Subject[] = [
  { id: 'matematica', title: 'Matemática', icon: '🔢', color: '#3b8fd9' },
  { id: 'espanol', title: 'Español', icon: '📖', color: '#e8644a' },
  { id: 'ciencias', title: 'Ciencias', icon: '🔬', color: '#4fae6a' },
  { id: 'sociales', title: 'Estudios Sociales', icon: '🌎', color: '#e0a020' },
  { id: 'ingles', title: 'Inglés', icon: '🇬🇧', color: '#8a63d2' },
  { id: 'musica', title: 'Música', icon: '🎵', color: '#e46aa8' },
  { id: 'cultura', title: 'Cultura de Costa Rica', icon: '🇨🇷', color: '#2aa3a0' }
]

export const subjectOf = (id: SubjectId): Subject =>
  SUBJECTS.find((s) => s.id === id) ?? SUBJECTS[0]

export const gradeLabel = (g: Grade): string => `${g}.º`

/** Texto corto para varios grados: «1.º a 3.º», «4.º», «1.º, 3.º y 5.º» */
export function gradesLabel(grades: Grade[]): string {
  const sorted = [...new Set(grades)].sort((a, b) => a - b)
  if (sorted.length === 0) return ''
  if (sorted.length === 1) return gradeLabel(sorted[0])
  const consecutive = sorted.every((g, i) => i === 0 || g === sorted[i - 1] + 1)
  if (consecutive) return `${gradeLabel(sorted[0])} a ${gradeLabel(sorted[sorted.length - 1])}`
  return `${sorted.slice(0, -1).map(gradeLabel).join(', ')} y ${gradeLabel(sorted[sorted.length - 1])}`
}
