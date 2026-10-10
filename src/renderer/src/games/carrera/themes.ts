/** Temas de la pista de la carrera */
export type ThemeId = 'tortugas' | 'buses' | 'carretas'

export interface Theme {
  id: ThemeId
  title: string
  /** Frase para el título de la pista */
  goal: string
  /** Lo que hay en la meta */
  finish: string
}

export const THEMES: Theme[] = [
  { id: 'tortugas', title: 'Tortugas al mar', goal: 'llegó al mar', finish: '🌊' },
  { id: 'buses', title: 'Buses a la escuela', goal: 'llegó a la escuela', finish: '🏫' },
  { id: 'carretas', title: 'Carretas pintadas', goal: 'llegó a la fiesta', finish: '🎉' }
]
