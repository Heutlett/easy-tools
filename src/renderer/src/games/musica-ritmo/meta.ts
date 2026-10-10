import type { GameMeta } from '../types'

export default {
  title: 'Eco rítmico',
  description:
    'Se escucha y se lee un ritmo con negras, corcheas y silencios, y la clase lo repite en el tambor de la pantalla o con la barra espaciadora.',
  icon: '🥁',
  color: '#ea580c',
  subjects: ['musica'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos', 'individual'],
  keywords: [
    'ritmo',
    'pulso',
    'compas',
    'figuras',
    'silencios',
    'negra',
    'corchea',
    'metronomo',
    'eco'
  ],
  order: 32
} satisfies GameMeta
