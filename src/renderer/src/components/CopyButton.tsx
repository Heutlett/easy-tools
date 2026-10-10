import { useState } from 'react'

/** Botón que copia un texto al portapapeles y avisa con "¡Copiado!". */
export default function CopyButton({
  text,
  label = 'Copiar'
}: {
  text: string
  label?: string
}): React.JSX.Element {
  const [copied, setCopied] = useState(false)
  const copy = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      // Si el sistema no deja copiar, la persona puede seleccionar el texto a mano.
    }
  }
  return (
    <button className="btn secondary small" onClick={copy}>
      {copied ? '✓ ¡Copiado!' : `📋 ${label}`}
    </button>
  )
}
