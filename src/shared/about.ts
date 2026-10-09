/** Datos de contacto de quien hizo la app (se muestran en "Acerca de" y en la pantalla de activación). */
export const AUTHOR = {
  name: 'Adrian Araya',
  email: 'adrian.araya.work@gmail.com',
  /** Teléfono de contacto, como se muestra y solo los dígitos */
  phone: '+506 8839 3511',
  phoneDigits: '+50688393511',
  /** SINPE Móvil, como se muestra y solo los dígitos (para copiarlo y pegarlo en la app del banco) */
  sinpe: '+506 8839 3511',
  sinpeDigits: '88393511'
} as const

export interface LicenseState {
  /** Si esta copia de la app exige clave (la versión instalada sí; en desarrollo no) */
  required: boolean
  unlocked: boolean
  /** Código de este equipo, el que hay que enviar para pedir la clave */
  code: string
}
