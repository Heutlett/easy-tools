import { app } from 'electron'

/** ¿Esta copia de la app exige clave? La versión instalada sí; al desarrollar no (salvo que se fuerce para probar). */
export const licenseRequired = (): boolean =>
  app.isPackaged || process.env['EASY_TOOLS_REQUIRE_KEY'] === '1'

let unlocked = false
export const setUnlocked = (value: boolean): void => {
  unlocked = value
}
export const isUnlocked = (): boolean => !licenseRequired() || unlocked
