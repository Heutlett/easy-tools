import { ipcMain, type IpcMainInvokeEvent } from 'electron'
import { CancelledError, UserError } from './jobs'
import { isUnlocked } from './license/state'

/** Estas funciones sirven aunque la app todavía no tenga clave (la activación, el "Acerca de" y las actualizaciones). */
const ALWAYS_OPEN = /^(license|update|app):/

export type Result<T> = { ok: true; data: T } | { ok: false; error: string; cancelled?: boolean }

/** Registra un canal IPC; los errores llegan al renderer como mensajes amigables. */
export function handle<A extends unknown[], R>(
  channel: string,
  fn: (event: IpcMainInvokeEvent, ...args: A) => Promise<R> | R
): void {
  ipcMain.handle(channel, async (event, ...args): Promise<Result<R>> => {
    // Sin clave, el proceso principal no hace nada: no basta con saltarse la pantalla de activación
    if (!ALWAYS_OPEN.test(channel) && !isUnlocked())
      return { ok: false, error: 'Esta aplicación necesita una clave para usarse.' }
    try {
      return { ok: true, data: await fn(event, ...(args as A)) }
    } catch (err) {
      if (err instanceof CancelledError) return { ok: false, error: 'Cancelado', cancelled: true }
      if (err instanceof UserError) return { ok: false, error: err.message }
      console.error(`[${channel}]`, err)
      return { ok: false, error: 'Ocurrió un problema inesperado. Intenta de nuevo.' }
    }
  })
}
