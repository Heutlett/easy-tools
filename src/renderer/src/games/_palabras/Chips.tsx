import './palabras.css'

interface Option<T> {
  value: T
  label: string
}

/** Una fila «Etiqueta: [opción] [opción]…» para elegir una opción (cantidad de palabras, tiempo…) */
export default function ChipRow<T extends string | number>({
  label,
  value,
  options,
  onChange
}: {
  label: string
  value: T
  options: Option<T>[]
  onChange: (value: T) => void
}): React.JSX.Element {
  return (
    <div className="bank-filter-row">
      <span className="bank-filter-label">{label}</span>
      <div className="pills" role="group" aria-label={label}>
        {options.map((o) => (
          <button
            key={String(o.value)}
            className={`pill ${o.value === value ? 'selected' : ''}`}
            aria-pressed={o.value === value}
            onClick={() => onChange(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  )
}
