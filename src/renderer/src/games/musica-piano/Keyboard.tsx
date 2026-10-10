import { useEffect, useRef, useState } from 'react'
import { freqOfMidi, pitchName, pitchOfMidi } from '../_musica/notes'
import { startVoice, type InstrumentId, type Voice } from '../_musica/synth'
import { keyLabels, keyMap, type KeyboardSize, type Labels } from './data'

const BLACK = [1, 3, 6, 8, 10]
const isBlack = (midi: number): boolean => BLACK.includes(((midi % 12) + 12) % 12)

interface Props {
  size: KeyboardSize
  inst: InstrumentId
  labels: Labels
  /** Tecla que toca ahora (se marca con un brillo) */
  target?: number
  /** Teclas que se iluminan (por ejemplo al escuchar la canción) */
  lit?: number[]
  /** Tecla que acaba de acertarse o fallarse */
  flash?: { midi: number; ok: boolean; n: number }
  /** Se avisa cada vez que se toca una tecla (con el mouse o el teclado de la computadora) */
  onPlay?: (midi: number) => void
}

/** Teclado de piano en pantalla: suena con el mouse (también arrastrando) y con el teclado de la computadora. */
export default function Keyboard({
  size,
  inst,
  labels,
  target,
  lit = [],
  flash,
  onPlay
}: Props): React.JSX.Element {
  const [pressed, setPressed] = useState<number[]>([])
  const voices = useRef(new Map<number, Voice | null>())
  const latest = useRef({ inst, onPlay })
  useEffect(() => {
    latest.current = { inst, onPlay }
  })

  const midis = Array.from({ length: size.to - size.from + 1 }, (_, i) => size.from + i)
  const whites = midis.filter((m) => !isBlack(m))
  const letters = keyLabels(size.octaves)

  const down = (midi: number): void => {
    if (voices.current.has(midi)) return
    voices.current.set(midi, startVoice(latest.current.inst, freqOfMidi(midi), undefined, 0.8))
    setPressed((p) => [...p, midi])
    latest.current.onPlay?.(midi)
  }
  const up = (midi: number): void => {
    if (!voices.current.has(midi)) return
    voices.current.get(midi)?.release()
    voices.current.delete(midi)
    setPressed((p) => p.filter((m) => m !== midi))
  }

  // Teclado de la computadora
  useEffect(() => {
    const map = keyMap(size.octaves)
    const on = (e: KeyboardEvent): void => {
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag) || e.ctrlKey || e.metaKey || e.altKey) return
      const midi = map[e.code]
      if (midi === undefined) return
      e.preventDefault()
      if (!e.repeat) down(midi)
    }
    const off = (e: KeyboardEvent): void => {
      const midi = map[e.code]
      if (midi !== undefined) up(midi)
    }
    const releaseAll = (): void => [...voices.current.keys()].forEach(up)
    window.addEventListener('keydown', on)
    window.addEventListener('keyup', off)
    window.addEventListener('blur', releaseAll)
    return () => {
      window.removeEventListener('keydown', on)
      window.removeEventListener('keyup', off)
      window.removeEventListener('blur', releaseAll)
      releaseAll()
    }
  }, [size.octaves])

  const labelOf = (midi: number): string | null =>
    labels === 'notes'
      ? pitchName(pitchOfMidi(midi))
      : labels === 'keys'
        ? (letters[midi] ?? null)
        : null

  const props = (
    midi: number
  ): React.HTMLAttributes<HTMLButtonElement> & { 'data-midi': number } => ({
    'data-midi': midi,
    onPointerDown: (e) => {
      e.preventDefault()
      ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
      down(midi)
    },
    onPointerEnter: (e) => {
      if (e.buttons & 1) down(midi)
    },
    onPointerUp: () => up(midi),
    onPointerLeave: () => up(midi),
    onPointerCancel: () => up(midi)
  })

  const state = (midi: number): string =>
    [
      pressed.includes(midi) ? 'down' : '',
      target === midi ? 'target' : '',
      lit.includes(midi) ? 'lit' : '',
      flash?.midi === midi ? (flash.ok ? 'hit' : 'miss') : ''
    ].join(' ')

  const bw = 62 / whites.length

  return (
    <div
      className={`mp-keyboard ${size.octaves === 1 ? 'one' : 'two'}`}
      role="group"
      aria-label="Teclado de piano"
    >
      {whites.map((midi) => (
        <button
          key={`${midi}-${flash?.midi === midi ? flash.n : ''}`}
          tabIndex={-1}
          className={`mp-white ${state(midi)}`}
          aria-label={pitchName(pitchOfMidi(midi))}
          {...props(midi)}
        >
          <span className="mp-label">{labelOf(midi)}</span>
        </button>
      ))}
      {midis.filter(isBlack).map((midi) => {
        const left = whites.filter((w) => w < midi).length // blancas a la izquierda
        return (
          <button
            key={`${midi}-${flash?.midi === midi ? flash.n : ''}`}
            tabIndex={-1}
            className={`mp-black ${state(midi)}`}
            style={{ left: `${(left / whites.length) * 100 - bw / 2}%`, width: `${bw}%` }}
            aria-label={pitchName(pitchOfMidi(midi))}
            {...props(midi)}
          >
            <span className="mp-label">{labelOf(midi)}</span>
          </button>
        )
      })}
    </div>
  )
}
