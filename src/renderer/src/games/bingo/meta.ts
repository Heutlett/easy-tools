import type { GameMeta } from '../types'

export default {
  title: 'Bingo',
  description:
    'Saca las bolitas del bingo y las canta en voz alta. Incluye el tablero y un revisor de cartones.',
  icon: '🎱',
  type: 'azar',
  subjects: [],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase'],
  keywords: ['numeros', 'tombola', 'cartones', 'voz', 'azar'],
  order: 20
} satisfies GameMeta
