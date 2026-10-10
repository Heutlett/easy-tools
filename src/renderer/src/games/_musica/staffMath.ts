const S = 20

export type Clef = 'sol' | 'fa'

/** Paso (diatónico) de la línea de abajo de cada clave: Mi4 en sol, Sol2 en fa */
export const BOTTOM_STEP: Record<Clef, number> = { sol: 2, fa: -10 }

/** Posición vertical del centro de una nota (el eje Y crece hacia abajo) */
export function noteY(step: number, clef: Clef, bottomY: number): number {
  return bottomY - ((step - BOTTOM_STEP[clef]) * S) / 2
}
