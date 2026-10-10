import type { GameMeta } from '../types'

export default {
  title: '¿Qué instrumento es?',
  description:
    'Suena un instrumento y hay que reconocerlo; también se clasifican por familias: cuerdas, viento madera, viento metal y percusión.',
  icon: '🎷',
  color: '#b45309',
  subjects: ['musica'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos', 'individual'],
  keywords: [
    'instrumentos',
    'familias',
    'cuerdas',
    'viento',
    'percusion',
    'timbre',
    'marimba',
    'sonidos'
  ],
  order: 34
} satisfies GameMeta
