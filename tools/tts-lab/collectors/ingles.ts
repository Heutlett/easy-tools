import { FAMILIES, QUESTIONS } from '../../../src/renderer/src/games/ingles-escucha/data'
import { COMMANDS } from '../../../src/renderer/src/games/ingles-simon/data'
import { SENTENCES } from '../../../src/renderer/src/games/_ingles/sentences'
import { WORDS } from '../../../src/renderer/src/games/_ingles/vocab'
import { slug, type Item } from './util'

/**
 * El banco de inglés que comparten los cuatro juegos de inglés (así una palabra que sale en varios juegos tiene un solo audio):
 *  - «Listen and choose» (ingles-escucha): cada palabra del vocabulario, frase, pregunta y respuesta, con versión lenta (botón 🐢).
 *  - «¿Qué es?» (ingles-imagenes): las palabras del vocabulario.
 *  - «Build the sentence» (ingles-oraciones): cada oración del banco.
 *  - «Simon says» (ingles-simon): cada orden, sola y con «Simon says» delante, con versión lenta y rápida.
 * Fuentes: games/_ingles/vocab.ts, games/_ingles/sentences/, games/ingles-escucha/data.ts y games/ingles-simon/data.ts.
 * Id: en/ingles/<texto>. Si un texto sale en varios juegos con distintas velocidades, se suman.
 */
export function collect(): Item[] {
  const items: Item[] = []
  const add = (text: string, variants?: ('slow' | 'fast')[]): void => {
    items.push({ id: `en/ingles/${slug(text)}`, lang: 'en', text, variants })
  }
  const slow: ('slow' | 'fast')[] = ['slow']
  // Listen and choose
  for (const w of WORDS) add(w.en, slow)
  for (const f of FAMILIES) for (const [en] of f.phrases) add(en, slow)
  for (const [, , question, answer] of QUESTIONS) {
    add(question, slow)
    add(answer, slow)
  }
  // Build the sentence
  for (const s of SENTENCES) add(s.en)
  // Simon says: lo que se dice es «Simon says touch your nose.» o «Touch your nose.»; el juego lo pide lento, normal y rápido
  const simon: ('slow' | 'fast')[] = ['slow', 'fast']
  const lower = (s: string): string => s.charAt(0).toLowerCase() + s.slice(1)
  for (const c of COMMANDS) {
    add(c.en, simon)
    add(`Simon says ${lower(c.en)}`, simon)
  }
  return items
}
