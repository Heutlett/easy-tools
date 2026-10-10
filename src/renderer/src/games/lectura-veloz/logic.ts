export function formatTime(ms: number, tenths = false): string {
  const total = Math.max(0, ms) / 1000
  const m = Math.floor(total / 60)
  const s = Math.floor(total % 60)
  const base = `${m}:${String(s).padStart(2, '0')}`
  return tenths ? `${base},${Math.floor((total * 10) % 10)}` : base
}

export const wordsPerMinute = (words: number, ms: number): number =>
  ms > 0 ? Math.round((words * 60000) / ms) : 0
