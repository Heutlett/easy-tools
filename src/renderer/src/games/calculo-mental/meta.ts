import type { GameMeta } from '../types'

export default {
  title: 'Cálculo mental relámpago',
  description:
    'Operaciones grandes en pantalla con cuenta regresiva: relámpago para toda la clase, duelo de equipos o a solas.',
  icon: '⚡',
  type: 'mate',
  subjects: ['matematica'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'individual'],
  keywords: ['sumas', 'restas', 'multiplicacion', 'division', 'tablas', 'operaciones'],
  order: 10
} satisfies GameMeta
