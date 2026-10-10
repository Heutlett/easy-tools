interface BarsProps {
  labels: string[]
  counts: number[]
  /** Cuántas veces se esperaría que saliera cada una si el azar fuera perfecto */
  expected: number[]
  colors?: string[]
}

/** Gráfico de barras: cuántas veces salió cada cara; la rayita marca lo esperado */
export function Bars({ labels, counts, expected, colors }: BarsProps): React.JSX.Element {
  const total = counts.reduce((a, b) => a + b, 0)
  const top = Math.max(1, ...counts, ...expected)
  return (
    <div
      className={`da-bars ${labels.length > 9 ? 'dense' : ''}`}
      role="list"
      aria-label="Cuántas veces salió cada una"
    >
      {labels.map((label, i) => (
        <div key={i} className="da-bar-col" role="listitem" title={`${label}: ${counts[i]}`}>
          <span className="da-bar-count">{counts[i]}</span>
          <div className="da-bar-track">
            <div
              className="da-bar"
              style={{
                height: `${(counts[i] / top) * 100}%`,
                background: colors?.[i] ?? 'var(--accent)'
              }}
            />
            {total > 0 && (
              <div className="da-bar-exp" style={{ bottom: `${(expected[i] / top) * 100}%` }} />
            )}
          </div>
          <span className="da-bar-pct">
            {total > 0 ? `${Math.round((counts[i] / total) * 100)} %` : ''}
          </span>
          <span className="da-bar-label">{label}</span>
        </div>
      ))}
    </div>
  )
}

export interface Chip {
  id: number
  text: string
  /** Colores de fondo de los puntos (dado de colores) */
  dots?: string[]
  by?: string
}

/** Últimos resultados, el más reciente primero */
export function History({ chips }: { chips: Chip[] }): React.JSX.Element {
  if (chips.length === 0) return <p className="muted da-empty">Aquí aparecerán los resultados</p>
  return (
    <ol className="da-history" aria-label="Historial de resultados">
      {chips.map((c, i) => (
        <li key={c.id} className={i === 0 ? 'latest' : ''}>
          {c.by && <span aria-hidden>{c.by} </span>}
          {c.dots?.map((d, k) => (
            <span key={k} className="da-dot" style={{ background: d }} aria-hidden />
          ))}
          {c.text}
        </li>
      ))}
    </ol>
  )
}
