import type { ToolMeta } from '../types'
import pdfLogo from '../../assets/icons/pdf.svg'
import wordLogo from '../../assets/icons/word.svg'

export default {
  title: 'PDF a Word',
  description: 'Convierte un PDF en un documento de Word que puedes editar.',
  icon: '📝',
  images: [pdfLogo, wordLogo],
  color: '#7c3aed',
  category: 'documents',
  order: 3
} satisfies ToolMeta
