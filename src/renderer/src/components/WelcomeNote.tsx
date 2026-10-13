import { useEffect, useRef } from 'react'
import { AUTHOR, REPO_URL } from '../../../shared/about'
import adrian from '../assets/adrian.jpg'
import { usePersistentState } from '../lib/usePersistentState'

/**
 * Nota de bienvenida: se muestra una sola vez, la primera vez que se abre la app.
 * Explica qué es, dónde encontrar el contacto y cómo apoyar el proyecto.
 */
export default function WelcomeNote(): React.JSX.Element | null {
  const [seen, setSeen] = usePersistentState('welcome-seen-2', false)
  const button = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!seen) button.current?.focus()
  }, [seen])

  useEffect(() => {
    if (seen) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setSeen(true)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [seen, setSeen])

  if (seen) return null

  return (
    <div
      className="welcome-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-title"
    >
      <div className="welcome-card">
        <h1 id="welcome-title">¡Bienvenida, bienvenido! 👋</h1>

        <p className="welcome-lead">
          Herramientas y más de 30 juegos para tu clase. Sin internet y sin anuncios.
        </p>

        <div className="welcome-important" role="note">
          <p className="welcome-important-title">⚠️ MUY IMPORTANTE</p>
          <p>
            Educando es <b>totalmente GRATUITO y NO se vende</b>. Solo se aceptan donaciones{' '}
            <b>100 % voluntarias</b>.
          </p>
          <p>
            Si alguien te lo está vendiendo, por favor avísame:{' '}
            <b className="selectable">{AUTHOR.phone}</b>
          </p>
        </div>

        <div className="welcome-author">
          <img className="avatar" src={adrian} width={72} height={72} alt={AUTHOR.name} />
          <div>
            <p>
              Desarrollado por <b>{AUTHOR.name}</b>
            </p>
            <p className="welcome-contact selectable">📞 {AUTHOR.phone}</p>
            <p className="welcome-contact selectable">✉️ {AUTHOR.email}</p>
          </div>
        </div>

        <p>
          💜 ¿Te sirve? Puedes apoyarla por SINPE Móvil:{' '}
          <b className="selectable">{AUTHOR.sinpe}</b>
        </p>
        <p className="muted">Si necesitas una app a la medida, escríbeme.</p>
        <p className="welcome-where">
          💻 Código abierto:{' '}
          <a href={REPO_URL} target="_blank" rel="noreferrer">
            {REPO_URL.replace('https://', '')}
          </a>
        </p>
        <p className="welcome-where">Todo esto está en «💜 Acerca de», en el inicio.</p>
        <p className="welcome-where">
          ¿Te pierdes entre tantas cosas? Toca «❓ Ayuda» en el inicio: te dice cómo hacer cada una.
        </p>

        <button ref={button} className="btn big" onClick={() => setSeen(true)}>
          ¡Empezar!
        </button>
      </div>
    </div>
  )
}
