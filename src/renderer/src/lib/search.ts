/** Minúsculas y sin tildes, para buscar sin que importe cómo se escribió («musica» encuentra «Música») */
export const normalizeText = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** ¿Aparecen todas las palabras de la búsqueda en alguno de los textos? Una búsqueda vacía lo encuentra todo. */
export function matchesQuery(query: string, ...fields: (string | undefined)[]): boolean {
  const words = normalizeText(query).split(/\s+/).filter(Boolean)
  if (words.length === 0) return true
  const haystack = normalizeText(fields.filter(Boolean).join(' '))
  return words.every((w) => haystack.includes(w))
}
