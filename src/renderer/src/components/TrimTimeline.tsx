import { useRef, useState } from 'react'
import { formatTime } from '../lib/format'

interface Props {
  duration: number
  start: number
  end: number
  /** Posición actual del video, para dibujar la línea blanca */
  current: number
  /** Miniaturas repartidas a lo largo del video (null = todavía cargando) */
  frames: (string | null)[]
  onChange: (start: number, end: number) => void
  /** Pide que la vista previa muestre este momento del video */
  onSeek: (time: number) => void
}

type Mode = 'start' | 'end' | 'move' | 'scrub'

const MIN_GAP = 0.3
/** Movimiento mínimo (px) para considerar que se arrastró y no que se hizo clic */
const DRAG_THRESHOLD = 4

const clamp = (v: number, min: number, max: number): number => Math.min(max, Math.max(min, v))

/**
 * Línea de tiempo estilo editor de video: tira de fotogramas con la parte elegida resaltada.
 * - Arrastrar las manijas cambia el inicio o el final.
 * - Arrastrar la parte resaltada mueve todo el recorte.
 * - Hacer clic (o arrastrar) sobre la tira mueve la línea blanca de reproducción.
 */
export default function TrimTimeline({
  duration,
  start,
  end,
  current,
  frames,
  onChange,
  onSeek
}: Props): React.JSX.Element {
  const ref = useRef<HTMLDivElement>(null)
  const [drag, setDrag] = useState<{
    mode: Mode
    offset: number
    startX: number
    moved: boolean
  } | null>(null)

  const pct = (t: number): string => `${(t / duration) * 100}%`
  const timeAt = (clientX: number): number => {
    const rect = ref.current!.getBoundingClientRect()
    return clamp(((clientX - rect.left) / rect.width) * duration, 0, duration)
  }

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>): void => {
    const mode = ((e.target as HTMLElement).dataset.role as Mode | undefined) ?? 'scrub'
    const t = timeAt(e.clientX)
    e.currentTarget.setPointerCapture(e.pointerId)
    setDrag({ mode, offset: t - start, startX: e.clientX, moved: mode !== 'move' })
    if (mode === 'scrub') onSeek(clamp(t, start, end))
  }

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>): void => {
    if (!drag) return
    const t = timeAt(e.clientX)
    if (drag.mode === 'start') {
      const next = Math.min(t, end - MIN_GAP)
      onChange(next, end)
      onSeek(next)
    } else if (drag.mode === 'end') {
      const next = Math.max(t, start + MIN_GAP)
      onChange(start, next)
      // Se muestra el último fotograma que quedaría dentro del recorte
      onSeek(Math.max(start, next - 0.05))
    } else if (drag.mode === 'move') {
      if (!drag.moved) {
        if (Math.abs(e.clientX - drag.startX) < DRAG_THRESHOLD) return
        setDrag({ ...drag, moved: true })
      }
      const length = end - start
      const next = clamp(t - drag.offset, 0, duration - length)
      onChange(next, next + length)
      onSeek(next)
    } else {
      onSeek(clamp(t, start, end))
    }
  }

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>): void => {
    // Un clic sobre la parte resaltada (sin arrastrar) mueve la línea de reproducción
    if (drag?.mode === 'move' && !drag.moved) onSeek(clamp(timeAt(e.clientX), start, end))
    setDrag(null)
  }

  return (
    <div className="timeline-wrap">
      <div
        ref={ref}
        className={`timeline ${drag ? 'dragging' : ''}`}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => setDrag(null)}
      >
        <div className="film">
          {frames.map((src, i) => (
            <div
              key={i}
              className={`film-frame ${src ? '' : 'loading'}`}
              style={src ? { backgroundImage: `url(${src})` } : undefined}
            />
          ))}
        </div>
        <div className="film-dim" style={{ left: 0, width: pct(start) }} />
        <div className="film-dim" style={{ left: pct(end), right: 0 }} />
        <div
          className="film-selection"
          data-role="move"
          style={{ left: pct(start), width: `${((end - start) / duration) * 100}%` }}
        />
        <div
          className="film-handle start"
          data-role="start"
          style={{ left: pct(start) }}
          title="Inicio del recorte"
        >
          <i />
        </div>
        <div
          className="film-handle end"
          data-role="end"
          style={{ left: pct(end) }}
          title="Final del recorte"
        >
          <i />
        </div>
        <div className="film-playhead" style={{ left: pct(clamp(current, 0, duration)) }} />
      </div>
      <div className="timeline-labels">
        <span>{formatTime(0)}</span>
        <span>{formatTime(duration)}</span>
      </div>
    </div>
  )
}
