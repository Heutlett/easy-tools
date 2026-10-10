import { useRef, useState } from 'react'
import { clamp, type CropRect } from '../lib/crop'

interface Props {
  src: string
  /** Tamaño real de la imagen en píxeles (para respetar las proporciones) */
  width: number
  height: number
  /** Proporción fija ancho/alto, o null si es libre */
  ratio: number | null
  rect: CropRect
  onChange: (rect: CropRect) => void
}

type Handle = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

const MIN = 0.05

/** Imagen con un marco de recorte que se mueve y se estira arrastrando. */
export default function CropBox({
  src,
  width,
  height,
  ratio,
  rect,
  onChange
}: Props): React.JSX.Element {
  const frame = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{
    handle: Handle
    start: CropRect
    px: number
    py: number
  } | null>(null)

  const point = (e: React.PointerEvent): { x: number; y: number } => {
    const box = frame.current!.getBoundingClientRect()
    return {
      x: clamp((e.clientX - box.left) / box.width, 0, 1),
      y: clamp((e.clientY - box.top) / box.height, 0, 1)
    }
  }

  const onDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    const handle = (e.target as HTMLElement).dataset.handle as Handle | undefined
    if (!handle) return
    e.currentTarget.setPointerCapture(e.pointerId)
    const p = point(e)
    setDrag({ handle, start: rect, px: p.x, py: p.y })
  }

  const onMove = (e: React.PointerEvent): void => {
    if (!drag) return
    const p = point(e)
    const { start, handle } = drag
    if (handle === 'move') {
      onChange({
        ...start,
        x: clamp(start.x + p.x - drag.px, 0, 1 - start.w),
        y: clamp(start.y + p.y - drag.py, 0, 1 - start.h)
      })
      return
    }

    // Se estira desde el lado o la esquina contraria, que se queda quieta
    const right = start.x + start.w
    const bottom = start.y + start.h
    const movesLeft = handle.includes('w')
    const movesRight = handle.includes('e')
    const movesTop = handle.includes('n')
    const movesBottom = handle.includes('s')
    let x1 = movesLeft ? Math.min(p.x, right - MIN) : start.x
    let x2 = movesRight ? Math.max(p.x, start.x + MIN) : right
    let y1 = movesTop ? Math.min(p.y, bottom - MIN) : start.y
    let y2 = movesBottom ? Math.max(p.y, start.y + MIN) : bottom

    if (ratio && handle.length === 2) {
      // Esquina con proporción fija: se usa el más pequeño de los dos tamaños posibles
      const anchorX = movesLeft ? right : start.x
      const anchorY = movesTop ? bottom : start.y
      const availW = movesLeft ? anchorX : 1 - anchorX
      const availH = movesTop ? anchorY : 1 - anchorY
      let w = Math.min(Math.abs(p.x - anchorX), availW)
      let h = Math.min(Math.abs(p.y - anchorY), availH)
      const hFromW = (w * width) / (ratio * height)
      if (hFromW <= h) h = hFromW
      else w = (h * ratio * height) / width
      w = Math.max(w, MIN)
      h = (w * width) / (ratio * height)
      x1 = movesLeft ? anchorX - w : anchorX
      x2 = movesLeft ? anchorX : anchorX + w
      y1 = movesTop ? anchorY - h : anchorY
      y2 = movesTop ? anchorY : anchorY + h
    }
    onChange({ x: x1, y: y1, w: x2 - x1, h: y2 - y1 })
  }

  const handles: Handle[] = ratio
    ? ['nw', 'ne', 'se', 'sw']
    : ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

  return (
    <div className="crop-wrap">
      <div
        ref={frame}
        className={`crop-frame ${drag ? 'dragging' : ''}`}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={() => setDrag(null)}
        onPointerCancel={() => setDrag(null)}
      >
        <img src={src} alt="" draggable={false} />
        <div
          className="crop-box"
          data-handle="move"
          style={{
            left: `${rect.x * 100}%`,
            top: `${rect.y * 100}%`,
            width: `${rect.w * 100}%`,
            height: `${rect.h * 100}%`
          }}
        >
          {handles.map((h) => (
            <i key={h} className={`crop-handle ${h}`} data-handle={h} />
          ))}
        </div>
      </div>
    </div>
  )
}
