import type { GameMeta } from '../types'

export default {
  title: 'Adivina la melodía',
  description:
    'Suenan las primeras notas de una canción y hay que adivinar cuál es: con melodía, solo con el ritmo o sin ritmo.',
  icon: '🎶',
  type: 'musica',
  subjects: ['musica'],
  grades: [1, 2, 3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos', 'individual'],
  keywords: ['canciones', 'melodia', 'adivinar', 'escuchar', 'oido', 'ritmo', 'cancion'],
  order: 33
} satisfies GameMeta
