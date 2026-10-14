import type { ToolMeta } from '../types'
import pdfLogo from '../../assets/icons/pdf.svg'

export default {
  title: 'Separar páginas de un PDF',
  description: 'Elige las páginas que quieres o sepáralas todas.',
  icon: '📄',
  images: [pdfLogo],
  color: '#e8644a',
  category: 'documents',
  steps: ['Elige el PDF', 'Elige las páginas', 'Guarda'],
  order: 2
} satisfies ToolMeta
