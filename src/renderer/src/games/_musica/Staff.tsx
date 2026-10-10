import { GLYPHS, GLYPH_SPACE, type GlyphName } from './glyphs'
import { pitchName, type Pitch } from './notes'
import { BOTTOM_STEP, noteY, type Clef } from './staffMath'

/** Una unidad = un espacio entre líneas del pentagrama */
const S = 20
const K = S / GLYPH_SPACE

/**
 * Dibuja un símbolo. Con `box` se centra la caja del dibujo en (x, y); si no, (x, y) es el origen del símbolo
 * (para las figuras con cabeza: la parte baja de la cabeza). `turn` lo gira 180° alrededor de (x, y).
 */
export function Glyph({
  name,
  x,
  y,
  box,
  turn,
  scale = 1,
  className
}: {
  name: GlyphName
  x: number
  y: number
  box?: boolean
  turn?: boolean
  scale?: number
  className?: string
}): React.JSX.Element {
  const g = GLYPHS[name]
  const k = K * scale
  const ox = box ? x - ((g.box[0] + g.box[2]) / 2) * k : x
  const oy = box ? y + ((g.box[1] + g.box[3]) / 2) * k : y
  return (
    <path
      className={className}
      d={g.d}
      transform={`${turn ? `rotate(180 ${x} ${y}) ` : ''}translate(${ox} ${oy}) scale(${k} ${-k})`}
    />
  )
}

/** Centro horizontal de la cabeza de una figura en el símbolo (unidades de la fuente) */
const HEAD_CENTER_X = 198

/** Cabeza de nota con su palito; (cx, cy) es el centro de la cabeza */
export function NoteGlyph({
  name,
  cx,
  cy,
  scale = 1
}: {
  name: 'quarter' | 'half' | 'whole' | 'eighth' | 'sixteenth' | 'headBlack' | 'headVoid'
  cx: number
  cy: number
  scale?: number
}): React.JSX.Element {
  const k = K * scale
  return (
    <Glyph name={name} x={cx - HEAD_CENTER_X * k} y={cy + (GLYPH_SPACE / 2) * k} scale={scale} />
  )
}

export interface StaffNote {
  pitch: Pitch
  /** Estado para pintar la nota */
  mark?: 'ok' | 'bad' | 'focus'
  /** Texto bajo el pentagrama (por ejemplo el nombre de la nota) */
  label?: string
}

const MARK_COLOR = {
  ok: 'var(--success)',
  bad: 'var(--danger)',
  focus: 'var(--accent)'
}

const MARGIN = 2.7 * S
const CLEF_W = 3.6 * S

/**
 * Pentagrama con clave de sol o de fa y notas (con líneas adicionales y alteraciones).
 * Se ajusta al ancho de su contenedor.
 */
export default function Staff({
  clef = 'sol',
  notes,
  showLabels,
  minNotes = 1,
  className,
  title
}: {
  clef?: Clef
  notes: StaffNote[]
  showLabels?: boolean
  /** Ancho mínimo, en cantidad de notas */
  minNotes?: number
  className?: string
  title?: string
}): React.JSX.Element {
  const bottomStep = BOTTOM_STEP[clef]
  const topY = MARGIN
  const bottomY = topY + 4 * S
  const slot = 4 * S
  const slots = Math.max(notes.length, minNotes)
  const width = CLEF_W + slots * slot + 0.6 * S
  const height = bottomY + MARGIN + (showLabels ? 1.2 * S : 0)
  const color = 'var(--text)'

  return (
    <svg
      className={`mus-staff ${className ?? ''}`}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={title ?? 'Pentagrama'}
      style={{ color }}
    >
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1={0.2 * S}
          x2={width - 0.2 * S}
          y1={topY + i * S}
          y2={topY + i * S}
          stroke="currentColor"
          strokeWidth={1.5}
        />
      ))}
      {clef === 'sol' ? (
        <Glyph name="gclef" x={0.5 * S} y={bottomY} />
      ) : (
        <Glyph name="fclef" x={0.5 * S} y={bottomY - 0.5 * S} />
      )}
      {notes.map((n, i) => {
        const cx =
          CLEF_W +
          (i + (slots - notes.length) / 2) * slot +
          slot / 2 +
          (n.pitch.alter ? 0.5 * S : 0)
        const cy = noteY(n.pitch.step, clef, bottomY)
        const fill = n.mark ? MARK_COLOR[n.mark] : 'currentColor'
        const down = n.pitch.step >= bottomStep + 4
        const ledgers: number[] = []
        for (let s = bottomStep - 2; n.pitch.step <= s; s -= 2)
          ledgers.push(noteY(s, clef, bottomY))
        for (let s = bottomStep + 10; n.pitch.step >= s; s += 2)
          ledgers.push(noteY(s, clef, bottomY))
        return (
          <g key={i} style={{ fill, stroke: 'none' }}>
            {ledgers.map((y, j) => (
              <line
                key={j}
                x1={cx - 1.5 * S}
                x2={cx + 1.5 * S}
                y1={y}
                y2={y}
                style={{ stroke: 'currentColor' }}
                strokeWidth={1.5}
              />
            ))}
            {n.pitch.alter === 1 && <Glyph name="sharp" x={cx - 1.9 * S} y={cy} box />}
            {n.pitch.alter === -1 && <Glyph name="flat" x={cx - 1.7 * S} y={cy - 0.3 * S} box />}
            <g transform={down ? `rotate(180 ${cx} ${cy})` : undefined}>
              <NoteGlyph name="quarter" cx={cx} cy={cy} />
            </g>
            {showLabels && (
              <text
                x={cx}
                y={bottomY + MARGIN + 0.5 * S}
                textAnchor="middle"
                fontSize={0.9 * S}
                fontWeight={700}
                style={{ fill: 'currentColor' }}
              >
                {n.label ?? pitchName(n.pitch)}
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
