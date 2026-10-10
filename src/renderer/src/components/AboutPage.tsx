import { useEffect, useState } from 'react'
import adrian from '../assets/adrian.jpg'
import logo from '../assets/logo.svg'
import { AUTHOR, REPO_URL } from '../../../shared/about'
import { useUpdate } from '../lib/useUpdate'
import CopyButton from './CopyButton'

/** "Acerca de": versión, quién hizo la app y cómo apoyarla. */
export default function AboutPage({ onBack }: { onBack: () => void }): React.JSX.Element {
  const [version, setVersion] = useState('')
  const { status, check, download, install } = useUpdate()

  useEffect(() => {
    window.api.appVersion().then(setVersion)
  }, [])

  return (
    <div className="tool-page" style={{ '--accent': '#c026d3' } as React.CSSProperties}>
      <header className="tool-header">
        <button className="btn secondary" onClick={onBack}>
          ← Volver al inicio
        </button>
        <div className="tool-heading">
          <img className="app-logo small" src={logo} alt="" />
          <div>
            <h1>Acerca de Easy Tools</h1>
            <p className="muted">Versión {version}</p>
          </div>
        </div>
      </header>

      <main className="tool-body">
        <section className="panel no-ads">
          <span className="no-ads-icon" aria-hidden>
            🚫
          </span>
          <div>
            <h2 className="no-ads-title">Sin anuncios</h2>
            <p className="muted">Ni uno. Solo tú y tus herramientas.</p>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Actualizaciones</h2>
          <div className="row start">
            {status.state === 'available' ? (
              <button className="btn" onClick={download}>
                Actualizar a la versión {status.version}
              </button>
            ) : status.state === 'ready' ? (
              <button className="btn" onClick={install}>
                Reiniciar y actualizar
              </button>
            ) : (
              <button
                className="btn secondary"
                disabled={status.state === 'checking' || status.state === 'downloading'}
                onClick={check}
              >
                Buscar actualizaciones
              </button>
            )}
            <span className="muted">
              {status.state === 'checking' && 'Buscando…'}
              {status.state === 'none' && '✅ Ya tienes la última versión.'}
              {status.state === 'available' && `Hay una versión nueva (${status.version}).`}
              {status.state === 'downloading' && `Descargando… ${status.percent ?? 0} %`}
              {status.state === 'ready' && 'Lista para instalar.'}
              {(status.state === 'error' || status.state === 'unavailable') && status.message}
            </span>
          </div>
        </section>

        <section className="panel">
          <h2 className="panel-title">Quién la hizo</h2>
          <div className="contact">
            <img className="avatar" src={adrian} width={88} height={88} alt={AUTHOR.name} />
            <div className="contact-info">
              <strong className="contact-name selectable">{AUTHOR.name}</strong>
              <div className="row start">
                <span className="selectable">📞 {AUTHOR.phone}</span>
                <CopyButton text={AUTHOR.phoneDigits} label="Copiar" />
              </div>
              <div className="row start">
                <span className="selectable">✉️ {AUTHOR.email}</span>
                <CopyButton text={AUTHOR.email} label="Copiar" />
              </div>
            </div>
          </div>
        </section>

        <section className="panel donation">
          <h2 className="panel-title">Apoyar el proyecto</h2>
          <p>
            Si Easy Tools te resulta útil, puedes apoyar su desarrollo con un aporte voluntario por
            SINPE Móvil. ¡Gracias!
          </p>
          <div className="row start">
            <span className="donation-number selectable">SINPE Móvil: {AUTHOR.sinpe}</span>
            <CopyButton text={AUTHOR.sinpeDigits} label="Copiar número" />
          </div>
          <p className="muted">A nombre de {AUTHOR.name}.</p>
        </section>

        <section className="panel">
          <h2 className="panel-title">Para desarrolladores</h2>
          <p>
            Easy Tools es de código abierto. Puedes ver el código, reportar errores o proponer
            mejoras en GitHub.
          </p>
          <div className="row start">
            <a className="repo-link selectable" href={REPO_URL} target="_blank" rel="noreferrer">
              {REPO_URL.replace('https://', '')}
            </a>
            <CopyButton text={REPO_URL} label="Copiar enlace" />
          </div>
        </section>
      </main>
    </div>
  )
}
