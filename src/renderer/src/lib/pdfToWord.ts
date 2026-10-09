import { Util } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'
import { PAGE_NUMBER_TOKEN } from '../../../shared/types'
import type { WordModel, WordParagraph, WordRun } from '../../../shared/types'
import { openPdf } from './pdf'

/** Texto pegado a la izquierda con un viñeta o número: "1.", "a)", "•", "-" */
const BULLET = /^(\d{1,2}[.)]|[a-zA-Z][.)]|[•·▪◦●○■□✓➢➤–—-])(\s|$)/
const SENTENCE_END = /[.!?:;»”")]$/

interface Line {
  y: number
  x: number
  xEnd: number
  size: number
  runs: WordRun[]
  text: string
  /** Posición de cada columna después de la primera (líneas con huecos grandes) */
  tabXs: number[]
}

interface PageLines {
  width: number
  height: number
  lines: Line[]
}

function fontFamily(name: string, serif: boolean, mono: boolean): string {
  if (mono || /courier|mono|consolas/i.test(name)) return 'Courier New'
  if (/arial|helvetica|verdana|tahoma|sans/i.test(name)) return 'Arial'
  if (serif || /times|serif|georgia|cambria|garamond|palatino|book/i.test(name))
    return 'Times New Roman'
  return 'Calibri'
}

/** Nombre real de la letra (por ejemplo "ABCDEF+Calibri-Bold") y si es negrita o cursiva. */
function fontInfo(
  page: PDFPageProxy,
  fontName: string
): { family: string; bold: boolean; italic: boolean } {
  let name = fontName
  let bold = false
  let italic = false
  let serif = false
  let mono = false
  try {
    const font = page.commonObjs.get(fontName) as {
      name?: string
      bold?: boolean
      italic?: boolean
      isSerifFont?: boolean
      isMonospace?: boolean
    }
    name = font.name ?? fontName
    bold = !!font.bold
    italic = !!font.italic
    serif = !!font.isSerifFont
    mono = !!font.isMonospace
  } catch {
    // Si la letra no está disponible nos quedamos con el nombre interno.
  }
  return {
    family: fontFamily(name, serif, mono),
    bold: bold || /bold|black|heavy/i.test(name),
    italic: italic || /italic|oblique/i.test(name)
  }
}

const sameStyle = (a: WordRun, b: WordRun): boolean =>
  a.font === b.font && a.size === b.size && a.bold === b.bold && a.italic === b.italic

async function readPage(page: PDFPageProxy): Promise<PageLines> {
  const viewport = page.getViewport({ scale: 1 })
  await page.getOperatorList() // carga las letras para poder leer sus nombres
  const content = await page.getTextContent()

  interface Item {
    text: string
    x: number
    y: number
    width: number
    size: number
    run: Omit<WordRun, 'text'>
  }
  const items: Item[] = []
  for (const raw of content.items) {
    // pdfjs usa ítems con solo espacios para representar huecos: el hueco se calcula con las posiciones
    if (!('str' in raw) || raw.str.trim().length === 0) continue
    const t = Util.transform(viewport.transform, raw.transform) as number[]
    const size = Math.hypot(t[0], t[1])
    if (size < 1 || Math.abs(t[1]) > size * 0.3) continue // texto girado (marcas de agua, etc.)
    const info = fontInfo(page, raw.fontName)
    items.push({
      text: raw.str,
      x: t[4],
      y: t[5],
      width: raw.width,
      size,
      run: {
        font: info.family,
        size: Math.round(size * 2) / 2,
        bold: info.bold,
        italic: info.italic
      }
    })
  }

  // Agrupa en líneas: mismo alto (con tolerancia) y ordenadas de izquierda a derecha
  items.sort((a, b) => a.y - b.y || a.x - b.x)
  const groups: Item[][] = []
  for (const item of items) {
    const group = groups.find(
      (g) => Math.abs(g[0].y - item.y) <= Math.max(g[0].size, item.size) * 0.4
    )
    if (group) group.push(item)
    else groups.push([item])
  }

  /** Arma una línea de texto. `columns` son posiciones de columnas de tabla ya conocidas en esta página. */
  const assemble = (group: Item[], columns: number[]): Line => {
    group.sort((a, b) => a.x - b.x)
    const runs: WordRun[] = []
    const tabXs: number[] = []
    let prevEnd = group[0].x
    for (const item of group) {
      const gap = item.x - prevEnd
      let text = item.text
      const last = runs[runs.length - 1]
      // Un hueco grande, o un texto que empieza justo donde empieza una columna de la tabla, es una columna nueva
      const startsColumn =
        gap > item.size * 4 ||
        (gap > item.size * 0.12 && columns.some((c) => Math.abs(c - item.x) <= 1.2))
      if (last && startsColumn) {
        text = `\t${text}`
        tabXs.push(item.x)
      } else if (
        last &&
        gap > item.size * 0.12 &&
        !last.text.endsWith(' ') &&
        !text.startsWith(' ')
      )
        text = ` ${text}`
      if (last && sameStyle(last, { ...item.run, text })) last.text += text
      else runs.push({ ...item.run, text })
      prevEnd = item.x + item.width
    }
    const text = runs.map((r) => r.text).join('')
    const weight = (r: WordRun): number => r.text.trim().length
    const dominant = runs.reduce((best, r) => (weight(r) > weight(best) ? r : best), runs[0])
    return { y: group[0].y, x: group[0].x, xEnd: prevEnd, size: dominant.size, runs, text, tabXs }
  }

  // Primera pasada: solo huecos grandes. Las posiciones que se repiten en 2 o más líneas son columnas de una tabla.
  const firstPass = groups.map((group) => assemble(group, []))
  const columnCounts = new Map<number, number>()
  for (const line of firstPass)
    for (const x of line.tabXs)
      columnCounts.set(Math.round(x), (columnCounts.get(Math.round(x)) ?? 0) + 1)
  const columns = [...columnCounts].filter(([, count]) => count >= 2).map(([x]) => x)

  const lines: Line[] = (
    columns.length ? groups.map((group) => assemble(group, columns)) : firstPass
  )
    .filter((line) => line.text.trim().length > 0)
    .sort((a, b) => a.y - b.y)

  return { width: viewport.width, height: viewport.height, lines }
}

const median = (values: number[]): number => {
  const sorted = [...values].sort((a, b) => a - b)
  return sorted.length ? sorted[Math.floor(sorted.length / 2)] : 0
}

interface Layout {
  width: number
  leftMargin: number
  rightEdge: number
  textWidth: number
  bodySize: number
}

/** Une las líneas de una o más páginas en párrafos. */
function buildParagraphs(
  pages: PageLines[],
  layout: Layout
): { paragraphs: WordParagraph[]; first: Line[]; last: Line[] } {
  const { width, leftMargin, rightEdge, textWidth, bodySize } = layout
  const paragraphs: WordParagraph[] = []
  /** Primera y última línea de cada párrafo, para calcular el espacio entre párrafos */
  const first: Line[] = []
  const last: Line[] = []
  const isCentered = (l: Line): boolean =>
    Math.abs((l.x + l.xEnd) / 2 - width / 2) < width * 0.03 && l.x - leftMargin > width * 0.06
  const isRight = (l: Line): boolean =>
    Math.abs(l.xEnd - rightEdge) < 3 && l.x - leftMargin > textWidth * 0.4

  pages.forEach((page, pageIndex) => {
    page.lines.forEach((line, i) => {
      const prev = page.lines[i - 1]
      const current = paragraphs[paragraphs.length - 1]
      let startNew = !prev || !current
      if (!startNew) {
        const gap = line.y - prev.y
        const currentIsBullet = BULLET.test(first[first.length - 1].text.trim())
        const prevShort = prev.xEnd < rightEdge - textWidth * 0.12
        startNew =
          gap > prev.size * 1.25 * 1.55 ||
          Math.abs(line.size - prev.size) >= 1 ||
          BULLET.test(line.text.trim()) ||
          isCentered(line) !== isCentered(prev) ||
          // cada fila de una tabla (líneas con columnas) va en su propio párrafo
          line.tabXs.length > 0 ||
          prev.tabXs.length > 0 ||
          (prevShort && SENTENCE_END.test(prev.text.trim())) ||
          (!currentIsBullet && line.x - prev.x > bodySize * 1.2)
      }

      if (startNew) {
        const plain = !isCentered(line) && !isRight(line)
        paragraphs.push({
          runs: line.runs.map((r) => ({ ...r })),
          align: isCentered(line) ? 'center' : isRight(line) ? 'right' : 'left',
          indentLeft: plain && line.x - leftMargin > 8 ? Math.round(line.x - leftMargin) : 0,
          spacingAfter: 0,
          tabStops: line.tabXs.map((x) => Math.round(x - leftMargin)),
          pageBreakBefore: !prev && pageIndex > 0
        })
        first.push(line)
        last.push(line)
      } else {
        // Sigue el mismo párrafo: se une con un espacio (o se pega la palabra cortada por guion)
        const runs = current.runs
        const tail = runs[runs.length - 1]
        if (/\w-$/.test(tail.text) && /^[a-záéíóúñ]/.test(line.text))
          tail.text = tail.text.slice(0, -1)
        else if (!tail.text.endsWith(' ')) tail.text += ' '
        for (const r of line.runs) {
          const end = runs[runs.length - 1]
          if (sameStyle(end, r)) end.text += r.text
          else runs.push({ ...r })
        }
        last[last.length - 1] = line
      }
    })
  })

  // Espacio debajo de cada párrafo: lo que sobra entre el final de uno y el comienzo del siguiente
  paragraphs.forEach((p, i) => {
    const next = first[i + 1]
    if (!next || p.pageBreakBefore || paragraphs[i + 1].pageBreakBefore) return
    const extra = next.y - last[i].y - last[i].size * 1.2
    p.spacingAfter = Math.min(36, Math.max(0, Math.round(extra)))
  })
  return { paragraphs, first, last }
}

const normalize = (text: string): string =>
  text.toLowerCase().replace(/\d+/g, '#').replace(/\s+/g, ' ').trim()

/**
 * Saca de las páginas el texto que se repite arriba o abajo (encabezados, pies, números de página)
 * para ponerlo como encabezado y pie de Word en vez de repetirlo dentro del cuerpo.
 */
function extractHeaderFooter(pages: PageLines[]): {
  header: Line[]
  footer: Line[]
  headerAt: number
  footerAt: number
} {
  const result = { header: [] as Line[], footer: [] as Line[], headerAt: 0, footerAt: 0 }
  if (pages.length < 2) return result
  const needed = Math.max(2, Math.ceil(pages.length * 0.5))

  for (const zone of ['header', 'footer'] as const) {
    const inZone = (page: PageLines, l: Line): boolean =>
      zone === 'header' ? l.y < page.height * 0.12 : l.y > page.height * 0.88
    const seen = new Map<string, { pages: number[]; texts: Set<string> }>()
    pages.forEach((page, index) => {
      for (const line of page.lines.filter((l) => inZone(page, l))) {
        const key = normalize(line.text)
        const entry = seen.get(key) ?? { pages: [], texts: new Set<string>() }
        if (!entry.pages.includes(index)) entry.pages.push(index)
        entry.texts.add(line.text.trim())
        seen.set(key, entry)
      }
    })
    const repeated = new Set(
      [...seen].filter(([, e]) => e.pages.length >= needed).map(([key]) => key)
    )
    if (repeated.size === 0) continue

    const firstPage = pages.findIndex((page) =>
      page.lines.some((l) => inZone(page, l) && repeated.has(normalize(l.text)))
    )
    for (const [index, page] of pages.entries()) {
      const removed = page.lines.filter((l) => inZone(page, l) && repeated.has(normalize(l.text)))
      page.lines = page.lines.filter((l) => !removed.includes(l))
      if (index !== firstPage) continue
      for (const line of removed) {
        const entry = seen.get(normalize(line.text))!
        // Si el texto cambia de página en página, el número que cambia es el número de página
        if (entry.texts.size > 1) {
          const token = new RegExp(`(?<!\\d)${index + 1}(?!\\d)`)
          for (const run of line.runs) run.text = run.text.replace(token, PAGE_NUMBER_TOKEN)
          line.text = line.runs.map((r) => r.text).join('')
        }
        result[zone].push(line)
      }
    }
    result[zone === 'header' ? 'headerAt' : 'footerAt'] = firstPage
  }
  return result
}

/** Lee un PDF y reconstruye un documento simple: párrafos, negritas, tamaños, alineación y saltos de página. */
export async function pdfToWordModel(
  path: string,
  onProgress: (fraction: number) => void
): Promise<WordModel> {
  const doc = await openPdf(path, true)
  const pages: PageLines[] = []
  for (let n = 1; n <= doc.numPages; n++) {
    pages.push(await readPage(await doc.getPage(n)))
    onProgress(n / doc.numPages)
  }

  const textLength = pages.flatMap((p) => p.lines).reduce((sum, l) => sum + l.text.trim().length, 0)
  if (textLength < 20) {
    throw new Error(
      'Este PDF parece ser una imagen (por ejemplo, una hoja escaneada o fotografiada) y no tiene texto que convertir.'
    )
  }

  const { header, footer } = extractHeaderFooter(pages)
  const withText = pages.filter((p) => p.lines.length)
  const { width, height } = pages[0]
  const leftMargin = median(withText.map((p) => Math.min(...p.lines.map((l) => l.x))))
  const rightEdge = median(withText.map((p) => Math.max(...p.lines.map((l) => l.xEnd))))
  const topMargin = median(withText.map((p) => p.lines[0].y - p.lines[0].size))
  const bottomMargin = median(withText.map((p) => p.height - p.lines[p.lines.length - 1].y))
  const layout: Layout = {
    width,
    leftMargin,
    rightEdge,
    textWidth: Math.max(1, rightEdge - leftMargin),
    bodySize: median(
      withText
        .flatMap((p) => p.lines)
        .flatMap((l) => Array(Math.min(l.text.length, 200)).fill(l.size))
    )
  }

  const toParagraphs = (lines: Line[]): WordParagraph[] =>
    lines.length ? buildParagraphs([{ width, height, lines }], layout).paragraphs : []

  const clamp = (v: number, min = 24): number => Math.min(150, Math.max(min, Math.round(v)))
  return {
    page: {
      width,
      height,
      margin: {
        top: clamp(topMargin),
        right: clamp(width - rightEdge),
        bottom: clamp(bottomMargin),
        left: clamp(leftMargin),
        header: clamp(header.length ? header[0].y - header[0].size : 36, 18),
        footer: clamp(footer.length ? height - footer[footer.length - 1].y : 36, 18)
      }
    },
    header: toParagraphs(header),
    footer: toParagraphs(footer),
    paragraphs: buildParagraphs(withText, layout).paragraphs
  }
}
