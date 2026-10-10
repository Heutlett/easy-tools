import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from './sfx'

/**
 * Cuenta regresiva en segundos. `start(n)` la inicia, `stop()` la detiene. Al llegar a cero llama a `onEnd`
 * (con el sonido de «se acabó el tiempo» si `sound` es verdadero). Con `ticks` suena un tic en los últimos 5 segundos.
 */
export function useCountdown(
  options: { onEnd?: () => void; sound?: boolean; ticks?: boolean } = {}
): {
  seconds: number
  running: boolean
  start: (seconds: number) => void
  stop: () => void
} {
  const [seconds, setSeconds] = useState(0)
  const [running, setRunning] = useState(false)
  // Lo que queda, aparte del estado, para que los efectos (sonido, onEnd) no se hagan dentro de una actualización de estado
  const left = useRef(0)
  const endRef = useRef(options.onEnd)
  const soundRef = useRef(options.sound ?? true)
  const ticksRef = useRef(options.ticks ?? false)

  useEffect(() => {
    endRef.current = options.onEnd
    soundRef.current = options.sound ?? true
    ticksRef.current = options.ticks ?? false
  })

  useEffect(() => {
    if (!running) return
    const id = setInterval(() => {
      left.current -= 1
      if (left.current <= 0) {
        clearInterval(id)
        setSeconds(0)
        setRunning(false)
        if (soundRef.current) sfx.timeUp()
        endRef.current?.()
        return
      }
      setSeconds(left.current)
      if (ticksRef.current && left.current <= 5) sfx.tick()
    }, 1000)
    return () => clearInterval(id)
  }, [running])

  const start = useCallback((n: number) => {
    left.current = n
    setSeconds(n)
    setRunning(true)
  }, [])
  const stop = useCallback(() => setRunning(false), [])

  return { seconds, running, start, stop }
}
