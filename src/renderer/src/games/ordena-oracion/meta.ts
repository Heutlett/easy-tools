import type { GameMeta } from '../types'

export default {
  title: 'Ordena la oración',
  description:
    'Con las palabras desordenadas se arma la oración, con mayúscula y signos desde 2.º.',
  icon: '🧩',
  type: 'lectura',
  subjects: ['espanol'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos', 'individual'],
  keywords: ['oraciones', 'gramatica', 'frases', 'ordenar', 'puntuacion', 'mayuscula', 'palabras'],
  order: 22
} satisfies GameMeta
