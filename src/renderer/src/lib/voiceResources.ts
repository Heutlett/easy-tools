import { useEffect, useSyncExternalStore } from 'react'
import { voiceOf, type VoiceId, type VoiceLang } from '../../../shared/voices'
import { warmUpVoices } from './naturalSpeech'

/**
 * Las voces para leer en voz alta (un modelo de Piper por idioma) se descargan junto con las demás piezas
 * grandes (ver components.ts). Aquí se sabe si ya están: mientras no, los juegos no leen en voz alta.
 */
let installed: boolean | null = null
let started = false
const listeners = new Set<() => void>()

const set = (value: boolean): void => {
  installed = value
  listeners.forEach((l) => l())
}

async function refresh(): Promise<void> {
  try {
    const list = await window.api.components.status()
    set(list.find((c) => c.id === 'voices')?.installed === true)
  } catch (err) {
    console.error('[voces]', err)
    set(false)
  }
}

function start(): void {
  if (started) return
  started = true
  void refresh()
  window.api.components.onProgress((p) => {
    if (p.id === 'voices' && p.state === 'done') void refresh()
  })
}

const subscribe = (l: () => void): (() => void) => {
  listeners.add(l)
  start()
  return () => listeners.delete(l)
}

/** ¿Ya están descargadas las voces? (null mientras se consulta) */
export function useVoicesInstalled(): boolean | null {
  return useSyncExternalStore(subscribe, () => installed)
}

/** La voz con la que se lee en ese idioma, o null mientras las voces no estén descargadas */
export function useActiveVoice(lang: VoiceLang): VoiceId | null {
  return useVoicesInstalled() ? voiceOf(lang).id : null
}

/** Cuando las voces están listas, se carga el motor con anticipación para que la primera frase no tarde */
export function useWarmVoices(): void {
  const ready = useVoicesInstalled()
  useEffect(() => {
    if (ready) warmUpVoices()
  }, [ready])
}
