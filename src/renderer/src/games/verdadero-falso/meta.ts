import type { GameMeta } from '../types'

export default {
  title: 'Verdadero o falso',
  description:
    'Una afirmación en pantalla: la clase decide si es verdadera o falsa y se revela la respuesta.',
  icon: '✅',
  type: 'preguntas',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos'],
  keywords: ['preguntas', 'afirmaciones', 'cierto', 'falso', 'verdad'],
  order: 12
} satisfies GameMeta
