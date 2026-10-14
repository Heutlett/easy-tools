import type { ToolMeta } from '../types'

export default {
  title: 'Sacar el audio de un video',
  description: 'Convierte un video en un archivo de audio MP3.',
  icon: '🎵',
  color: '#3b8fd9',
  category: 'video',
  requires: ['ffmpeg'],
  order: 2
} satisfies ToolMeta
