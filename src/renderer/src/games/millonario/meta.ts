import type { GameMeta } from '../types'

export default {
  title: '¿Quién quiere ser millonario?',
  description:
    'El concurso de la tele en el aula: 15 preguntas con premios en colones, comodines y la opción de retirarse.',
  icon: '💰',
  color: '#1d4ed8',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos'],
  keywords: ['preguntas', 'concurso', 'millonario', 'premios'],
  order: 10
} satisfies GameMeta
