import { useId } from 'react'

/** Cuántos fallos aguanta el helado antes de derretirse del todo */
export const MAX_ERRORS = 7

/** Cuánto se ha derretido cada bola (de arriba hacia abajo: la de abajo es la última) según los fallos */
const MELT: [number, number, number][] = [
  // [bola de arriba, bola del medio, bola de abajo]
  [0, 0, 0],
  [0.3, 0, 0],
  [0.7, 0, 0],
  [1, 0.3, 0],
  [1, 0.7, 0],
  [1, 1, 0.35],
  [1, 1, 0.7],
  [1, 1, 1]
]

// De abajo hacia arriba
const SCOOPS = [
  { color: '#7fe0bd', shade: '#55c29b', rx: 50, h: 56 },
  { color: '#ff9ec4', shade: '#ee79a6', rx: 45, h: 54 },
  { color: '#fff0c2', shade: '#f0d98f', rx: 40, h: 50 }
]
const DRIPS = [
  { at: -0.55, size: 0.75 },
  { at: 0.05, size: 1 },
  { at: 0.6, size: 0.6 }
]

/**
 * Un helado de tres bolas que se va derritiendo con cada fallo (en vez del ahorcado de siempre).
 * `errors` va de 0 a MAX_ERRORS.
 */
export default function IceCream({ errors }: { errors: number }): React.JSX.Element {
  const clip = useId()
  const e = Math.max(0, Math.min(MAX_ERRORS, Math.round(errors)))
  const melt = MELT[e]
  // Bolas de abajo hacia arriba: [abajo, medio, arriba] = melt[2], melt[1], melt[0]
  const meltFor = [melt[2], melt[1], melt[0]]
  const placed: ((typeof SCOOPS)[number] & { y: number; height: number; melt: number })[] = []
  for (let i = 0; i < SCOOPS.length; i++) {
    const prev = placed[i - 1]
    const y = prev ? prev.y - prev.height * 0.55 : 150
    placed.push({
      ...SCOOPS[i],
      y,
      height: SCOOPS[i].h * (1 - 0.82 * meltFor[i]),
      melt: meltFor[i]
    })
  }
  const top = placed[2]
  const mouth =
    e >= 6
      ? 'M108 212 Q120 200 132 212'
      : e >= 3
        ? 'M110 207 L130 207'
        : 'M108 203 Q120 216 132 203'
  const puddle = e === 0 ? 0 : 0.25 + (e / MAX_ERRORS) * 0.75

  return (
    <svg className="ah-svg" viewBox="22 4 196 284" role="img" aria-label="Un helado que se derrite">
      <defs>
        <clipPath id={clip}>
          <polygon points="78,150 162,150 120,266" />
        </clipPath>
      </defs>
      <g
        className="ah-melt"
        style={{ transform: `translate(120px, 274px) scale(${puddle}, 1)` }}
        opacity="0.85"
      >
        <ellipse rx="96" ry="12" fill="#ffc2da" />
        <ellipse rx="60" ry="8" fill="#fff0c2" cx="-20" cy="-1" />
        <ellipse rx="40" ry="6" fill="#7fe0bd" cx="36" cy="1" />
      </g>
      <polygon points="78,150 162,150 120,266" fill="#e9b872" />
      <g clipPath={`url(#${clip})`} stroke="#c98f45" strokeWidth="3" opacity="0.7">
        {[-40, -10, 20, 50, 80].map((x) => (
          <g key={x}>
            <line x1={78 + x} y1="150" x2={x + 150} y2="290" />
            <line x1={170 + x} y1="150" x2={x - 20} y2="290" />
          </g>
        ))}
      </g>
      <polygon
        points="78,150 162,150 120,266"
        fill="none"
        stroke="#c98f45"
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <g fill="#5b3a1a" stroke="#5b3a1a">
        <circle cx="108" cy="190" r="3.5" stroke="none" />
        <circle cx="132" cy="190" r="3.5" stroke="none" />
        <path d={mouth} fill="none" strokeWidth="3" strokeLinecap="round" />
      </g>
      {placed.map((s, i) => (
        <g key={i} className="ah-scoop" style={{ transform: `translate(120px, ${s.y}px)` }}>
          {DRIPS.map((d, j) => (
            <rect
              key={j}
              className="ah-drip"
              x={d.at * s.rx - 6}
              y="0"
              width="12"
              height="40"
              rx="6"
              fill={s.color}
              style={{ transform: `scaleY(${s.melt * d.size})` }}
            />
          ))}
          <g className="ah-dome" style={{ transform: `scaleY(${1 - 0.82 * s.melt})` }}>
            <path
              d={`M${-s.rx} 0 C${-s.rx} ${-s.h * 1.33} ${s.rx} ${-s.h * 1.33} ${s.rx} 0 Z`}
              fill={s.color}
            />
            <ellipse cx={-s.rx * 0.4} cy={-s.h * 0.62} rx="9" ry="5" fill="#fff" opacity="0.55" />
          </g>
          <ellipse cx="0" cy="0" rx={s.rx + 5} ry="9" fill={s.shade} />
        </g>
      ))}
      <g
        className="ah-cherry"
        style={{
          transform:
            e === 0 ? `translate(120px, ${top.y - top.height - 2}px)` : 'translate(176px, 266px)'
        }}
      >
        <path
          d="M0 -6 Q4 -22 14 -26"
          stroke="#4d7c0f"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <circle r="11" fill="#e11d48" />
        <ellipse cx="-4" cy="-4" rx="3" ry="2" fill="#fff" opacity="0.6" />
      </g>
    </svg>
  )
}
