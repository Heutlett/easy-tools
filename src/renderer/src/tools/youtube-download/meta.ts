import type { ToolMeta } from '../types'
import youtubeLogo from '../../assets/icons/youtube.svg'

export default {
  title: 'Descargar de YouTube',
  description: 'Guarda un video o su audio para usarlo sin internet.',
  icon: '⬇️',
  images: [youtubeLogo],
  color: '#3b8fd9',
  category: 'video',
  requires: ['ytdlp', 'ffmpeg'],
  steps: ['Pega el enlace', 'Revisa', 'Guarda'],
  order: 3
} satisfies ToolMeta
