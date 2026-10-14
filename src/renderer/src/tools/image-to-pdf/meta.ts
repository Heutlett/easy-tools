import imageLogo from '../../assets/icons/image.svg'
import pdfLogo from '../../assets/icons/pdf.svg'
import type { ToolMeta } from '../types'

export default {
  title: 'Imagen a PDF',
  description: 'Junta una o varias imágenes en un solo PDF, una por página.',
  icon: '🖼️',
  images: [imageLogo, pdfLogo],
  color: '#4fae6a',
  category: 'images',
  steps: ['Elige las imágenes', 'Ordénalas', 'Guarda'],
  order: 4
} satisfies ToolMeta
