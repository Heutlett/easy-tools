import { expandNumbersEs, splitForSpeech } from './speechText'

/**
 * Proceso aparte que genera la voz (se lanza desde src/main/voices.ts con utilityProcess).
 * Va separado para que un fallo del motor nativo no tumbe la app y para que no choque con otras librerías nativas.
 * El texto se parte en trozos cortos y cada uno se manda en cuanto está listo, así la voz empieza a sonar enseguida.
 */
interface SpeakRequest {
  type: 'speak'
  id: number
  /** Carpeta con los archivos del modelo */
  dir: string
  /** Idioma de la voz: 'es' o 'en' (cada modelo habla uno solo) */
  lang: string
  text: string
  speed: number
}

type Message =
  SpeakRequest | { type: 'cancel'; id: number } | { type: 'warmup'; dir: string; lang: string }

interface Engine {
  generate: (r: { text: string; sid: number; speed: number; enableExternalBuffer: boolean }) => {
    samples: Float32Array
    sampleRate: number
  }
}

/** Los dos modelos (español e inglés) se quedan cargados una vez que se usan */
const engines = new Map<string, Engine>()

function engineFor(dir: string, lang: string): Engine {
  const key = `${dir}|${lang}`
  const cached = engines.get(key)
  if (cached) return cached
  // Se carga recién al primer uso: si falta o falla, se responde con el error en vez de caerse
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sherpa = require('sherpa-onnx-node') as {
    OfflineTts: new (config: unknown) => Engine
  }
  const engine = new sherpa.OfflineTts({
    model: {
      vits: {
        model: `${dir}/${lang}/model.onnx`,
        tokens: `${dir}/${lang}/tokens.txt`,
        dataDir: `${dir}/espeak-ng-data`
      },
      numThreads: 2,
      provider: 'cpu',
      debug: false
    },
    maxNumSentences: 1
  })
  engines.set(key, engine)
  return engine
}

/** Qué tan lento habla respecto de lo que piden los juegos (medido: en español Piper a 0.85 daba 2.6 palabras por segundo; con esto, ~1.9; en inglés, ~2.0) */
const PACE: Record<string, number> = { es: 0.82, en: 0.7 }

/** El audio de la frase con un silencio al final (copia el audio, que viene de la memoria del motor) */
function withSilence(samples: Float32Array, sampleRate: number, ms: number): Float32Array {
  const out = new Float32Array(samples.length + Math.round((sampleRate * ms) / 1000))
  out.set(samples)
  return out
}

const cancelled = new Set<number>()
const queue: SpeakRequest[] = []
let running = false

const post = (message: unknown): void => process.parentPort.postMessage(message)
/** Deja que lleguen los mensajes nuevos (por ejemplo, una cancelación) entre un trozo y otro */
const tick = (): Promise<void> => new Promise((resolve) => setImmediate(resolve))

async function run(r: SpeakRequest): Promise<void> {
  try {
    const engine = engineFor(r.dir, r.lang)
    // Las cifras se escriben con letras antes de partir el texto (si no, el «1.500» se partiría en el punto)
    const chunks = splitForSpeech(r.lang === 'es' ? expandNumbersEs(r.text) : r.text)
    for (let i = 0; i < chunks.length; i++) {
      if (cancelled.has(r.id)) return
      const audio = engine.generate({
        text: chunks[i].text,
        sid: 0,
        // Piper dice las cosas más rápido de lo que conviene para enseñar: con 0.8 queda en unas 2 palabras por segundo
        speed: r.speed * (PACE[r.lang] ?? 0.8),
        // Electron no admite buffers externos (la memoria del motor nativo): que el audio se copie
        enableExternalBuffer: false
      })
      if (cancelled.has(r.id)) return
      post({
        id: r.id,
        type: 'chunk',
        index: i,
        samples: withSilence(audio.samples, audio.sampleRate, chunks[i].pause),
        sampleRate: audio.sampleRate
      })
      await tick()
    }
    post({ id: r.id, type: 'done' })
  } catch (err) {
    post({ id: r.id, type: 'error', error: String(err) })
  } finally {
    cancelled.delete(r.id)
  }
}

async function pump(): Promise<void> {
  if (running) return
  running = true
  while (queue.length) {
    const next = queue.shift()
    if (next && !cancelled.has(next.id)) await run(next)
    else if (next) cancelled.delete(next.id)
  }
  running = false
}

process.parentPort.on('message', (event) => {
  const m = event.data as Message
  if (m.type === 'cancel') cancelled.add(m.id)
  else if (m.type === 'warmup') {
    // Carga el motor y hace una frase corta para que la primera de verdad no tarde
    try {
      engineFor(m.dir, m.lang).generate({
        text: m.lang === 'es' ? 'Hola.' : 'Hello.',
        sid: 0,
        speed: 1,
        enableExternalBuffer: false
      })
    } catch (err) {
      console.error('[voz] calentamiento', err)
    }
  } else {
    queue.push(m)
    void pump()
  }
})
