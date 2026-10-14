const STEPS = [
  {
    n: 1,
    color: '#e8644a',
    title: 'Elige las preguntas',
    text: 'Por grado y materia, o marcas tú las que quieras.'
  },
  {
    n: 2,
    color: '#8a63d2',
    title: 'Elige quién juega',
    text: 'Toda la clase junta, o equipos que van pasando.'
  },
  {
    n: 3,
    color: '#3b8fd9',
    title: 'Se contesta con A, B, C o D',
    text: 'Se toca una respuesta y se confirma con «Respuesta final».'
  },
  {
    n: 4,
    color: '#4fae6a',
    title: 'Hay ayudas',
    text: '3 comodines y niveles seguros: si se falla, se conserva el último.'
  }
]

/** Cómo se juega, en una ventana sobre la pantalla (se vuelve a abrir con «¿Cómo se juega?») */
export default function Guide({ onClose }: { onClose: () => void }): React.JSX.Element {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <section
        className="modal guide-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Cómo se juega"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-head">
          <h2>👋 ¿Cómo se juega?</h2>
          <button className="btn secondary small" autoFocus onClick={onClose}>
            Entendido
          </button>
        </div>
        <ol className="guide-steps">
          {STEPS.map((s) => (
            <li key={s.n}>
              <span className="guide-n" style={{ background: s.color }}>
                {s.n}
              </span>
              <span>
                <b>{s.title}</b>
                <span>{s.text}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>
    </div>
  )
}
