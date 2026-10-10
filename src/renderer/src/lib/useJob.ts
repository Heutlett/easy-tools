import { useCallback, useEffect, useRef, useState } from 'react'

export interface JobState<T> {
  status: 'idle' | 'running' | 'done' | 'error'
  fraction: number
  label?: string
  error?: string
  result: T | null
}

const IDLE = { status: 'idle', fraction: 0, result: null } as const

/** Mensaje que manda el proceso principal cuando la persona cancela. */
const CANCELLED = 'Cancelado'

export interface Job<T> extends JobState<T> {
  run: (task: (jobId: string) => Promise<T>) => Promise<void>
  cancel: () => void
  reset: () => void
  /** Para tareas que se hacen en la propia ventana (sin proceso principal) */
  report: (fraction: number, label?: string) => void
}

/** Maneja una tarea larga: progreso, cancelación, errores y resultado. */
export function useJob<T>(): Job<T> {
  const [state, setState] = useState<JobState<T>>(IDLE)
  const jobId = useRef('')

  useEffect(
    () =>
      window.api.onProgress((p) => {
        if (p.jobId !== jobId.current) return
        setState((s) =>
          s.status === 'running' ? { ...s, fraction: p.fraction, label: p.label ?? s.label } : s
        )
      }),
    []
  )

  const run = useCallback(async (task: (jobId: string) => Promise<T>) => {
    jobId.current = crypto.randomUUID()
    setState({ status: 'running', fraction: 0, result: null })
    try {
      const result = await task(jobId.current)
      setState({ status: 'done', fraction: 1, result })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message.replace(/^Error invoking remote method '[^']+': (Error: )?/, '')
          : ''
      if (message === CANCELLED) setState(IDLE)
      else
        setState({
          status: 'error',
          fraction: 0,
          result: null,
          error: message || 'Ocurrió un problema. Intenta de nuevo.'
        })
    }
  }, [])

  const cancel = useCallback(() => {
    if (jobId.current) window.api.cancelJob(jobId.current)
  }, [])

  const reset = useCallback(() => setState(IDLE), [])

  const report = useCallback(
    (fraction: number, label?: string) =>
      setState((s) => (s.status === 'running' ? { ...s, fraction, label: label ?? s.label } : s)),
    []
  )

  return { ...state, run, cancel, reset, report }
}
