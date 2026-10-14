import type { ToolMeta } from '../types'

export default {
  title: 'Recortar video',
  description: 'Quédate solo con la parte del video que necesitas.',
  icon: '✂️',
  color: '#3b8fd9',
  category: 'video',
  requires: ['ffmpeg'],
  steps: ['Elige el video', 'Marca la parte', 'Guarda'],
  order: 1
} satisfies ToolMeta
