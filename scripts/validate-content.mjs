// Revisa el contenido que viene con la app (preguntas, afirmaciones, listas de palabras y parejas).
// Uso: node scripts/validate-content.mjs [materia ...]   (sin argumentos revisa todo)
// Termina con código 1 si hay errores. Los avisos (⚠) no hacen fallar, pero conviene leerlos.
import { build } from 'esbuild'
import { readdirSync, existsSync } from 'node:fs'
import { join, resolve, basename } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const CONTENT = join(ROOT, 'src/renderer/src/content')
const only = process.argv.slice(2)

const errors = []
const warnings = []
const err = (file, msg) => errors.push(`${file}: ${msg}`)
const warn = (file, msg) => warnings.push(`${file}: ${msg}`)

async function load(file) {
  const result = await build({
    entryPoints: [file],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'node',
    logLevel: 'silent'
  })
  const code = result.outputFiles[0].text
  const mod = await import('data:text/javascript;base64,' + Buffer.from(code).toString('base64'))
  return mod.default
}

const SUBJECTS = ['matematica', 'ciencias', 'sociales', 'espanol', 'ingles', 'musica', 'cultura']
const FORBIDDEN_OPTION = /^(todas|ninguna|ambas|a y b|b y c|a y c|todos|ninguno|las dos|los dos)\b/i
const norm = (s) => String(s).trim().toLowerCase().replace(/\s+/g, ' ')

const stats = {}
const bump = (kind, subject, grade) => {
  const key = `${kind}|${subject}|${grade}`
  stats[key] = (stats[key] ?? 0) + 1
}

function checkQuestions(file, list) {
  if (!Array.isArray(list))
    return err(file, 'el archivo debe exportar por defecto un arreglo de preguntas')
  const ids = new Set()
  const texts = new Set()
  for (const q of list) {
    const where = `${file} [${q.id}]`
    if (ids.has(q.id)) err(where, 'id repetido')
    ids.add(q.id)
    if (!SUBJECTS.includes(q.subject)) err(where, `asignatura inválida: ${q.subject}`)
    if (![1, 2, 3, 4, 5, 6].includes(q.grade)) err(where, `grado inválido: ${q.grade}`)
    if (![1, 2, 3].includes(q.difficulty)) err(where, `dificultad inválida: ${q.difficulty}`)
    if (!q.topic || !String(q.topic).trim()) err(where, 'falta el tema')
    if (!q.text || !String(q.text).trim()) err(where, 'falta el texto')
    else {
      if (q.text.length > 200)
        warn(where, `pregunta muy larga (${q.text.length} letras): se lee mal en el proyector`)
      const key = `${q.subject}|${q.grade}|${norm(q.text)}`
      if (texts.has(key)) err(where, 'pregunta repetida')
      texts.add(key)
    }
    if (!Array.isArray(q.options) || q.options.length !== 4) {
      err(where, 'debe tener exactamente 4 opciones')
      continue
    }
    if (q.answer !== 0 && !(Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4))
      err(where, 'answer fuera de rango')
    const seen = new Set()
    q.options.forEach((o, i) => {
      if (!String(o).trim()) err(where, `la opción ${i + 1} está vacía`)
      if (seen.has(norm(o))) err(where, `opciones repetidas: «${o}»`)
      seen.add(norm(o))
      if (FORBIDDEN_OPTION.test(String(o).trim()))
        err(where, `opción «${o}»: no uses «todas/ninguna/ambas»: las opciones se mezclan al jugar`)
      if (String(o).length > 70)
        warn(where, `opción muy larga (${String(o).length} letras): «${o}»`)
    })
    if (/\b(la opción|el inciso|la letra) [abcd]\b/i.test(q.text + q.options.join(' ')))
      err(where, 'no se puede mencionar «opción A/B/C/D»: las opciones se mezclan')
    bump('Pregunta', q.subject, q.grade)
  }
}

function checkStatements(file, list) {
  if (!Array.isArray(list))
    return err(file, 'el archivo debe exportar por defecto un arreglo de afirmaciones')
  const ids = new Set()
  const texts = new Set()
  const bal = {}
  for (const s of list) {
    const where = `${file} [${s.id}]`
    if (ids.has(s.id)) err(where, 'id repetido')
    ids.add(s.id)
    if (!SUBJECTS.includes(s.subject)) err(where, `asignatura inválida: ${s.subject}`)
    if (![1, 2, 3, 4, 5, 6].includes(s.grade)) err(where, `grado inválido: ${s.grade}`)
    if (typeof s.answer !== 'boolean') err(where, 'answer debe ser true o false')
    if (!s.topic || !String(s.topic).trim()) err(where, 'falta el tema')
    if (!s.text || !String(s.text).trim()) err(where, 'falta el texto')
    else {
      if (s.text.length > 200) warn(where, `afirmación muy larga (${s.text.length} letras)`)
      const key = `${s.subject}|${s.grade}|${norm(s.text)}`
      if (texts.has(key)) err(where, 'afirmación repetida')
      texts.add(key)
    }
    bal[s.grade] ??= { t: 0, f: 0 }
    bal[s.grade][s.answer ? 't' : 'f']++
    bump('Afirmación', s.subject, s.grade)
  }
  for (const [grade, { t, f }] of Object.entries(bal)) {
    const total = t + f
    if (total >= 10 && (t / total < 0.35 || t / total > 0.65))
      warn(
        file,
        `grado ${grade}: ${t} verdaderas y ${f} falsas (conviene que estén más parejas, entre 40 % y 60 %)`
      )
  }
}

function checkLists(file, list, kind) {
  if (!Array.isArray(list))
    return err(file, 'el archivo debe exportar por defecto un arreglo de listas')
  const ids = new Set()
  for (const l of list) {
    const where = `${file} [${l.id}]`
    if (ids.has(l.id)) err(where, 'id repetido')
    ids.add(l.id)
    if (!SUBJECTS.includes(l.subject)) err(where, `asignatura inválida: ${l.subject}`)
    if (!l.title || !String(l.title).trim()) err(where, 'falta el título')
    if (
      !Array.isArray(l.grades) ||
      l.grades.length === 0 ||
      l.grades.some((g) => ![1, 2, 3, 4, 5, 6].includes(g))
    )
      err(where, 'grados inválidos')
    const items = kind === 'palabras' ? l.items : l.pairs
    if (!Array.isArray(items) || items.length < (kind === 'palabras' ? 8 : 6))
      err(where, `muy corta: ${kind === 'palabras' ? 'mínimo 8 palabras' : 'mínimo 6 parejas'}`)
    const seen = new Set()
    for (const it of items ?? []) {
      const text = kind === 'palabras' ? it.text : `${it[0]}|${it[1]}`
      if (
        !String(text).trim() ||
        (kind === 'parejas' && (!String(it[0]).trim() || !String(it[1]).trim()))
      )
        err(where, 'hay un elemento vacío')
      if (seen.has(norm(text))) err(where, `repetido: «${text}»`)
      seen.add(norm(text))
      if (kind === 'palabras' && it.text.length > 40)
        warn(where, `muy larga para adivinar: «${it.text}»`)
    }
    for (const g of l.grades ?? [])
      bump(kind === 'palabras' ? 'Lista de palabras' : 'Lista de parejas', l.subject, g)
  }
}

const dirs = [
  ['questions', checkQuestions],
  ['statements', checkStatements],
  ['lists', (f, l) => checkLists(f, l, 'palabras')],
  ['pairs', (f, l) => checkLists(f, l, 'parejas')]
]

for (const [dir, check] of dirs) {
  const folder = join(CONTENT, dir)
  if (!existsSync(folder)) continue
  for (const name of readdirSync(folder).filter((n) => n.endsWith('.ts'))) {
    const subject = basename(name, '.ts')
    if (only.length && !only.includes(subject)) continue
    if (!SUBJECTS.includes(subject)) {
      err(`${dir}/${name}`, `el nombre del archivo debe ser una asignatura: ${SUBJECTS.join(', ')}`)
      continue
    }
    const file = `${dir}/${name}`
    try {
      const data = await load(join(folder, name))
      check(file, data)
      for (const item of Array.isArray(data) ? data : [])
        if (item.subject !== subject)
          err(
            file,
            `[${item.id}] la asignatura (${item.subject}) no coincide con el archivo (${subject})`
          )
    } catch (e) {
      err(file, `no se pudo leer: ${e.message}`)
    }
  }
}

// Resumen: cantidad por tipo, asignatura y grado
const PLURAL = {
  Pregunta: 'Preguntas',
  Afirmación: 'Afirmaciones',
  'Lista de palabras': 'Listas de palabras',
  'Lista de parejas': 'Listas de parejas'
}
const kinds = [...new Set(Object.keys(stats).map((k) => k.split('|')[0]))]
for (const kind of kinds) {
  console.log(`\n${PLURAL[kind] ?? kind} por asignatura y grado`)
  console.log('asignatura   ' + [1, 2, 3, 4, 5, 6].map((g) => `${g}.º`.padStart(5)).join(''))
  for (const subject of SUBJECTS) {
    if (only.length && !only.includes(subject)) continue
    const row = [1, 2, 3, 4, 5, 6].map((g) =>
      String(stats[`${kind}|${subject}|${g}`] ?? 0).padStart(5)
    )
    if (row.some((c) => c.trim() !== '0')) console.log(subject.padEnd(13) + row.join(''))
  }
}

if (warnings.length)
  console.log(
    `\n⚠ ${warnings.length} aviso(s):\n` +
      warnings
        .slice(0, 80)
        .map((w) => '  ' + w)
        .join('\n')
  )
if (errors.length) {
  console.log(
    `\n✖ ${errors.length} error(es):\n` +
      errors
        .slice(0, 120)
        .map((e) => '  ' + e)
        .join('\n')
  )
  process.exit(1)
}
console.log('\n✔ Contenido válido')
