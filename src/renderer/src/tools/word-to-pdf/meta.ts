import type { ToolMeta } from '../types'
import wordLogo from '../../assets/icons/word.svg'
import pdfLogo from '../../assets/icons/pdf.svg'

export default {
  title: 'Word a PDF',
  description: 'Convierte un documento de Word en un PDF listo para enviar o imprimir.',
  icon: '📘',
  images: [wordLogo, pdfLogo],
  color: '#2563eb',
  category: 'documents',
  order: 4
} satisfies ToolMeta
