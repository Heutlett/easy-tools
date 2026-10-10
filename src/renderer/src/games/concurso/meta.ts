import type { GameMeta } from '../types'

export default {
  title: 'Concurso de preguntas',
  description:
    'Tablero de categorías y puntos: cada equipo elige una casilla, responde y suma. Hay casillas de «Doble o nada».',
  icon: '🏆',
  color: '#b45309',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['equipos', 'turnos'],
  keywords: ['jeopardy', 'tablero', 'preguntas', 'categorias', 'equipos'],
  order: 14
} satisfies GameMeta
