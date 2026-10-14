import type { ToolMeta } from '../types'
import pdfLogo from '../../assets/icons/pdf.svg'

export default {
  title: 'Unir PDFs',
  description: 'Junta varios PDFs en un solo documento.',
  icon: '📚',
  images: [pdfLogo],
  color: '#e8644a',
  category: 'documents',
  steps: ['Elige los PDFs', 'Ordénalos', 'Guarda'],
  order: 1
} satisfies ToolMeta
