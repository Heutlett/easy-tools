/**
 * Pedido de «llévame ahí» desde la ayuda: la pantalla que se abre lo lee y lo borra.
 * Hoy sirve para abrir directo un juego dentro de «Juegos».
 */
let pendingGame: string | null = null

export const requestGame = (id: string): void => {
  pendingGame = id
}

/** El juego pedido (si hay); no lo borra, porque React puede preparar la pantalla dos veces */
export const peekRequestedGame = (): string | null => pendingGame

export const clearRequestedGame = (): void => {
  pendingGame = null
}
