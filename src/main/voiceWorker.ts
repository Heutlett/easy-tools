import { cpus } from 'os'
import { expandNumbersEn, expandNumbersEs, splitForSpeech } from './speechText'

/**
 * Proceso aparte que genera la voz de UN idioma (se lanza desde src/main/voices.ts con utilityProcess, uno por idioma y solo mientras
 * hace falta, para no tener cargado en memoria un modelo de ~400 MB que nadie está usando). Va separado para que un fallo del motor
 * nativo no tumbe la app. El texto se parte en frases y cada una se manda en cuanto está lista, así la voz empieza a sonar enseguida.
 */
interface SpeakRequest {
  type: 'speak'
  id: number
  /** Carpeta con los archivos del modelo */
  dir: string
  /** Idioma de la voz: 'es' o 'en' */
  lang: string
  /** Número de la voz dentro del modelo y el idioma que se le dice al motor */
  sid: number
  espeakLang: string
  text: string
  speed: number
}

type Message =
  | SpeakRequest
  | { type: 'cancel'; id: number }
  | { type: 'warmup'; dir: string; lang: string; sid: number; espeakLang: string }

interface Engine {
  generate: (r: { text: string; sid: number; speed: number; enableExternalBuffer: boolean }) => {
    samples: Float32Array
    sampleRate: number
  }
}

let loaded: { key: string; engine: Engine } | null = null

function engineFor(dir: string, lang: string, espeakLang: string): Engine {
  const key = `${dir}|${lang}`
  if (loaded?.key === key) return loaded.engine
  loaded = null
  // Se carga recién al primer uso: si falta o falla, se responde con el error en vez de caerse
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const sherpa = require('sherpa-onnx-node') as {
    OfflineTts: new (config: unknown) => Engine
  }
  const engine = new sherpa.OfflineTts({
    model: {
      kokoro: {
        model: `${dir}/model.onnx`,
        voices: `${dir}/voices.bin`,
        tokens: `${dir}/tokens.txt`,
        dataDir: `${dir}/espeak-ng-data`,
        // El diccionario es del inglés; en español se pronuncia solo con las reglas de espeak-ng
        lexicon: lang === 'en' ? `${dir}/lexicon-us-en.txt` : '',
        lang: espeakLang
      },
      numThreads: Math.max(2, Math.min(4, cpus().length)),
      provider: 'cpu',
      debug: false
    },
    maxNumSentences: 1
  })
  loaded = { key, engine }
  return engine
}

/**
 * Qué tan lento habla respecto de lo que piden los juegos, para que quede en unas 2 palabras por segundo (medido: a velocidad 0.8
 * en español y 0.6 en inglés; los juegos piden 0.85 a 0.9).
 */
const PACE: Record<string, number> = { es: 0.89, en: 0.67 }

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
    const engine = engineFor(r.dir, r.lang, r.espeakLang)
    // Las cifras se escriben con letras antes de partir el texto (si no, el «1.500» se partiría en el punto)
    const prepared = r.lang === 'es' ? expandNumbersEs(r.text) : expandNumbersEn(r.text)
    const chunks = splitForSpeech(prepared)
    for (let i = 0; i < chunks.length; i++) {
      if (cancelled.has(r.id)) return
      const audio = engine.generate({
        text: chunks[i].text,
        sid: r.sid,
        speed: r.speed * (PACE[r.lang] ?? 0.8),
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
      engineFor(m.dir, m.lang, m.espeakLang).generate({
        text: m.lang === 'es' ? 'Hola.' : 'Hello.',
        sid: m.sid,
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
