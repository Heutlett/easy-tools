import type { GameMeta } from '../types'

export default {
  title: 'Lee las notas',
  description:
    'Una nota aparece en el pentagrama: ¿cómo se llama? También se puede escuchar una nota y elegir cuál es.',
  icon: '🎼',
  color: '#db2777',
  subjects: ['musica'],
  grades: [3, 4, 5, 6],
  modes: ['clase', 'equipos', 'turnos', 'individual'],
  keywords: ['notas', 'pentagrama', 'clave de sol', 'do re mi', 'leer musica', 'solfeo', 'oido'],
  order: 30
} satisfies GameMeta
