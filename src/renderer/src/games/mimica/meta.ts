import type { GameMeta } from '../types'

export default {
  title: 'Mímica y adivinanzas',
  description:
    'Actuar, dibujar o describir una palabra secreta sin decirla, mientras la clase adivina antes de que se acabe el tiempo.',
  icon: '🎭',
  type: 'palabras',
  subjects: [],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['equipos', 'turnos', 'clase'],
  keywords: ['charadas', 'dibujo', 'actuar', 'pictionary', 'adivinar', 'palabras prohibidas'],
  order: 20
} satisfies GameMeta
