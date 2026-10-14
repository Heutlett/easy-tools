import type { GameMeta } from '../types'

export default {
  title: 'Palabras desordenadas',
  description:
    'Las letras vienen mezcladas: arma la palabra en orden antes de que se acabe el tiempo.',
  icon: '🔀',
  type: 'palabras',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos', 'individual'],
  keywords: ['anagrama', 'letras', 'ortografia', 'palabras', 'ordenar'],
  order: 21
} satisfies GameMeta
