import { createPublicKey, verify as cryptoVerify, sign as cryptoSign } from 'node:crypto'

/**
 * Claves de uso: cada clave es una firma digital (Ed25519) del código de UN equipo. La app solo lleva la llave
 * pública, así que puede comprobar que una clave es auténtica pero no puede fabricar claves nuevas.
 * Este archivo lo usan tanto la app como el script de administración (scripts/keys.mjs): no importa nada de Electron.
 */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
const MESSAGE_PREFIX = 'easy-tools|v1|'

export function base32Encode(bytes: Uint8Array): string {
  let bits = 0
  let value = 0
  let out = ''
  for (const byte of bytes) {
    value = (value << 8) | byte
    bits += 8
    while (bits >= 5) {
      out += ALPHABET[(value >>> (bits - 5)) & 31]
      bits -= 5
    }
  }
  if (bits > 0) out += ALPHABET[(value << (5 - bits)) & 31]
  return out
}

export function base32Decode(text: string): Uint8Array | null {
  let bits = 0
  let value = 0
  const out: number[] = []
  for (const char of text) {
    const index = ALPHABET.indexOf(char)
    if (index < 0) return null
    value = (value << 5) | index
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  return Uint8Array.from(out)
}

/** "abcd-1234 ..." -> "ABCD1234" (sin guiones, espacios ni saltos de línea) */
export const normalize = (text: string): string => text.replace(/[^A-Za-z0-9]/g, '').toUpperCase()

/** Código de un equipo: 16 caracteres hexadecimales, mostrados de a 4 ("ABCD-1234-EF56-7890"). */
export const isMachineCode = (text: string): boolean => /^[0-9A-F]{16}$/.test(normalize(text))
export const formatMachineCode = (code: string): string =>
  normalize(code).replace(/(.{4})(?=.)/g, '$1-')

/** La clave se muestra en grupos de 6 letras para que sea más fácil de copiar y leer. */
export const formatKey = (key: string): string => normalize(key).replace(/(.{6})(?=.)/g, '$1-')

const messageFor = (machineCode: string): Buffer =>
  Buffer.from(MESSAGE_PREFIX + normalize(machineCode))

/** (Solo administrador) Firma el código de un equipo y devuelve su clave. */
export function createKey(machineCode: string, privateKeyPem: string): string {
  const signature = cryptoSign(null, messageFor(machineCode), privateKeyPem)
  return formatKey(base32Encode(signature))
}

/** ¿Esta clave fue emitida para este equipo? */
export function isKeyValid(key: string, machineCode: string, publicKeyPem: string): boolean {
  try {
    const signature = base32Decode(normalize(key))
    if (!signature || signature.length !== 64) return false
    return cryptoVerify(null, messageFor(machineCode), createPublicKey(publicKeyPem), signature)
  } catch {
    return false
  }
}
