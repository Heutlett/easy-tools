import { useDurable } from './durable'

/** Como useState, pero recuerda el valor la próxima vez que se abra la app (se guarda en el archivo de datos con respaldos). */
export const usePersistentState = useDurable
