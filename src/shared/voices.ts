/**
 * Voces de los juegos: audios ya hechos (se generan con tools/tts-lab) que se descargan como un componente y solo se reproducen.
 * Los números de VOICES_PACK los imprime `tools/tts-lab/package.py` al armar el paquete.
 */
export type VoiceLang = 'es' | 'en'

export const VOICES_PACK = {
  /** Sube si cambian los audios: así quien ya tenía el paquete anterior baja el nuevo */
  version: 1,
  sha256: 'e41d13a2848aa5488ebe95fd43ed1072af5b5170b7d4b3c4ec9ce231361c8474',
  sizeMB: 114,
  url: 'https://github.com/Heutlett/easy-tools/releases/download/voces-1/Educando-voces-1.zip'
} as const

/** Un audio del catálogo (`index.json` del paquete) */
export interface VoiceEntry {
  text: string
  lang: VoiceLang
  seconds: number
  /** Archivos relativos a la carpeta del paquete: el normal, `.slow.opus` y/o `.fast.opus` */
  files: string[]
}

export interface VoiceCatalog {
  /** Carpeta donde están los archivos (se sirven con easy-media) */
  dir: string
  entries: Record<string, VoiceEntry>
}
