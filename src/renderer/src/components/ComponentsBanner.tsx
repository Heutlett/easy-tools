import { useEffect } from 'react'
import { COMPONENTS } from '../../../shared/components'
import { overallPercent, totalMB, useComponents } from '../lib/useComponents'

/** Para que se baje solo una vez por apertura de la app (si se cancela, se vuelve a intentar la próxima vez) */
let autoTried = false

/**
 * Aviso de la pantalla de inicio: las piezas grandes (video, YouTube, quitar fondos y voces) se bajan solas al abrir la app, y aquí se ve el
 * avance. Se puede cancelar y reintentar. El resto de la app funciona sin ellas.
 */
export default function ComponentsBanner(): React.JSX.Element | null {
  const c = useComponents()

  const missing = c.installed ? COMPONENTS.filter((d) => !c.installed?.[d.id]).map((d) => d.id) : []
  const hasMissing = missing.length > 0

  useEffect(() => {
    if (!c.installed || !hasMissing || autoTried) return
    autoTried = true
    void window.api.components.options().then((o) => {
      if (o.autoDownload) void c.install(missing)
    })
    // Solo la primera vez que se sabe qué falta
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [c.installed, hasMissing])

  // Si en esta sesión se bajó algo y ya no falta nada, se avisa que quedó listo
  const finished = Object.values(c.progress).some((p) => p?.state === 'done')

  if (!c.installed) return null
  if (finished && missing.length === 0)
    return <p className="notice components-banner">✅ ¡Listo! Ya está todo descargado.</p>
  if (missing.length === 0) return null

  // Cuentan también las que se acaban de bajar, para que la barra nunca retroceda
  const involved = COMPONENTS.filter((d) => missing.includes(d.id) || c.progress[d.id]).map(
    (d) => d.id
  )
  const average = overallPercent(c, involved)
  const error = missing.map((id) => c.progress[id]).find((p) => p?.state === 'error')

  return (
    <section className="components-banner panel" aria-live="polite">
      <div>
        <b>
          ⬇️ {c.busy ? 'Descargando' : 'Falta descargar'} unas piezas ({totalMB(missing)} MB)
        </b>
        <p className="muted">
          Sirven para recortar y unir videos, bajar de YouTube, quitar fondos y que los juegos lean
          en voz alta. Se descargan solas, una sola vez, y necesitas internet. El resto de la app
          funciona sin ellas.
        </p>
        {c.busy && (
          <>
            <div className="gate-bar" role="progressbar" aria-valuenow={average}>
              <span style={{ width: `${average}%` }} />
            </div>
            <p className="muted">Descargando… {average} %</p>
          </>
        )}
        {!c.busy && error?.message && <p className="notice error">{error.message}</p>}
      </div>
      <div className="row start">
        {c.busy ? (
          <button className="btn secondary small" onClick={() => c.cancel(missing)}>
            Cancelar
          </button>
        ) : (
          <button className="btn" onClick={() => void c.install(missing)}>
            {error ? 'Reintentar' : 'Descargar ahora'}
          </button>
        )}
      </div>
    </section>
  )
}
