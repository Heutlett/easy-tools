import { useState } from 'react'
import { AUTHOR, type LicenseState } from '../../../shared/about'
import logo from '../assets/logo.svg'
import CopyButton from './CopyButton'

interface Props {
  state: LicenseState
  onActivated: () => void
}

/** Pantalla que se ve en una instalación nueva: sin clave no se puede usar la app. */
export default function ActivationScreen({ state, onActivated }: Props): React.JSX.Element {
  const [key, setKey] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const activate = async (): Promise<void> => {
    setBusy(true)
    setError('')
    try {
      await window.api.license.activate(key)
      onActivated()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo activar. Intenta de nuevo.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="activation">
      <div className="activation-card">
        <img className="app-logo big" src={logo} alt="" />
        <h1>Easy Tools necesita una clave</h1>
        <p>
          Esta aplicación es de uso privado. Para usarla, <strong>escríbeme primero</strong> y
          envíame el código de este equipo: te respondo con tu clave.
        </p>

        <div className="activation-block">
          <span className="muted">Mi correo</span>
          <div className="row start">
            <strong className="selectable">{AUTHOR.email}</strong>
            <CopyButton text={AUTHOR.email} />
          </div>
        </div>

        <div className="activation-block">
          <span className="muted">Código de este equipo (envíamelo)</span>
          <div className="row start">
            <strong className="activation-code selectable">{state.code}</strong>
            <CopyButton text={state.code} />
          </div>
        </div>

        <div className="activation-block">
          <label className="panel-title" htmlFor="license-key">
            Cuando tengas tu clave, pégala aquí
          </label>
          <textarea
            id="license-key"
            className="field activation-key"
            value={key}
            spellCheck={false}
            onChange={(e) => setKey(e.target.value)}
          />
          {error && <p className="notice error">{error}</p>}
          <div>
            <button
              className="btn big"
              disabled={busy || key.trim().length < 20}
              onClick={activate}
            >
              {busy ? 'Revisando…' : 'Activar'}
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}
