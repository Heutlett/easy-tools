import type { GameMeta } from '../types'

export default {
  title: 'Ahorcado',
  description:
    'Adivina la palabra letra por letra antes de que se derrita el helado. Toda la clase o por equipos.',
  icon: '🔤',
  color: '#db2777',
  subjects: ['matematica', 'espanol', 'ciencias', 'sociales', 'ingles', 'musica', 'cultura'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos'],
  keywords: ['letras', 'palabras', 'adivinar', 'adivina la palabra', 'helado'],
  order: 20
} satisfies GameMeta
