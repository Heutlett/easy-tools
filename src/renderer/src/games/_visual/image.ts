import { useCallback, useEffect, useRef } from 'react'

/** Una imagen elegida por la persona, ya en memoria */
export interface OwnImage {
  id: string
  url: string
  name: string
}

const MAX_SIDE = 1200

/** Carga un archivo de imagen y lo reduce (máx. 1200 px) para que sea liviano; si no se puede, usa el archivo tal cual. */
export async function loadImageFile(file: File): Promise<OwnImage> {
  const id = crypto.randomUUID()
  const name = file.name.replace(/\.[^.]+$/, '')
  try {
    const bitmap = await createImageBitmap(file)
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height))
    const canvas = document.createElement('canvas')
    canvas.width = Math.max(1, Math.round(bitmap.width * scale))
    canvas.height = Math.max(1, Math.round(bitmap.height * scale))
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('sin canvas')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height)
    bitmap.close()
    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/jpeg', 0.9)
    )
    if (!blob) throw new Error('sin blob')
    return { id, name, url: URL.createObjectURL(blob) }
  } catch {
    return { id, name, url: URL.createObjectURL(file) }
  }
}

/** Lleva la cuenta de las imágenes cargadas para liberarlas de la memoria al salir. */
export function useImageLoader(): {
  load: (files: FileList | File[]) => Promise<OwnImage[]>
  release: (image: OwnImage) => void
} {
  const urls = useRef<Set<string>>(new Set())
  useEffect(() => {
    const set = urls.current
    return () => {
      set.forEach((u) => URL.revokeObjectURL(u))
      set.clear()
    }
  }, [])
  const load = useCallback(async (files: FileList | File[]) => {
    const out: OwnImage[] = []
    for (const f of Array.from(files)) {
      if (!f.type.startsWith('image/')) continue
      const img = await loadImageFile(f)
      urls.current.add(img.url)
      out.push(img)
    }
    return out
  }, [])
  const release = useCallback((image: OwnImage) => {
    URL.revokeObjectURL(image.url)
    urls.current.delete(image.url)
  }, [])
  return { load, release }
}

/** Texto para comparar respuestas: sin tildes, mayúsculas ni signos, y sin artículo al inicio */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9ñ ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/^(el|la|los|las|un|una|the|a|an) /, '')
}
