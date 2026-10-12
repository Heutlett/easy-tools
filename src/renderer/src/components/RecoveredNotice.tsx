import { useState } from 'react'
import { recoveredFrom } from '../lib/durable'

/** Aviso (una vez) cuando al abrir hubo que recuperar los datos de un respaldo porque el archivo principal se había dañado */
export default function RecoveredNotice(): React.JSX.Element | null {
  const [open, setOpen] = useState(true)
  const from = recoveredFrom()
  if (!from || !open) return null
  return (
    <div className="notice recovered" role="status">
      <span>
        💾 Se recuperaron tus datos desde <b>{from}</b>. Revisa que tus listas y puntos estén bien.
      </span>
      <button className="btn secondary small" onClick={() => setOpen(false)}>
        Entendido
      </button>
    </div>
  )
}
