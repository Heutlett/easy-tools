import { app } from 'electron'
import { handle } from './ipc'

export function registerAppInfoHandlers(): void {
  handle('app:version', () => app.getVersion())
}
