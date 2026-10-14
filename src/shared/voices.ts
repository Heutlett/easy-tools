/**
 * Voces para leer en voz alta: dos modelos de Piper, uno solo en español y otro solo en inglés, que corren sin internet con
 * sherpa-onnx. Cada modelo habla un solo idioma y pronuncia con las reglas de ese idioma (los textos se convierten a sonidos con
 * espeak-ng), así que no se confunden de idioma. Se descargan junto con las demás piezas grandes (ver src/shared/components.ts y
 * src/main/components.ts) de una revisión fija de Hugging Face, verificados con SHA-256.
 *
 * Licencias de las voces (cada una tiene su MODEL_CARD): es_MX-claude-high es Apache-2.0 y en_US-ljspeech-high es de dominio público. Los datos de pronunciación (espeak-ng-data) son de espeak-ng, que es GPL-3.0: viene como datos y el motor lo carga en
 * un proceso aparte.
 */
export type VoiceLang = 'es' | 'en'
/** Una voz por idioma: el identificador es el idioma */
export type VoiceId = VoiceLang

export interface VoiceDef {
  id: VoiceId
  lang: VoiceLang
  /** Repositorio de Hugging Face (copia con los metadatos que pide sherpa-onnx) y revisión exacta */
  repo: string
  revision: string
  model: string
  modelSha256: string
  tokensSha256: string
  /** Peso aproximado del modelo, en MB */
  sizeMB: number
}

export const VOICES: VoiceDef[] = [
  {
    // Español de México, voz de mujer, calidad alta
    id: 'es',
    lang: 'es',
    repo: 'csukuangfj/vits-piper-es_MX-claude-high',
    revision: '802b53b82c60d3de4f8b965314ac99bbec2499b0',
    model: 'es_MX-claude-high.onnx',
    modelSha256: 'f5eceb904655a60141037d957f21e6257efa93b8c8b7b818c0c57396217bcb1c',
    tokensSha256: 'ef3a7e4a8d1af0c9d4dc45aaae1a6242ebe24a7ed6f3d025a49eb29682784c6d',
    sizeMB: 60
  },
  {
    // Inglés de Estados Unidos, voz de mujer, calidad alta (lecturas de LibriVox, dominio público)
    id: 'en',
    lang: 'en',
    repo: 'csukuangfj/vits-piper-en_US-ljspeech-high',
    revision: '6356d891ee71f4bed94a2b44ec29c010c39c0733',
    model: 'en_US-ljspeech-high.onnx',
    modelSha256: 'fea8faae21240174e972568a004f1d7afb01a93dbc7b3a58c36ecdc1bae82e33',
    tokensSha256: 'ef3a7e4a8d1af0c9d4dc45aaae1a6242ebe24a7ed6f3d025a49eb29682784c6d',
    sizeMB: 109
  }
]

export const voiceOf = (lang: VoiceLang): VoiceDef =>
  VOICES.find((v) => v.lang === lang) ?? VOICES[0]
export const voiceDef = (id: VoiceId): VoiceDef => VOICES.find((v) => v.id === id) ?? VOICES[0]

/** Datos de pronunciación (espeak-ng) que comparten las dos voces */
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
