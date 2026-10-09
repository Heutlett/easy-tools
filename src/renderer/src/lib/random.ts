const buffer = new Uint32Array(1)

/** Entero al azar entre min y max (ambos incluidos). Usa el generador seguro del sistema y no favorece a ningún número. */
export function randomInt(min: number, max: number): number {
  const range = max - min + 1
  // Se descartan los valores que dejarían unos números con más probabilidad que otros
  const limit = Math.floor(0x100000000 / range) * range
  do {
    crypto.getRandomValues(buffer)
  } while (buffer[0] >= limit)
  return min + (buffer[0] % range)
}

/** Número decimal al azar entre 0 (incluido) y 1 (sin incluir). */
export function randomFloat(): number {
  crypto.getRandomValues(buffer)
  return buffer[0] / 0x100000000
}
