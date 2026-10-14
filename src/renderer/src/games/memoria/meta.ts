import type { GameMeta } from '../types'

export default {
  title: 'Memoria',
  description:
    'Voltea las cartas y encuentra las parejas: palabra y dibujo, país y capital, inglés y español…',
  icon: '🃏',
  type: 'palabras',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['equipos', 'turnos', 'individual'],
  keywords: ['parejas', 'cartas', 'concentrese', 'memoria', 'emparejar'],
  order: 22
} satisfies GameMeta
