import { useState } from 'react'
import { AUTHOR, type LicenseState } from '../../../shared/about'
import logo from '../assets/logo.svg'
import whatsapp from '../assets/icons/whatsapp.svg'
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

  // El mensaje sale escrito con el código del equipo: la persona solo tiene que enviarlo.
  const whatsappUrl = `https://wa.me/${AUTHOR.phoneDigits.replace('+', '')}?text=${encodeURIComponent(
    `Hola Adrian, quiero mi clave de Easy Tools. El código de mi equipo es: ${state.code}`
  )}`

  return (
    <main className="activation">
      <div className="activation-card">
        <div className="activation-head">
          <img className="app-logo" src={logo} alt="" width={64} height={64} />
          <h1>Easy Tools necesita una clave</h1>
        </div>

        <div className="activation-block">
          <span className="panel-title">1. Pídela por WhatsApp</span>
          <a className="btn big whatsapp-btn" href={whatsappUrl} target="_blank" rel="noreferrer">
            <img src={whatsapp} width={34} height={34} alt="" />
            Escribirme por WhatsApp
          </a>
          <div className="row start">
            <span className="selectable">
              <img className="inline-icon" src={whatsapp} width={20} height={20} alt="" />{' '}
              <strong>{AUTHOR.phone}</strong>
            </span>
            <CopyButton text={AUTHOR.phone} />
          </div>
          <span className="muted">
            El mensaje ya lleva el código de este equipo. Si prefieres, escríbeme a{' '}
            <span className="selectable">{AUTHOR.email}</span>
          </span>
        </div>

        <div className="activation-block">
          <span className="muted">Código de este equipo</span>
          <div className="row start">
            <strong className="activation-code selectable">{state.code}</strong>
            <CopyButton text={state.code} />
          </div>
        </div>

        <div className="activation-block">
          <label className="panel-title" htmlFor="license-key">
            2. Pega aquí la clave que te envíe
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
