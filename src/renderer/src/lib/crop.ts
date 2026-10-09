/** Zona de recorte como fracciones (0 a 1) del ancho y el alto de la imagen */
export interface CropRect {
  x: number
  y: number
  w: number
  h: number
}

export const clamp = (v: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, v))

/** Ajusta una zona a una proporción (en píxeles), sin salirse de la imagen. */
export function fitRatio(rect: CropRect, ratio: number, width: number, height: number): CropRect {
  const cx = rect.x + rect.w / 2
  const cy = rect.y + rect.h / 2
  let w = rect.w
  let h = (w * width) / (ratio * height)
  if (h > 1) {
    h = 1
    w = (h * ratio * height) / width
  }
  if (w > 1) {
    w = 1
    h = (w * width) / (ratio * height)
  }
  return { x: clamp(cx - w / 2, 0, 1 - w), y: clamp(cy - h / 2, 0, 1 - h), w, h }
}
