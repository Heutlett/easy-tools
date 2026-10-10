import './style.css'

/** Una fila de la pantalla de preparar el juego: nombre a la izquierda, opciones a la derecha */
export function SetupRow({
  label,
  children
}: {
  label: string
  children: React.ReactNode
}): React.JSX.Element {
  return (
    <div className="ad-row">
      <span className="ad-label">{label}</span>
      <div className="ad-row-body">{children}</div>
    </div>
  )
}

/** Opciones para escoger una (botones tipo píldora) */
export function Chips<T extends string | number>({
  options,
  value,
  onChange,
  label
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (v: T) => void
  label: string
}): React.JSX.Element {
  return (
    <div className="pills" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          className={`pill ${o.value === value ? 'selected' : ''}`}
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export interface DeckInfo {
  id: string
  title: string
  icon: string
  /** Cuántas palabras o fichas tiene con el grado elegido */
  count: number
}

/** Cuadrícula de mazos para marcar varios. `custom` agrega «Mi mazo» al final. */
export function DeckGrid({
  decks,
  selected,
  onChange,
  custom
}: {
  decks: DeckInfo[]
  selected: string[]
  onChange: (ids: string[]) => void
  custom?: { count: number; selected: boolean; onToggle: () => void; onEdit: () => void }
}): React.JSX.Element {
  const toggle = (id: string): void =>
    onChange(selected.includes(id) ? selected.filter((x) => x !== id) : [...selected, id])
  const all = decks.filter((d) => d.count > 0).map((d) => d.id)
  return (
    <div className="ad-decks-wrap">
      <div className="row start">
        <button className="btn small secondary" onClick={() => onChange(all)}>
          Todos
        </button>
        <button className="btn small secondary" onClick={() => onChange([])}>
          Ninguno
        </button>
      </div>
      <div className="ad-decks">
        {decks.map((d) => {
          const on = selected.includes(d.id) && d.count > 0
          return (
            <button
              key={d.id}
              className={`ad-deck ${on ? 'on' : ''}`}
              aria-pressed={on}
              disabled={d.count === 0}
              onClick={() => toggle(d.id)}
            >
              <span className="ad-deck-icon" aria-hidden>
                {d.icon}
              </span>
              <span className="ad-deck-title">{d.title}</span>
              <span className="ad-deck-count">{d.count}</span>
            </button>
          )
        })}
        {custom && (
          <div className={`ad-deck ad-deck-custom ${custom.selected ? 'on' : ''}`}>
            <button
              className="ad-deck-main"
              aria-pressed={custom.selected}
              onClick={custom.onToggle}
            >
              <span className="ad-deck-icon" aria-hidden>
                ✏️
              </span>
              <span className="ad-deck-title">Mi mazo</span>
              <span className="ad-deck-count">{custom.count}</span>
            </button>
            <button className="btn small secondary" onClick={custom.onEdit}>
              Editar
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
