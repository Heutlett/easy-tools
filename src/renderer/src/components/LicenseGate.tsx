import { useEffect, useState } from 'react'
import type { LicenseState } from '../../../shared/about'
import ActivationScreen from './ActivationScreen'

/** Muestra la app solo si ya tiene clave; si no, pide la activación. */
export default function LicenseGate({
  children
}: {
  children: React.ReactNode
}): React.JSX.Element | null {
  const [state, setState] = useState<LicenseState | null>(null)

  useEffect(() => {
    window.api.license.state().then(setState)
  }, [])

  if (!state) return null
  if (state.required && !state.unlocked)
    return (
      <ActivationScreen state={state} onActivated={() => setState({ ...state, unlocked: true })} />
    )
  return <>{children}</>
}
