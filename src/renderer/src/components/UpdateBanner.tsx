import { useState } from 'react'
import { useUpdate } from '../lib/useUpdate'

/** Franja arriba de la app que avisa de una versión nueva y deja actualizar con un clic. */
export default function UpdateBanner(): React.JSX.Element | null {
  const { status, download, install } = useUpdate()
  const [dismissed, setDismissed] = useState(false)

  if (status.state === 'available' && !dismissed)
    return (
      <div className="update-banner" role="status">
        <span>
          🎉 <strong>Hay una versión nueva de Easy Tools</strong> ({status.version}).
        </span>
        <span className="update-actions">
          <button className="btn small" onClick={download}>
            Actualizar ahora
          </button>
          <button className="btn secondary small" onClick={() => setDismissed(true)}>
            Más tarde
          </button>
        </span>
      </div>
    )

  if (status.state === 'downloading')
    return (
      <div className="update-banner" role="status">
        <span>Descargando la actualización… {status.percent ?? 0} %</span>
        <div className="bar update-bar">
          <div className="bar-fill" style={{ width: `${status.percent ?? 0}%` }} />
        </div>
      </div>
    )

  if (status.state === 'ready')
    return (
      <div className="update-banner ready" role="status">
        <span>
          ✅ <strong>La actualización está lista.</strong> Se instala al reiniciar la app.
        </span>
        <button className="btn small" onClick={install}>
          Reiniciar y actualizar
        </button>
      </div>
    )

  return null
}
