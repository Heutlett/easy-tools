export interface ActivityInfo {
  id: string
  icon: string
  title: string
  desc: string
  /** Texto pequeño (por ejemplo «Se ve en 6.º») */
  note?: string
}

export function ActivityCards({
  items,
  value,
  onChange
}: {
  items: ActivityInfo[]
  value: string
  onChange: (id: string) => void
}): React.JSX.Element {
  return (
    <div className="mp-cards" role="group" aria-label="Actividad">
      {items.map((a) => (
        <button
          key={a.id}
          className={`mp-card ${value === a.id ? 'selected' : ''}`}
          aria-pressed={value === a.id}
          onClick={() => onChange(a.id)}
        >
          <span className="mp-card-icon" aria-hidden>
            {a.icon}
          </span>
          <span className="mp-card-text">
            <span className="mp-card-title">{a.title}</span>
            <span className="mp-card-desc">{a.desc}</span>
            {a.note && <span className="mp-card-note">{a.note}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}

export function PillRow<T extends string | number>({
  label,
  items,
  value,
  onChange
}: {
  label: string
  items: { id: T; label: string; title?: string }[]
  value: T
  onChange: (id: T) => void
}): React.JSX.Element {
  return (
    <div className="mp-prow">
      <span className="mp-prow-label">{label}</span>
      <div className="pills" role="group" aria-label={label}>
        {items.map((it) => (
          <button
            key={String(it.id)}
            className={`pill ${value === it.id ? 'selected' : ''}`}
            aria-pressed={value === it.id}
            title={it.title}
            onClick={() => onChange(it.id)}
          >
            {it.label}
          </button>
        ))}
      </div>
    </div>
  )
}
