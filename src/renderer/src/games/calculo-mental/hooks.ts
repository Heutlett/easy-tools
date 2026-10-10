import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from '../../lib/games/sfx'

/** Dispara `handler` en cada tecla; ignora los campos de texto. Siempre usa la versión más nueva. */
export function useKeys(handler: (e: KeyboardEvent, onBody: boolean) => void, active = true): void {
  const ref = useRef(handler)
  useEffect(() => {
    ref.current = handler
  })
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent): void => {
      if (e.ctrlKey || e.metaKey || e.altKey) return
      const tag = e.target instanceof HTMLElement ? e.target.tagName : 'BODY'
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) return
      ref.current(e, tag === 'BODY')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
}

/**
 * Cuenta regresiva suave (se actualiza cada 0,1 s para que la barra baje de a poquito).
 * Suena un tic en los últimos 5 segundos y la alarma al llegar a cero.
 */
export function useRoundTimer(
  onEnd: () => void,
  /** Si se da, la cuenta empieza al aparecer (con esa cantidad de segundos) */
  autoStart = 0
): {
  left: number
  total: number
  running: boolean
  start: (seconds: number) => void
  pause: () => void
  resume: () => void
  stop: () => void
} {
  const [left, setLeft] = useState(autoStart * 1000)
  const [total, setTotal] = useState(autoStart * 1000)
  const [running, setRunning] = useState(autoStart > 0)
  const endAt = useRef(0)
  const lastWhole = useRef(autoStart)
  const leftRef = useRef(autoStart * 1000)
  const endRef = useRef(onEnd)
  useEffect(() => {
    endRef.current = onEnd
  })

  useEffect(() => {
    // Si la cuenta empieza sola, el reloj arranca al aparecer
    if (autoStart > 0) endAt.current = performance.now() + autoStart * 1000
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      const remaining = Math.max(0, endAt.current - performance.now())
      leftRef.current = remaining
      setLeft(remaining)
      const whole = Math.ceil(remaining / 1000)
      if (whole !== lastWhole.current) {
        lastWhole.current = whole
        if (whole > 0 && whole <= 5) sfx.tick()
      }
      if (remaining <= 0) {
        clearInterval(id)
        setRunning(false)
        sfx.timeUp()
        endRef.current()
      }
    }, 100)
    return () => clearInterval(id)
  }, [running])

  const start = useCallback((seconds: number) => {
    endAt.current = performance.now() + seconds * 1000
    lastWhole.current = seconds
    leftRef.current = seconds * 1000
    setTotal(seconds * 1000)
    setLeft(seconds * 1000)
    setRunning(true)
  }, [])
  const pause = useCallback(() => setRunning(false), [])
  const resume = useCallback(() => {
    endAt.current = performance.now() + leftRef.current
    setRunning(true)
  }, [])
  const stop = useCallback(() => setRunning(false), [])
  return { left, total, running, start, pause, resume, stop }
}
