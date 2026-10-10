import type { ToolMeta } from '../types'

export default {
  title: 'Unir videos',
  description: 'Junta varios videos en uno solo, en el orden que quieras.',
  icon: '🎞️',
  color: '#0891b2',
  category: 'video',
  requires: ['ffmpeg'],
  order: 4
} satisfies ToolMeta
