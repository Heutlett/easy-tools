interface Note {
  /** Frecuencia en Hz */
  freq: number
  /** Cuándo suena, en segundos desde ahora */
  at: number
  /** Cuánto dura, en segundos */
  length: number
}

/** Toca unas notas con el audio del navegador (no necesita archivos de sonido). */
function play(notes: Note[]): void {
  try {
    const ctx = new AudioContext()
    for (const { freq, at, length } of notes) {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.frequency.value = freq
      gain.gain.value = 0.25
      osc.connect(gain).connect(ctx.destination)
      osc.start(ctx.currentTime + at)
      osc.stop(ctx.currentTime + at + length)
    }
    const end = Math.max(...notes.map((n) => n.at + n.length))
    setTimeout(() => ctx.close(), (end + 0.5) * 1000)
  } catch {
    // Sin sonido disponible: queda el aviso visual.
  }
}

/** Tres pitidos: se acabó el tiempo. */
export const beepThree = (): void => play([0, 0.5, 1].map((at) => ({ freq: 880, at, length: 0.3 })))

/** Notas ascendentes: hay un resultado. */
export const fanfare = (): void =>
  play([523, 659, 784, 1047].map((freq, i) => ({ freq, at: i * 0.14, length: 0.28 })))

/** Un "tic" corto, para la cuenta mientras gira o rueda algo. */
export const tick = (): void => play([{ freq: 1200, at: 0, length: 0.03 }])
