import type { FileKind } from '../../../shared/types'

export const EXTENSIONS: Record<FileKind, string[]> = {
  video: ['mp4', 'mov', 'mkv', 'avi', 'webm', 'm4v', 'wmv', '3gp', 'mpg', 'mpeg'],
  pdf: ['pdf'],
  image: ['png', 'jpg', 'jpeg', 'webp'],
  // .doc se acepta para poder explicar por qué no se puede convertir
  word: ['docx', 'doc']
}

export function matchesKind(path: string, kind: FileKind): boolean {
  const ext = path.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSIONS[kind].includes(ext)
}
