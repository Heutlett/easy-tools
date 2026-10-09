/** 75.3 -> "1:15.3" ; 3725 -> "1:02:05" */
export function formatTime(seconds: number, tenths = false): string {
  const s = Math.max(0, seconds)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  const secText = tenths
    ? sec.toFixed(1).padStart(4, '0')
    : String(Math.floor(sec)).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${secText}` : `${m}:${secText}`
}

/** "1:15", "1:15.5", "75" -> segundos. Devuelve null si no se entiende. */
export function parseTime(text: string): number | null {
  const parts = text.trim().replace(',', '.').split(':')
  if (parts.length === 0 || parts.length > 3 || parts.some((p) => !/^\d+(\.\d+)?$/.test(p)))
    return null
  return parts.reduce((acc, p) => acc * 60 + Number(p), 0)
}

/** Duración "humana": 125 -> "2 min 5 s" */
export function formatDuration(seconds: number): string {
  const total = Math.round(seconds)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h} h ${m} min`
  if (m > 0) return s > 0 ? `${m} min ${s} s` : `${m} min`
  return `${s} s`
}

export function baseName(path: string): string {
  return path.split(/[\\/]/).pop() ?? path
}

/** "foto.vacaciones.jpg" -> "foto.vacaciones" */
export function nameWithoutExtension(name: string): string {
  return name.replace(/\.[^./\\]+$/, '')
}
