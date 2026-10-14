import type { GameMeta } from '../types'

export default {
  title: 'Carrera de equipos',
  description:
    'Una pista con un carril por equipo: cada acierto hace avanzar una casilla. Con o sin preguntas.',
  icon: '🏁',
  type: 'preguntas',
  subjects: [],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['equipos', 'turnos'],
  keywords: [
    'carrera',
    'pista',
    'equipos',
    'competencia',
    'tortugas',
    'buses',
    'carretas',
    'podio',
    'preguntas',
    'avanzar',
    'marcador'
  ],
  order: 44
} satisfies GameMeta
