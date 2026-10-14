import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { VoiceCatalog, VoiceEntry, VoiceLang } from '../../../../shared/voices'

export type { VoiceLang }

/* ---------- Catálogo de audios (se lee una vez y se renueva cuando termina de bajar el paquete de voces) ---------- */

interface Loaded {
  dir: string
  /** idioma + texto exacto → audio */
  byText: Map<string, VoiceEntry>
}

let loaded: Loaded | null = null
let loading: Promise<void> | null = null
const listeners = new Set<() => void>()
let watching = false

const key = (lang: VoiceLang, text: string): string => `${lang}\n${text}`

function load(): Promise<void> {
  loading ??= window.api.voices
    .catalog()
    .then((c: VoiceCatalog | null) => {
      loaded = c
        ? {
            dir: c.dir,
            byText: new Map(Object.values(c.entries).map((e) => [key(e.lang, e.text), e]))
          }
        : null
    })
    .catch((err: unknown) => {
      console.error('[voz]', err)
      loaded = null
    })
    .finally(() => {
      loading = null
      listeners.forEach((l) => l())
    })
  return loading
}

/** Cuando termina de bajar el paquete de voces, se vuelve a leer el catálogo (sin tener que reabrir el juego) */
function watchInstall(): void {
  if (watching) return
  watching = true
  window.api.components.onProgress((p) => {
    if (p.id === 'voices' && p.state === 'done') void load()
  })
}

/* ---------- Reproducción ---------- */

type Pace = 'slow' | 'normal' | 'fast'

/** Los juegos piden una velocidad (como la de una voz de sistema); se elige el audio lento, normal o rápido que más se le parece */
const paceOf = (rate: number): Pace => (rate <= 0.7 ? 'slow' : rate >= 1.1 ? 'fast' : 'normal')

const SUFFIX: Record<Pace, string> = { slow: '.slow.opus', normal: '.opus', fast: '.fast.opus' }
/** Si el audio no tiene esa versión, se usa el normal cambiando la velocidad (conserva el tono) */
const FALLBACK_RATE: Record<Pace, number> = { slow: 0.7, normal: 1, fast: 1.2 }

function fileFor(entry: VoiceEntry, pace: Pace): { file: string; playbackRate: number } {
  const exact = entry.files.find(
    (f) => f.endsWith(SUFFIX[pace]) && (pace !== 'normal' || !/\.(slow|fast)\.opus$/.test(f))
  )
  if (exact) return { file: exact, playbackRate: 1 }
  const normal = entry.files.find((f) => !/\.(slow|fast)\.opus$/.test(f)) ?? entry.files[0]
  return { file: normal, playbackRate: FALLBACK_RATE[pace] }
}

/**
 * Voz para leer en voz alta en español o en inglés: reproduce los audios ya hechos que se descargan con la app (carpeta tools/tts-lab).
 * El audio se busca por el texto EXACTO, así que los juegos deben leer justo lo que dicen los «collectors» del laboratorio.
 * `available` es falso mientras las voces no estén descargadas: los juegos deben funcionar igual sin ellas.
 */
export function useVoice(lang: VoiceLang): {
  available: boolean
  speak: (text: string, rate?: number) => void
  stop: () => void
} {
  const [catalog, setCatalog] = useState<Loaded | null>(loaded)
  const audio = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    watchInstall()
    const update = (): void => setCatalog(loaded)
    listeners.add(update)
    void load()
    return () => {
      listeners.delete(update)
      audio.current?.pause()
      audio.current = null
    }
  }, [])

  const stop = useCallback(() => {
    audio.current?.pause()
  }, [])

  const speak = useCallback(
    (text: string, rate = 0.9) => {
      if (!catalog) return
      // Si algo falla, el juego sigue funcionando sin la voz
      try {
        const entry = catalog.byText.get(key(lang, text))
        if (!entry) {
          console.warn(`[voz] No hay audio para (${lang}): ${text}`)
          return
        }
        audio.current?.pause()
        const { file, playbackRate } = fileFor(entry, paceOf(rate))
        const el = new Audio(window.api.mediaUrl(`${catalog.dir}/${file}`))
        el.playbackRate = playbackRate
        el.preservesPitch = true
        audio.current = el
        void el.play().catch((err: unknown) => console.error('[voz]', err))
      } catch (err) {
        console.error('[voz]', err)
      }
    },
    [catalog, lang]
  )

  return useMemo(() => ({ available: catalog !== null, speak, stop }), [catalog, speak, stop])
}
