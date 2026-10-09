/** Secciones de la pantalla de inicio, en el orden en que se muestran. */
export const categories = [
  { id: 'video', title: 'Video y audio', icon: '🎬' },
  { id: 'documents', title: 'Documentos', icon: '📄' },
  { id: 'images', title: 'Imágenes', icon: '🖼️' },
  { id: 'classroom', title: 'Para el aula', icon: '🏫' }
] as const

export type CategoryId = (typeof categories)[number]['id']
