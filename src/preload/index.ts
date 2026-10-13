import { contextBridge, ipcRenderer, webUtils } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import type { ComponentId, ComponentProgress, ComponentStatus } from '../shared/components'
import type { UpdateStatus } from '../shared/update'
import type { FileKind, MediaInfo, WordModel } from '../shared/types'

type Result<T> = { ok: true; data: T } | { ok: false; error: string; cancelled?: boolean }

/** Llama al proceso principal; si algo sale mal lanza un Error con mensaje listo para mostrar. */
async function call<T>(channel: string, ...args: unknown[]): Promise<T> {
  const result: Result<T> = await ipcRenderer.invoke(channel, ...args)
  if (result.ok) return result.data
  const err = new Error(result.error)
  err.name = result.cancelled ? 'CancelledError' : 'Error'
  throw err
}

const api = {
  appVersion: () => call<string>('app:version'),
  pickFiles: (kind: FileKind, multiple = false) =>
    call<string[]>('dialog:open', { kind, multiple }),
  /** Ruta real de un archivo arrastrado a la ventana */
  pathForFile: (file: File) => webUtils.getPathForFile(file),
  /** URL para mostrar un archivo local en <video>, <img>, etc. */
  mediaUrl: (path: string) => `easy-media://local/?path=${encodeURIComponent(path)}`,
  showItem: (path: string) => call<void>('shell:showItem', path),
  openOutputFolder: () => call<void>('shell:openOutputFolder'),
  cancelJob: (jobId: string) => call<void>('job:cancel', jobId),
  onProgress: (cb: (p: { jobId: string; fraction: number; label?: string }) => void) => {
    const listener = (_: unknown, p: { jobId: string; fraction: number; label?: string }): void =>
      cb(p)
    ipcRenderer.on('job:progress', listener)
    return () => {
      ipcRenderer.removeListener('job:progress', listener)
    }
  },

  output: {
    saveFile: (p: { name: string; ext: string; data: ArrayBuffer }) =>
      call<{ output: string }>('output:saveFile', p),
    saveInFolder: (p: { dir?: string; folderName: string; fileName: string; data: ArrayBuffer }) =>
      call<{ dir: string; output: string }>('output:saveInFolder', p)
  },

  store: {
    /** Todos los datos guardados, y de dónde se recuperaron si el archivo principal estaba dañado */
    load: () => call<{ data: Record<string, unknown>; recoveredFrom: string | null }>('store:load'),
    /** Guarda (o borra, si el valor es undefined) un dato; se escribe a disco enseguida y de forma segura */
    set: (key: string, value: unknown) => ipcRenderer.send('store:set', key, value),
    replaceAll: (data: Record<string, unknown>) =>
      call<Record<string, unknown>>('store:replaceAll', data)
  },

  components: {
    status: () => call<ComponentStatus[]>('components:status'),
    install: (id: ComponentId) => call<void>('components:install', id),
    cancel: (id: ComponentId) => call<void>('components:cancel', id),
    onProgress: (cb: (p: ComponentProgress) => void) => {
      const listener = (_: unknown, p: ComponentProgress): void => cb(p)
      ipcRenderer.on('components:progress', listener)
      return () => {
        ipcRenderer.removeListener('components:progress', listener)
      }
    }
  },

  update: {
    status: () => call<UpdateStatus>('update:status'),
    check: () => call<void>('update:check'),
    download: () => call<void>('update:download'),
    install: () => call<void>('update:install'),
    onStatus: (cb: (status: UpdateStatus) => void) => {
      const listener = (_: unknown, status: UpdateStatus): void => cb(status)
      ipcRenderer.on('update:status', listener)
      return () => {
        ipcRenderer.removeListener('update:status', listener)
      }
    }
  },

  video: {
    info: (file: string) => call<MediaInfo>('video:info', file),
    /** Un fotograma del video en el segundo indicado, como imagen (data URL) */
    frame: (p: { input: string; time: number; height: number }) => call<string>('video:frame', p),
    trim: (p: { jobId: string; input: string; start: number; end: number }) =>
      call<{ output: string }>('video:trim', p),
    toAudio: (p: { jobId: string; input: string }) => call<{ output: string }>('video:toAudio', p),
    join: (p: { jobId: string; inputs: string[] }) => call<{ output: string }>('video:join', p)
  },
  youtube: {
    info: (url: string) =>
      call<{
        title: string
        thumbnail: string | null
        duration: number | null
        channel: string | null
      }>('youtube:info', url),
    download: (p: { jobId: string; url: string; mode: 'video' | 'audio' }) =>
      call<{ output: string }>('youtube:download', p)
  },
  pdf: {
    toWord: (p: { input: string; model: WordModel }) => call<{ output: string }>('pdf:toWord', p),
    merge: (p: { inputs: string[] }) => call<{ output: string }>('pdf:merge', p),
    split: (p: { input: string; pages: number[]; mode: 'selected' | 'each' }) =>
      call<{ output: string; count: number }>('pdf:split', p)
  },
  word: {
    toPdf: (p: { input: string }) => call<{ output: string }>('word:toPdf', p),
    /** Qué programa de Office hay en el equipo ("word", "libreoffice" o null) */
    engine: () => call<'word' | 'libreoffice' | null>('word:engine')
  },
  image: {
    removeBackground: (p: { input: string; width: number; height: number; rgba: ArrayBuffer }) =>
      call<{ output: string }>('image:removeBackground', p)
  }
}

export type Api = typeof api

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
