import { useEffect, useState } from 'react'
import type { Ctx } from './Runner'

export interface Choice {
  id: string
  content: React.ReactNode
  /** Texto para lectores de pantalla */
  label?: string
}

interface Props {
  ctx: Ctx
  choices: Choice[]
  answerId: string
  /** Mensaje que se muestra si se falla */
  explain?: string
  /** Mensaje si se acierta */
  praise?: string
  className?: string
}

/** Opciones A–D grandes para elegir una (con teclas 1–4 o A–D). Avisa el resultado a la ronda. */
export default function Choices({
  ctx,
  choices,
  answerId,
  explain,
  praise,
  className = ''
}: Props): React.JSX.Element {
  const [picked, setPicked] = useState<string | null>(null)
  const done = ctx.resolved !== null

  const pick = (id: string): void => {
    if (done) return
    setPicked(id)
    ctx.resolve(id === answerId, id === answerId ? praise : explain)
  }

  useEffect(() => {
    if (done) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      const i =
        '1234'.indexOf(e.key) >= 0 ? '1234'.indexOf(e.key) : 'abcd'.indexOf(e.key.toLowerCase())
      if (i >= 0 && i < choices.length && e.key.length === 1) {
        e.preventDefault()
        pick(choices[i].id)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  })

  return (
    <div className={`g-options mp-choices ${className}`}>
      {choices.map((c, i) => {
        const state = !done ? '' : c.id === answerId ? 'correct' : c.id === picked ? 'wrong' : 'dim'
        return (
          <button
            key={c.id}
            className={`g-option ${state}`}
            disabled={done}
            aria-label={c.label}
            onClick={() => pick(c.id)}
          >
            <span className="g-letter" aria-hidden>
              {'ABCD'[i]}
            </span>
            <span className="mp-choice-body">{c.content}</span>
          </button>
        )
      })}
    </div>
  )
}
