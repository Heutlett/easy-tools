import { Glyph, NoteGlyph } from './Staff'
import { CELL_BEATS, FIGURES, type FigureId, type OnsetMark, type Pattern } from './figures'

const S = 20

/** Dibujo de una figura o silencio sobre un pentagrama corto (cabe en una tarjeta) */
export function FigureGlyph({
  id,
  className,
  bare
}: {
  id: FigureId
  className?: string
  /** Sin líneas del pentagrama (solo el símbolo) */
  bare?: boolean
}): React.JSX.Element {
  const f = FIGURES[id]
  const w = 6.4 * S
  const h = 5.8 * S
  const top = 2 * S
  const line = (i: number): number => top + i * S
  const cx = w / 2 - 0.3 * S
  let content: React.JSX.Element
  if (f.rest) {
    const spec = {
      sRedonda: { name: 'restWhole', y: line(1) + 0.25 * S },
      sBlanca: { name: 'restHalf', y: line(2) - 0.25 * S },
      sNegra: { name: 'restQuarter', y: line(2) },
      sCorchea: { name: 'restEighth', y: line(2) },
      sSemicorchea: { name: 'rest16', y: line(2) }
    }[id as 'sRedonda'] as { name: 'restWhole'; y: number }
    content = <Glyph name={spec.name} x={cx} y={spec.y} box />
  } else {
    const name = (
      {
        redonda: 'whole',
        blanca: 'half',
        blancaP: 'half',
        negra: 'quarter',
        negraP: 'quarter',
        corchea: 'eighth',
        semicorchea: 'sixteenth'
      } as const
    )[id as 'redonda']
    // Cabeza sobre la segunda línea (Sol), con el palito hacia arriba
    const cy = line(3)
    content = (
      <>
        <NoteGlyph name={name} cx={cx} cy={cy} />
        {(id === 'blancaP' || id === 'negraP') && (
          <circle cx={cx + 1.1 * S} cy={cy - 0.5 * S} r={0.22 * S} />
        )}
      </>
    )
  }
  return (
    <svg
      className={`mus-figure ${className ?? ''}`}
      viewBox={`0 ${1.1 * S} ${w} ${h}`}
      role="img"
      aria-label={f.name}
      style={{ color: 'var(--text)' }}
    >
      {!bare &&
        [0, 1, 2, 3, 4].map((i) => (
          <line
            key={i}
            x1={0.3 * S}
            x2={w - 0.3 * S}
            y1={line(i)}
            y2={line(i)}
            stroke="currentColor"
            strokeWidth={1.4}
          />
        ))}
      <g fill="currentColor">{content}</g>
    </svg>
  )
}

const BEAT_W = 5.2 * S
const PAD = 1.4 * S
const MARK_COLOR = {
  great: 'var(--success)',
  ok: '#d97706',
  miss: 'var(--danger)'
}

/** x de cada compás y utilidad para pasar de tiempos a posición */
function layout(pattern: Pattern, sigW: number): { barX: number[]; width: number } {
  const barX: number[] = []
  let x = sigW
  for (const bar of pattern) {
    barX.push(x + PAD)
    x += PAD * 2 + bar.reduce((s, c) => s + CELL_BEATS[c], 0) * BEAT_W
  }
  return { barX, width: x + 0.3 * S }
}

/**
 * Renglón rítmico: compases con las figuras y los silencios de un patrón.
 * `cursor` (tiempo) dibuja una barra que avanza; `marks` pinta cada sonido según el resultado;
 * `active` resalta el sonido que se está oyendo.
 */
export function RhythmStaff({
  pattern,
  timeSig,
  cursor,
  marks,
  active
}: {
  pattern: Pattern
  timeSig: [number, number]
  cursor?: number | null
  marks?: OnsetMark[]
  active?: number
}): React.JSX.Element {
  const sigW = 3.4 * S
  const { barX, width } = layout(pattern, sigW)
  const lineY = 3.6 * S
  const height = 7.2 * S
  const stemTop = lineY - 3.23 * S
  let onsetIndex = 0

  const colorOf = (i: number): string =>
    marks?.[i] ? MARK_COLOR[marks[i]] : active === i ? 'var(--accent)' : 'currentColor'

  const xOfBeat = (beat: number): number => {
    let acc = 0
    for (let b = 0; b < pattern.length; b++) {
      const len = pattern[b].reduce((s, c) => s + CELL_BEATS[c], 0)
      if (beat <= acc + len || b === pattern.length - 1) return barX[b] + (beat - acc) * BEAT_W
      acc += len
    }
    return sigW
  }

  const cells: React.JSX.Element[] = []
  pattern.forEach((bar, b) => {
    let beat = 0
    bar.forEach((cell, c) => {
      const x = barX[b] + beat * BEAT_W
      const cx = x + 0.45 * S
      const key = `${b}-${c}`
      if (cell === 'q' || cell === 'h' || cell === 'w') {
        const i = onsetIndex++
        cells.push(
          <g key={key} fill={colorOf(i)}>
            <NoteGlyph
              name={cell === 'q' ? 'quarter' : cell === 'h' ? 'half' : 'whole'}
              cx={cx}
              cy={lineY}
            />
          </g>
        )
      } else if (cell === 'ee') {
        const i1 = onsetIndex++
        const i2 = onsetIndex++
        const x2 = x + 0.5 * BEAT_W + 0.45 * S
        cells.push(
          <g key={key}>
            <g fill={colorOf(i1)}>
              <NoteGlyph name="quarter" cx={cx} cy={lineY} />
            </g>
            <g fill={colorOf(i2)}>
              <NoteGlyph name="quarter" cx={x2} cy={lineY} />
            </g>
            <polygon
              points={`${cx + 0.42 * S},${stemTop} ${x2 + 0.62 * S},${stemTop} ${x2 + 0.62 * S},${stemTop + 0.55 * S} ${cx + 0.42 * S},${stemTop + 0.55 * S}`}
              fill="currentColor"
            />
          </g>
        )
      } else {
        const name = cell === 'qr' ? 'restQuarter' : 'restHalf'
        cells.push(
          <g key={key} fill="currentColor">
            {cell === 'qr' ? (
              <Glyph name="restQuarter" x={cx} y={lineY} box />
            ) : (
              <Glyph name={name} x={cx} y={lineY - 0.25 * S} box />
            )}
          </g>
        )
      }
      beat += CELL_BEATS[cell]
    })
  })

  return (
    <svg
      className="mus-rhythm"
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label="Patrón rítmico"
      style={{ color: 'var(--text)' }}
    >
      <line
        x1={0.2 * S}
        x2={width - 0.2 * S}
        y1={lineY}
        y2={lineY}
        stroke="currentColor"
        strokeWidth={1.6}
      />
      <text
        x={0.6 * S}
        y={lineY - 0.2 * S}
        fontSize={2.3 * S}
        fontWeight={800}
        fontFamily="Georgia, 'Times New Roman', serif"
        style={{ fill: 'currentColor' }}
      >
        {timeSig[0]}
      </text>
      <text
        x={0.6 * S}
        y={lineY + 2 * S}
        fontSize={2.3 * S}
        fontWeight={800}
        fontFamily="Georgia, 'Times New Roman', serif"
        style={{ fill: 'currentColor' }}
      >
        {timeSig[1]}
      </text>
      {barX.map((x, b) => {
        const end = x + pattern[b].reduce((s, c) => s + CELL_BEATS[c], 0) * BEAT_W + PAD
        const last = b === barX.length - 1
        return (
          <g key={b} stroke="currentColor">
            <line
              x1={end}
              x2={end}
              y1={lineY - 1.6 * S}
              y2={lineY + 1.6 * S}
              strokeWidth={last ? 1.6 : 1.4}
            />
            {last && (
              <line
                x1={end - 0.4 * S}
                x2={end - 0.4 * S}
                y1={lineY - 1.6 * S}
                y2={lineY + 1.6 * S}
                strokeWidth={1.4}
              />
            )}
          </g>
        )
      })}
      {cells}
      {cursor != null && cursor >= 0 && (
        <rect
          className="mus-cursor"
          x={xOfBeat(cursor) - 0.1 * S}
          y={lineY - 2.9 * S}
          width={0.2 * S}
          height={5.8 * S}
          rx={0.1 * S}
        />
      )}
    </svg>
  )
}
