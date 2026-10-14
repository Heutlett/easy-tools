/**
 * Voces para leer en voz alta: el modelo Kokoro-82M (Apache-2.0), que corre sin internet con sherpa-onnx. Es un solo modelo para
 * varios idiomas, pero cada idioma se pronuncia con las reglas de ese idioma (los textos se convierten a sonidos con espeak-ng y,
 * en inglés, con un diccionario), y el idioma se fija al cargar el motor: no se confunde de idioma. Hay una voz por idioma, las
 * dos elegidas a oído: `em_alex` (hombre) en español y `af_heart` (mujer, la mejor calificada del modelo) en inglés.
 *
 * Se descarga junto con las demás piezas grandes (ver src/shared/components.ts y src/main/components.ts) de una revisión fija de
 * Hugging Face, verificado con SHA-256. Los datos de pronunciación (espeak-ng) son GPL-3.0: se descargan como datos y el motor los
 * carga en un proceso aparte.
 */
export type VoiceLang = 'es' | 'en'
/** Una voz por idioma: el identificador es el idioma */
export type VoiceId = VoiceLang

export interface VoiceDef {
  id: VoiceId
  lang: VoiceLang
  /** Número de la voz dentro del modelo (29 = em_alex, 3 = af_heart) */
  sid: number
  /** Idioma que se le dice al motor para convertir el texto en sonidos */
  espeakLang: string
}

export const VOICES: VoiceDef[] = [
  { id: 'es', lang: 'es', sid: 29, espeakLang: 'es-419' },
  { id: 'en', lang: 'en', sid: 3, espeakLang: 'en-us' }
]

export const voiceOf = (lang: VoiceLang): VoiceDef =>
  VOICES.find((v) => v.lang === lang) ?? VOICES[0]
export const voiceDef = (id: VoiceId): VoiceDef => VOICES.find((v) => v.id === id) ?? VOICES[0]

export interface PackFile {
  name: string
  sha256: string
  /** Peso aproximado, para calcular el avance */
  sizeMB: number
}

/** Los archivos del modelo (precisión completa: en las pruebas, la versión comprimida era 3 veces más lenta y fallaba más) */
export const PACK = {
  repo: 'csukuangfj/kokoro-multi-lang-v1_0',
  revision: 'f7b96bb6bef5c5da4d3aa4f4e0498fbbf62dc78b',
  files: [
    {
      name: 'model.onnx',
      sha256: 'b40f62b166ac8164b0627ef48a0b358eda0985e272fb03ef5252e7206305da11',
      sizeMB: 310
    },
    {
      name: 'voices.bin',
      sha256: '1c5a5b983d3d50d8586d437a51f3faa2da7919ce76a013c081e65671a3447c29',
      sizeMB: 27
    },
    {
      name: 'tokens.txt',
      sha256: '6ebb6bb288f20f3ae8d004d3c2ca27697da27c037d75e81a60e2a6a663f95425',
      sizeMB: 0.01
    },
    {
      name: 'lexicon-us-en.txt',
      sha256: '7daaab53a181be9885b853a8582bf1838186317e5dadacbcef9c426d6fa0da14',
      sizeMB: 6
    }
  ] as PackFile[]
}

/** Datos de pronunciación (espeak-ng) */
export const ESPEAK = {
  url: 'https://github.com/k2-fsa/sherpa-onnx/releases/download/tts-models/espeak-ng-data.zip',
  sha256: 'bc4525eafe31b4e3f5e43aea495f3169e97dd2544f1bbfe95514ce8a61baee39',
  sizeMB: 9
}

/** Lo que devuelve la síntesis: audio mono en decimales de -1 a 1 */
export interface SpeechAudio {
  samples: Float32Array
  sampleRate: number
}

/** Un aviso del audio que se está generando por trozos */
export type VoiceChunk =
  | { requestId: number; type: 'chunk'; index: number; samples: Float32Array; sampleRate: number }
  | { requestId: number; type: 'done' }
  | { requestId: number; type: 'error'; message: string }
