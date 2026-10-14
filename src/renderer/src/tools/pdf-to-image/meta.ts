import imageLogo from '../../assets/icons/image.svg'
import pdfLogo from '../../assets/icons/pdf.svg'
import type { ToolMeta } from '../types'

export default {
  title: 'PDF a imagen',
  description: 'Guarda cada página de un PDF como una imagen JPG o PNG.',
  icon: '🖼️',
  images: [pdfLogo, imageLogo],
  color: '#4fae6a',
  category: 'images',
  order: 3
} satisfies ToolMeta
