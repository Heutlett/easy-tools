import { useEffect, useState } from 'react'
import type { UpdateStatus } from '../../../shared/update'

/** Estado de las actualizaciones de la app y las acciones para buscar, descargar e instalar. */
export function useUpdate(): {
  status: UpdateStatus
  check: () => void
  download: () => void
  install: () => void
} {
  const [status, setStatus] = useState<UpdateStatus>({ state: 'idle' })

  useEffect(() => {
    window.api.update.status().then(setStatus)
    return window.api.update.onStatus(setStatus)
  }, [])

  return {
    status,
    check: () => void window.api.update.check(),
    download: () => void window.api.update.download(),
    install: () => void window.api.update.install()
  }
}
