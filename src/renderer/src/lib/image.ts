export interface DecodedImage {
  width: number
  height: number
  /** Píxeles RGBA, 4 bytes por píxel */
  rgba: ArrayBuffer
}

/**
 * Lee una imagen con el motor del navegador (soporta PNG, JPG y WEBP y respeta la rotación
 * guardada por el celular). Si es enorme se reduce para no agotar la memoria.
 */
export async function decodeImage(path: string, maxSide = 4096): Promise<DecodedImage> {
  const response = await fetch(window.api.mediaUrl(path))
  const bitmap = await createImageBitmap(await response.blob(), { imageOrientation: 'from-image' })
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height))
  const width = Math.max(1, Math.round(bitmap.width * scale))
  const height = Math.max(1, Math.round(bitmap.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()
  return { width, height, rgba: ctx.getImageData(0, 0, width, height).data.buffer as ArrayBuffer }
}
