/**
 * Grupos de las herramientas de archivos (pantalla «Archivos»), en el orden en que se muestran.
 * Las herramientas de la categoría «classroom» no van ahí: viven en «En el aula», «Mi clase» y «Juegos».
 */
export const categories = [
  {
    id: 'video',
    title: 'Video y audio',
    icon: '🎬',
    color: '#3b8fd9'
  },
  { id: 'documents', title: 'Documentos', icon: '📄', color: '#e8644a' },
  { id: 'images', title: 'Imágenes', icon: '🖼️', color: '#4fae6a' }
] as const

/** Las herramientas del aula no son archivos */
export type FileCategoryId = (typeof categories)[number]['id']
export type CategoryId = FileCategoryId | 'classroom'
