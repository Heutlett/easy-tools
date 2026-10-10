import { shuffle } from '../../lib/games/shuffle'
import type { Word } from './vocab'

/** Palabras que se podrían confundir entre sí: nunca salen juntas como opciones de una misma pregunta */
const MUTUAL: string[][] = [
  ['fish', 'tropical fish'],
  ['house', 'town', 'city'],
  ['hospital', 'hotel', 'bank', 'post office'],
  ['bike', 'ride a bike'],
  ['bed', 'sleep'],
  ['hand', 'clap', 'wave hello'],
  ['music', 'sing', 'singer'],
  ['party', 'fireworks'],
  ['happy', 'excited', 'laugh'],
  ['paint', 'artist'],
  ['telephone', 'cell phone'],
  ['piano', 'keyboard'],
  ['car', 'taxi', 'police car'],
  ['truck', 'fire truck'],
  ['ship', 'sailboat', 'canoe'],
  ['paper', 'newspaper'],
  ['beach', 'island'],
  ['rainy', 'stormy', 'lightning'],
  ['windy', 'tornado', 'hurricane'],
  ['hat', 'cap'],
  ['glasses', 'sunglasses'],
  ['shirt', 't-shirt'],
  ['candy', 'chocolate'],
  ['bear', 'panda', 'koala', 'teddy bear']
]

/** Una palabra general y las más específicas que contiene (el dibujo de una sirve también para la otra) */
const GENERIC: Record<string, string[]> = {
  bird: ['parrot', 'owl', 'eagle', 'hen', 'rooster', 'duck', 'turkey'],
  tree: ['pine tree', 'palm tree'],
  flower: ['rose', 'sunflower', 'tulip'],
  plant: ['tree', 'pine tree', 'palm tree', 'flower', 'rose', 'sunflower', 'tulip', 'cactus']
}

/** Temas cuyos dibujos son personas: «man» sirve también para «doctor», «girl» para «student»… */
const PEOPLE = ['family', 'jobs']

/** ¿Podrían dos palabras tener la misma respuesta correcta para un mismo dibujo? */
export function confusable(a: Word, b: Word): boolean {
  if (a.en === b.en || a.visual === b.visual) return true
  if (a.topic !== b.topic && PEOPLE.includes(a.topic) && PEOPLE.includes(b.topic)) return true
  if (MUTUAL.some((g) => g.includes(a.en) && g.includes(b.en))) return true
  return (GENERIC[a.en]?.includes(b.en) ?? false) || (GENERIC[b.en]?.includes(a.en) ?? false)
}

/**
 * La palabra correcta y `count - 1` distractores, en orden al azar. Prefiere palabras del mismo tema,
 * y nunca repite la misma palabra ni el mismo dibujo, ni usa una palabra que también describa el dibujo
 * (así no hay dos respuestas posibles).
 */
export function makeChoices(target: Word, pool: Word[], count = 4): Word[] {
  const others = pool.filter((w) => !confusable(w, target))
  const same = shuffle(others.filter((w) => w.topic === target.topic))
  const rest = shuffle(others.filter((w) => w.topic !== target.topic))
  const picked: Word[] = []
  for (const w of [...same, ...rest]) {
    if (picked.length >= count - 1) break
    if (picked.some((p) => p.en === w.en)) continue
    picked.push(w)
  }
  return shuffle([target, ...picked])
}

/** Palabras al azar sin repetir (si hay menos que las pedidas, las que haya) */
export function sampleWords(pool: Word[], count: number): Word[] {
  const seen = new Set<string>()
  const unique = shuffle(pool).filter((w) => {
    const key = `${w.en}|${w.visual}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return unique.slice(0, count)
}
