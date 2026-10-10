const STEPS = [
  {
    icon: '1️⃣',
    title: 'Elige las preguntas',
    text: 'Por grado y materia, o marcas tú las que quieras.'
  },
  {
    icon: '2️⃣',
    title: 'Elige quién juega',
    text: 'Toda la clase junta, o equipos que van pasando.'
  },
  {
    icon: '3️⃣',
    title: 'Se contesta con A, B, C o D',
    text: 'Se toca una respuesta y se confirma con «Respuesta final».'
  },
  {
    icon: '4️⃣',
    title: 'Hay ayudas',
    text: '3 comodines y niveles seguros: si se falla, se conserva el último.'
  }
]

/** Guía de inicio, corta y que se puede ocultar para siempre */
export default function Guide({ onHide }: { onHide: () => void }): React.JSX.Element {
  return (
    <section className="mi-guide" aria-label="Cómo se juega">
      <div className="mi-guide-head">
        <h2>👋 ¿Cómo se juega?</h2>
        <button className="btn secondary small" onClick={onHide}>
          Entendido, ocultar
        </button>
      </div>
      <ol className="mi-guide-steps">
        {STEPS.map((s) => (
          <li key={s.title}>
            <span className="mi-guide-icon" aria-hidden>
              {s.icon}
            </span>
            <b>{s.title}</b>
            <span>{s.text}</span>
          </li>
        ))}
      </ol>
      <p className="muted">
        Esta guía se puede volver a abrir con el botón «❓ Cómo se juega», arriba a la derecha.
      </p>
    </section>
  )
}
