import type { WebContents } from 'electron'

/** Error con un mensaje pensado para mostrarse tal cual a la persona usuaria. */
export class UserError extends Error {}

export class CancelledError extends Error {
  constructor() {
    super('cancelled')
  }
}

const running = new Map<string, () => void>()

export function registerJob(jobId: string, cancel: () => void): () => void {
  running.set(jobId, cancel)
  return () => running.delete(jobId)
}

export function cancelJob(jobId: string): void {
  running.get(jobId)?.()
}

export type Reporter = (fraction: number, label?: string) => void

export function reporter(sender: WebContents, jobId: string): Reporter {
  return (fraction, label) => {
    if (sender.isDestroyed()) return
    sender.send('job:progress', { jobId, fraction: Math.max(0, Math.min(1, fraction)), label })
  }
}
