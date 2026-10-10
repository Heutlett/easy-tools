import { numberWords } from '../_manip/words'
import { mod, rand, takeUnique } from '../_manip/util'
import type { Format, TimeLevel } from './data'

/** El tiempo se guarda como minutos desde la medianoche (0 a 1439) */
export const hm = (t: number): { h: number; m: number } => ({
  h: Math.floor(mod(t, 1440) / 60),
  m: mod(t, 60)
})

const h12Of = (h: number): number => (h % 12 === 0 ? 12 : h % 12)
const pad = (n: number): string => String(n).padStart(2, '0')

export function digital(t: number, format: Format, withPeriod = false): string {
  const { h, m } = hm(t)
  if (format === '24') return `${pad(h)}:${pad(m)}`
  return `${h12Of(h)}:${pad(m)}${withPeriod ? (h < 12 ? ' a. m.' : ' p. m.') : ''}`
}

const HOURS = [
  'doce',
  'una',
  'dos',
  'tres',
  'cuatro',
  'cinco',
  'seis',
  'siete',
  'ocho',
  'nueve',
  'diez',
  'once'
]
const hourPhrase = (h12: number): string => (h12 === 1 ? 'la una' : `las ${HOURS[h12 % 12]}`)

/** Momento del día, para saber si es de la mañana, de la tarde… */
export function dayPart(t: number): string {
  const { h, m } = hm(t)
  if (h === 12 && m === 0) return 'del mediodía'
  if (h === 0 && m === 0) return 'de la medianoche'
  if (h < 5) return 'de la madrugada'
  if (h < 12) return 'de la mañana'
  // En Costa Rica las 6 p. m. todavía son «de la tarde»; «de la noche» desde las 7
  if (h < 19) return 'de la tarde'
  return 'de la noche'
}

export const dayIcon = (t: number): string => {
  const { h } = hm(t)
  return h < 5 ? '🌙' : h < 12 ? '🌅' : h < 19 ? '☀️' : '🌙'
}

/** La hora como se dice en Costa Rica: «las tres y media», «las cuatro menos cuarto», «las doce y cuarto» */
export function words(t: number, withPart = false): string {
  const { h, m } = hm(t)
  const h12 = h12Of(h)
  let text: string
  if (m === 0) text = `${hourPhrase(h12)} en punto`
  else if (m === 15) text = `${hourPhrase(h12)} y cuarto`
  else if (m === 30) text = `${hourPhrase(h12)} y media`
  else if (m === 45) text = `${hourPhrase(h12 === 12 ? 1 : h12 + 1)} menos cuarto`
  else if (m % 5 === 0 && m < 30) text = `${hourPhrase(h12)} y ${numberWords(m)}`
  else if (m % 5 === 0)
    text = `${hourPhrase(h12 === 12 ? 1 : h12 + 1)} menos ${numberWords(60 - m)}`
  else {
    // numberWords convierte «veintiuno» en «veintiun»: aquí se corrige la tilde («veintiún minutos»)
    const minutes = numberWords(m, true).replace(/veintiun$/, 'veintiún')
    text = `${hourPhrase(h12)} y ${minutes} ${m === 1 ? 'minuto' : 'minutos'}`
  }
  if (withPart) text += ` ${dayPart(t)}`
  return text.charAt(0).toUpperCase() + text.slice(1)
}

/** Una hora al azar que cumple el nivel (en 12 h cualquier mitad del día, en 24 h también) */
export function randomTime(level: TimeLevel, avoid?: number): number {
  for (let i = 0; i < 50; i++) {
    const h = rand(0, 23)
    let m = rand(0, 59)
    while (!level.allowed(m)) m = rand(0, 59)
    const t = h * 60 + m
    if (avoid === undefined || mod(t, 720) !== mod(avoid, 720)) return t
  }
  return 9 * 60
}

/** Tres horas que se parecen a la correcta (manecillas cambiadas, hora de más o de menos…), del mismo nivel */
export function distractors(t: number, level: TimeLevel): number[] {
  const half = Math.floor(mod(t, 1440) / 720) * 720
  const base = mod(t, 720)
  const h = Math.floor(base / 60)
  const m = base % 60
  const out: number[] = []
  const add = (hh: number, mm: number): void => {
    const mmm = mod(mm, 60)
    if (!level.allowed(mmm)) return
    out.push(half + mod(hh, 12) * 60 + mmm)
  }
  if (m % 5 === 0) add(m / 5, h * 5) // manecillas cambiadas
  add(h + 1, m)
  add(h - 1, m)
  if (m !== 0) {
    add(h, 60 - m)
    add(h + 1, 60 - m)
  }
  for (const d of [level.snap, 2 * level.snap, 5, 10, 15, 30]) {
    add(h, m + d)
    add(h, m - d)
  }
  add(h + 2, m)
  add(h - 2, m)
  add(h + 3, m)
  const chosen = takeUnique(out, 3, (x) => String(mod(x, 720)), [String(base)])
  while (chosen.length < 3) {
    const extra = half + rand(0, 11) * 60 + (level.allowed(m) ? m : 0)
    if (!chosen.includes(extra) && mod(extra, 720) !== base) chosen.push(extra)
  }
  return chosen
}

/** Dos horas se ven igual en el reloj de 12 horas */
export const sameFace = (a: number, b: number): boolean => mod(a, 720) === mod(b, 720)

export type { Format }
