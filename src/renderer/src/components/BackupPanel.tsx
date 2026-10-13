import { useRef, useState } from 'react'
import { allDurable, replaceAllDurable } from '../lib/durable'

/**
 * Copia de seguridad de los datos (listas de estudiantes, puntos, ranking, preguntas propias).
 * Los datos ya se guardan solos con respaldos automáticos; esto sirve para llevarlos a otra computadora
 * o para volver a un momento anterior.
 */
export default function BackupPanel(): React.JSX.Element {
  const [message, setMessage] = useState('')
  const [pending, setPending] = useState<Record<string, unknown> | null>(null)
  const file = useRef<HTMLInputElement>(null)

  const save = async (): Promise<void> => {
    try {
      const text = JSON.stringify(
        { app: 'educando', version: 1, savedAt: new Date().toISOString(), data: allDurable() },
        null,
        2
      )
      const out = await window.api.output.saveFile({
        name: 'Copia de seguridad de Educando',
        ext: '.json',
        data: new TextEncoder().encode(text).buffer as ArrayBuffer
      })
      setMessage(`✅ Copia guardada: ${out.output.split(/[\\/]/).pop()} (en «Mis archivos»)`)
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'No se pudo guardar la copia.')
    }
  }

  const choose = async (f: File): Promise<void> => {
    try {
      const parsed = JSON.parse(await f.text()) as { data?: unknown }
      if (!parsed.data || typeof parsed.data !== 'object' || Array.isArray(parsed.data))
        throw new Error()
      setPending(parsed.data as Record<string, unknown>)
      setMessage('')
    } catch {
      setPending(null)
      setMessage('Ese archivo no es una copia de seguridad de Educando.')
    }
  }

  const restore = async (): Promise<void> => {
    if (!pending) return
    await replaceAllDurable(pending)
    setPending(null)
    setMessage('✅ Listo: tus datos se restauraron.')
  }

  return (
    <details className="bank-share">
      <summary>💾 Mis datos y copias de seguridad</summary>
      <div className="bank-share-body">
        <p>
          Tus listas de estudiantes, puntos, ranking y preguntas <b>se guardan solos</b> en este
          computador, con copias automáticas (una de ellas queda en Documentos → Educando →
          Respaldo). No hace falta hacer nada.
        </p>
        <p className="muted">
          Si quieres llevarlos a otra computadora o volver a como estaban, usa estos botones.
        </p>
        <div className="row start">
          <button className="btn secondary" onClick={save}>
            ⬇ Guardar una copia ahora
          </button>
          <button className="btn secondary" onClick={() => file.current?.click()}>
            ⬆ Restaurar una copia
          </button>
          <input
            ref={file}
            type="file"
            accept=".json,application/json"
            hidden
            onChange={(e) => {
              const f = e.target.files?.[0]
              e.target.value = ''
              if (f) void choose(f)
            }}
          />
        </div>
        {pending && (
          <div className="notice">
            <p>
              Se van a <b>reemplazar</b> todos tus datos actuales por los de esa copia. ¿Seguro?
            </p>
            <div className="row start">
              <button className="btn danger small" onClick={restore}>
                Sí, restaurar
              </button>
              <button className="btn secondary small" onClick={() => setPending(null)}>
                Cancelar
              </button>
            </div>
          </div>
        )}
        {message && <p className="notice">{message}</p>}
      </div>
    </details>
  )
}
