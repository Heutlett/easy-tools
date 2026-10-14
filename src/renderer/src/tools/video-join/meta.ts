import type { ToolMeta } from '../types'

export default {
  title: 'Unir videos',
  description: 'Junta varios videos en uno solo, en el orden que quieras.',
  icon: '🎞️',
  color: '#3b8fd9',
  category: 'video',
  requires: ['ffmpeg'],
  steps: ['Elige los videos', 'Ordénalos', 'Guarda'],
  order: 4
} satisfies ToolMeta
