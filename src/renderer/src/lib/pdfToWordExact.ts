import type {
  ExactBlock,
  ExactCell,
  ExactImage,
  ExactPage,
  ExactRow,
  WordModel
} from '../../../shared/types'
import type { Cell, Fill, Line, PageLines, Rule, VRule } from './pdfRead'

/**
 * Modo "idéntico al PDF". En vez de adivinar párrafos, cada pieza se coloca donde está en el PDF:
 *  - las líneas de texto con huecos grandes se convierten en tablas con las columnas en su posición exacta,
 *  - las líneas del PDF pasan a ser bordes de las tablas (o líneas sueltas),
 *  - las imágenes se anclan a la hoja en su posición,
 *  - el espacio vertical entre elementos se calcula para que el texto caiga en el mismo lugar.
 * Todos los párrafos usan interlineado exacto, así que la posición de cada uno es la suma de alturas conocidas.
 */

/** Alto de línea como múltiplo del tamaño de letra */
const LINE = 1.2

/**
 * A qué distancia del borde de arriba de la línea queda la base de las letras. Word y LibreOffice la ponen
 * abajo del renglón y Chrome en el centro; este promedio coincide con ambos con menos de medio punto de diferencia.
 */
const baselineOffset = (lineHeight: number, size: number): number =>
  0.75 * lineHeight + 0.067 * size

const cellSize = (cell: Cell): number => Math.max(...cell.runs.map((r) => r.size))
const lineSize = (line: Line): number => Math.max(...line.cells.map(cellSize))

// ---------- Tablas con bordes (cuadrícula de líneas) ----------

const cluster = (values: number[], tolerance: number): number[] => {
  const sorted = [...values].sort((a, b) => a - b)
  const out: number[] = []
  let group: number[] = []
  for (const v of sorted) {
    if (group.length && v - group[group.length - 1] > tolerance) {
      out.push(group.reduce((a, b) => a + b, 0) / group.length)
      group = []
    }
    group.push(v)
  }
  if (group.length) out.push(group.reduce((a, b) => a + b, 0) / group.length)
  return out
}

interface Grid {
  xs: number[]
  ys: number[]
  hr: Rule[]
  vr: VRule[]
}

/**
 * Busca tablas dibujadas con líneas: líneas horizontales y verticales que se cruzan forman una cuadrícula.
 * Las columnas y filas salen de la posición de las líneas, así que la tabla queda con las medidas del PDF.
 */
function findGrids(page: PageLines): Grid[] {
  const h = page.rules
  const v = page.vrules
  const TOL = 2
  const parent = [...h.map((_, i) => i), ...v.map((_, i) => h.length + i)]
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])))
  h.forEach((hr, i) =>
    v.forEach((vr, j) => {
      if (vr.x >= hr.x1 - TOL && vr.x <= hr.x2 + TOL && hr.y >= vr.y1 - TOL && hr.y <= vr.y2 + TOL)
        parent[find(i)] = find(h.length + j)
    })
  )
  const groups = new Map<number, { hr: Rule[]; vr: VRule[] }>()
  h.forEach((r, i) => {
    const g = groups.get(find(i)) ?? { hr: [], vr: [] }
    g.hr.push(r)
    groups.set(find(i), g)
  })
  v.forEach((r, j) => {
    const g = groups.get(find(h.length + j)) ?? { hr: [], vr: [] }
    g.vr.push(r)
    groups.set(find(h.length + j), g)
  })

  const grids: Grid[] = []
  for (const { hr, vr } of groups.values()) {
    if (hr.length < 2 || vr.length < 2) continue
    const xs = cluster(
      vr.map((r) => r.x),
      TOL
    )
    const ys = cluster(
      hr.map((r) => r.y),
      TOL
    )
    // Si falta el borde de un lado (la tabla no tiene marco), el límite es hasta donde llegan las otras líneas
    const left = Math.min(...hr.map((r) => r.x1))
    const right = Math.max(...hr.map((r) => r.x2))
    const top = Math.min(...vr.map((r) => r.y1))
    const bottom = Math.max(...vr.map((r) => r.y2))
    if (xs[0] - left > TOL) xs.unshift(left)
    if (right - xs[xs.length - 1] > TOL) xs.push(right)
    if (ys[0] - top > TOL) ys.unshift(top)
    if (bottom - ys[ys.length - 1] > TOL) ys.push(bottom)
    if (xs.length >= 3 || ys.length >= 3) grids.push({ xs, ys, hr, vr })
  }
  return grids.sort((a, b) => a.ys[0] - b.ys[0])
}

type CellBorders = NonNullable<ExactCell['borders']>

/** Los bordes de una celda de la cuadrícula: los lados donde hay una línea que la cubre. */
function gridBorders(grid: Grid, r: number, c: number): CellBorders | undefined {
  const { xs, ys } = grid
  const covers = (a1: number, a2: number, b1: number, b2: number): boolean =>
    Math.min(a2, b2) - Math.max(a1, b1) >= 0.6 * (b2 - b1)
  const out: CellBorders = {}
  const horizontal = (y: number): CellBorders['top'] => {
    const rule = grid.hr.find(
      (q) => Math.abs(q.y - y) <= 2.2 && covers(q.x1, q.x2, xs[c], xs[c + 1])
    )
    return rule ? { width: rule.thickness, color: rule.color } : undefined
  }
  const vertical = (x: number): CellBorders['left'] => {
    const rule = grid.vr.find(
      (q) => Math.abs(q.x - x) <= 2.2 && covers(q.y1, q.y2, ys[r], ys[r + 1])
    )
    return rule ? { width: rule.thickness, color: rule.color } : undefined
  }
  const top = horizontal(ys[r])
  const bottom = horizontal(ys[r + 1])
  const left = vertical(xs[c])
  const right = vertical(xs[c + 1])
  if (top) out.top = top
  if (bottom) out.bottom = bottom
  if (left) out.left = left
  if (right) out.right = right
  return Object.keys(out).length ? out : undefined
}

export function buildExactModel(pages: PageLines[]): WordModel {
  const { width, height } = pages[0]
  return {
    page: { width, height },
    exact: pages.map((page) => layoutPage(page))
  }
}

function layoutPage(page: PageLines): ExactPage {
  const images: ExactImage[] = page.lines
    .filter((l) => l.image)
    .map((l) => ({ ...l.image!, x: l.x, y: l.y }))
  let lines = page.lines.filter((l) => !l.image && l.cells.length > 0)
  const rules = [...page.rules].sort((a, b) => a.y - b.y)
  const used = new Set<Rule>()
  const blocks: ExactBlock[] = []
  /** Hasta dónde llega lo ya colocado (desde arriba de la hoja). La hoja empieza con un párrafo de 1 pt que sostiene las imágenes. */
  let cursor = 1

  const emitRule = (rule: Rule): void => {
    used.add(rule)
    const top = rule.y - 1 - rule.thickness / 2
    blocks.push({
      kind: 'rule',
      indentLeft: rule.x1,
      indentRight: Math.max(0, page.width - rule.x2),
      spaceBefore: Math.max(0, top - cursor),
      thickness: rule.thickness,
      color: rule.color
    })
    cursor = Math.max(cursor, top) + 1 + rule.thickness
  }
  const emitRulesAbove = (y: number): void => {
    for (const rule of rules) if (!used.has(rule) && rule.y < y) emitRule(rule)
  }

  /** ¿Hay una línea dibujada entre estas dos líneas de texto? */
  const ruleBetween = (a: Line, b: Line): boolean =>
    rules.some((r) => r.y > a.y + 0.2 * lineSize(a) && r.y < b.y - 0.6 * lineSize(b))

  const sameBold = (a: Line, b: Line): boolean =>
    !!a.cells[0].runs[0]?.bold === !!b.cells[0].runs[0]?.bold

  const centered = (l: Line): boolean =>
    Math.abs((l.x + l.xEnd) / 2 - page.width / 2) <= 2.5 && l.x > 20

  const canMerge = (a: Line, b: Line, pitch?: number): boolean => {
    if (a.cells.length !== 1 || b.cells.length !== 1) return false
    const s = lineSize(a)
    if (Math.abs(s - lineSize(b)) >= 0.6 || !sameBold(a, b)) return false
    const gap = b.y - a.y
    if (gap < 0.85 * s || gap > 1.8 * s) return false
    if (pitch !== undefined && Math.abs(gap - pitch) > 0.8) return false
    if (ruleBetween(a, b)) return false
    return centered(a) && centered(b)
      ? true
      : !centered(a) && !centered(b) && Math.abs(a.x - b.x) <= 1.2
  }

  const emitParagraph = (group: Line[]): void => {
    const first = group[0]
    const size = lineSize(first)
    const lineHeight =
      group.length > 1
        ? Math.min(
            2.5 * size,
            Math.max(0.9 * size, (group[group.length - 1].y - first.y) / (group.length - 1))
          )
        : LINE * size
    const top = first.y - baselineOffset(lineHeight, size)
    emitRulesAbove(first.y - 0.55 * size)
    const isCentered = centered(first)
    blocks.push({
      kind: 'paragraph',
      lines: group.map((l) => l.cells[0].runs),
      align: isCentered ? 'center' : 'left',
      indentLeft: isCentered ? 0 : first.x,
      lineHeight,
      spaceBefore: Math.max(0, top - cursor)
    })
    cursor = Math.max(cursor, top) + group.length * lineHeight
  }

  const emitTable = (rows: Line[]): void => {
    const sizes = rows.map(lineSize)
    const base = rows.map((r) => r.y)
    const heights = rows.map((_, r) => {
      const pitch = r < rows.length - 1 ? base[r + 1] - base[r] : LINE * sizes[r]
      return Math.min(LINE * sizes[r], Math.max(0.9 * sizes[r], pitch))
    })
    const tops = rows.map((_, r) => base[r] - baselineOffset(heights[r], sizes[r]))

    // Líneas del PDF que quedan dentro de la tabla: pasan a ser el borde de abajo de la fila que las tiene encima
    const lastIndex = rows.length - 1
    const inside = new Map<number, Rule>()
    for (const rule of rules) {
      if (used.has(rule)) continue
      let r = -1
      for (let k = 0; k < rows.length; k++) if (base[k] + 0.2 * sizes[k] < rule.y) r = k
      if (r < 0 || rule.y > base[lastIndex] + 0.8 * sizes[lastIndex]) continue
      inside.set(r, rule)
      used.add(rule)
    }
    emitRulesAbove(base[0] - 0.55 * sizes[0])

    // ----- Columnas -----
    const all = rows.flatMap((row, r) => row.cells.map((cell) => ({ cell, r })))
    const endGroups = new Map<number, number[]>()
    for (const { cell } of all) {
      const key = Math.round(cell.xEnd / 1.5)
      endGroups.set(key, [...(endGroups.get(key) ?? []), cell.x])
    }
    // Una columna de números alineados por la derecha: mismos finales, distintos inicios
    const alignOf = (cell: Cell): 'left' | 'right' => {
      const starts = endGroups.get(Math.round(cell.xEnd / 1.5)) ?? []
      return starts.length >= 2 && Math.max(...starts) - Math.min(...starts) > 2.5
        ? 'right'
        : 'left'
    }
    const tableLeft = Math.min(...all.map(({ cell }) => cell.x))
    const tableRight = Math.max(...all.map(({ cell }) => cell.xEnd))
    const rightTouches = all.some(
      ({ cell }) => alignOf(cell) === 'right' && Math.abs(cell.xEnd - tableRight) < 1.2
    )
    const anchors = [
      tableLeft,
      ...all.map(({ cell }) => (alignOf(cell) === 'left' ? cell.x : cell.xEnd)),
      rightTouches ? tableRight : tableRight + 8
    ].sort((a, b) => a - b)
    const clusterEdges = (values: number[]): number[] => {
      const sorted = [...values].sort((a, b) => a - b)
      const result: number[] = []
      let group: number[] = []
      for (const v of sorted) {
        if (group.length && v - group[0] >= 1) {
          result.push(group.reduce((a, b) => a + b, 0) / group.length)
          group = []
        }
        group.push(v)
      }
      result.push(group.reduce((a, b) => a + b, 0) / group.length)
      return result
    }
    let edges = clusterEdges(anchors)

    // Una celda a la izquierda seguida de una alineada a la derecha (por ejemplo "Total gravado ... 15,486.72"):
    // entre las dos hace falta una columna más. Se busca un punto que sirva para todas las filas parecidas.
    const nearestIn = (list: number[], v: number): number =>
      list.reduce((best, e, k) => (Math.abs(e - v) < Math.abs(list[best] - v) ? k : best), 0)
    const gaps = new Map<string, { lo: number; hi: number }>()
    const loose: number[] = []
    for (const row of rows) {
      for (let k = 0; k + 1 < row.cells.length; k++) {
        const a = row.cells[k]
        const b = row.cells[k + 1]
        if (alignOf(a) !== 'left' || alignOf(b) !== 'right') continue
        const key = `${nearestIn(edges, a.x)}|${nearestIn(edges, b.xEnd)}`
        const g = gaps.get(key) ?? { lo: -Infinity, hi: Infinity }
        g.lo = Math.max(g.lo, a.xEnd + 0.5)
        g.hi = Math.min(g.hi, b.x - 0.5)
        gaps.set(key, g)
      }
    }
    for (const g of gaps.values()) if (g.lo <= g.hi) loose.push((g.lo + g.hi) / 2)
    // Si no hay un punto común, cada fila pone el suyo (en el medio del hueco)
    for (const row of rows)
      for (let k = 0; k + 1 < row.cells.length; k++) {
        const a = row.cells[k]
        const b = row.cells[k + 1]
        if (alignOf(a) === 'left' && alignOf(b) === 'right') {
          const inCommon = loose.some((v) => v >= a.xEnd + 0.5 && v <= b.x - 0.5)
          if (!inCommon) loose.push((a.xEnd + b.x) / 2)
        }
      }
    edges = clusterEdges([...edges, ...loose])
    const nearest = (v: number): number =>
      edges.reduce((best, e, k) => (Math.abs(e - v) < Math.abs(edges[best] - v) ? k : best), 0)
    const lastCol = edges.length - 1

    // ----- Filas -----
    // Dónde termina cada fila: si el PDF tiene una línea ahí, justo en esa línea; si no, donde empieza la siguiente
    const ends = rows.map((_, r) => {
      const natural = r < lastIndex ? tops[r + 1] : tops[r] + heights[r]
      const rule = inside.get(r)
      return rule ? Math.max(rule.y, tops[r] + heights[r]) : Math.max(natural, tops[r] + heights[r])
    })
    const starts = rows.map((_, r) => (r === 0 ? tops[0] : ends[r - 1]))

    const outRows: ExactRow[] = []
    rows.forEach((row, r) => {
      const rule = inside.get(r)
      const height = ends[r] - starts[r]
      // Si la fila empieza antes de donde va su texto (porque arriba hay una línea), el espacio sobrante va arriba del texto
      const extraBefore = Math.max(0, tops[r] - starts[r])
      // Cada celda ocupa todo el hueco hasta la siguiente (no solo lo justo para el texto): así, si en otro programa
      // el texto sale un poco más ancho, no se parte en dos líneas.
      const aligns = row.cells.map(alignOf)
      const placed = row.cells.map((cell, k) => {
        const next = row.cells[k + 1]
        let s: number
        let e: number
        if (aligns[k] === 'left') {
          s = nearest(cell.x)
          if (!next) e = lastCol
          else if (aligns[k + 1] === 'left') e = nearest(next.x)
          else {
            // Justo antes de un número alineado a la derecha: el borde más cercano al número que no pise este texto
            e = -1
            for (let j = 0; j < edges.length; j++)
              if (edges[j] <= next.x + 0.5 && edges[j] >= cell.xEnd - 0.5) e = j
            if (e < 0) e = nearest(next.x)
          }
        } else {
          e = nearest(cell.xEnd)
          s = 0
        }
        return { cell, align: aligns[k], s, e }
      })
      // Las celdas alineadas a la derecha empiezan donde termina la anterior
      placed.forEach((p, k) => {
        if (p.align === 'right') p.s = k === 0 ? 0 : placed[k - 1].e
      })
      let cursorCol = 0
      for (const p of placed) {
        if (p.s < cursorCol) p.s = cursorCol
        if (p.e <= p.s) p.e = Math.min(lastCol, p.s + 1)
        cursorCol = p.e
      }

      const borderFor = (from: number, to: number): ExactCell['borders'] => {
        if (!rule) return undefined
        const overlap = Math.min(edges[to], rule.x2) - Math.max(edges[from], rule.x1)
        return overlap >= 0.5 * (edges[to] - edges[from])
          ? { bottom: { width: rule.thickness, color: rule.color } }
          : undefined
      }
      const shadeFor = (cell: Cell): string | undefined => {
        const cx = (cell.x + cell.xEnd) / 2
        const cy = row.y - 0.3 * sizes[r]
        const covering = fills.filter((f) => f.x1 <= cx && cx <= f.x2 && f.y1 <= cy && cy <= f.y2)
        covering.sort((a, b) => (a.x2 - a.x1) * (a.y2 - a.y1) - (b.x2 - b.x1) * (b.y2 - b.y1))
        return covering[0]?.color
      }

      const cells: ExactCell[] = []
      const filler = (from: number, to: number): void => {
        if (to > from)
          cells.push({
            span: to - from,
            lines: [],
            align: 'left',
            lineHeight: heights[r],
            spaceBefore: extraBefore,
            borders: borderFor(from, to)
          })
      }
      let at = 0
      for (const p of placed) {
        filler(at, p.s)
        cells.push({
          span: p.e - p.s,
          lines: [p.cell.runs],
          align: p.align,
          lineHeight: heights[r],
          spaceBefore:
            extraBefore +
            Math.max(
              0,
              baselineOffset(heights[r], sizes[r]) - baselineOffset(heights[r], cellSize(p.cell))
            ),
          borders: borderFor(p.s, p.e),
          shade: shadeFor(p.cell)
        })
        at = p.e
      }
      filler(at, lastCol)
      outRows.push({ height, cells })
    })

    const afterTable = blocks[blocks.length - 1]?.kind === 'table' ? 1 : 0
    blocks.push({
      kind: 'table',
      spaceBefore: Math.max(afterTable, tops[0] - cursor),
      x: edges[0],
      columns: edges.slice(1).map((v, k) => v - edges[k]),
      rows: outRows
    })
    cursor = Math.max(cursor, starts[0]) + outRows.reduce((sum, row) => sum + row.height, 0)
  }

  const fills: Fill[] = page.fills

  // ----- Tablas con bordes: el texto de cada celda sale de las líneas y va a su casilla -----
  interface Placed {
    grid: Grid
    content: Map<string, { line: Line; cell: Cell }[]>
  }
  const pendingGrids: Placed[] = []
  for (const grid of findGrids(page)) {
    const { xs, ys } = grid
    const content = new Map<string, { line: Line; cell: Cell }[]>()
    lines = lines.flatMap((line) => {
      const keep: Cell[] = []
      for (const cell of line.cells) {
        const x = cell.x + 0.5
        const y = line.y - 0.3 * cellSize(cell)
        const c = xs.findIndex((v, k) => k + 1 < xs.length && x >= v - 1 && x < xs[k + 1])
        const r = ys.findIndex((v, k) => k + 1 < ys.length && y >= v - 1 && y < ys[k + 1])
        if (c < 0 || r < 0) {
          keep.push(cell)
          continue
        }
        const key = `${r}:${c}`
        content.set(key, [...(content.get(key) ?? []), { line, cell }])
      }
      if (keep.length === line.cells.length) return [line]
      if (keep.length === 0) return []
      return [{ ...line, cells: keep, x: keep[0].x, xEnd: keep[keep.length - 1].xEnd }]
    })
    grid.hr.forEach((r) => used.add(r))
    pendingGrids.push({ grid, content })
  }

  const emitGrid = ({ grid, content }: Placed): void => {
    const { xs, ys } = grid
    const afterTable = blocks[blocks.length - 1]?.kind === 'table' ? 1 : 0
    const rows: ExactRow[] = []
    for (let r = 0; r + 1 < ys.length; r++) {
      const cells: ExactCell[] = []
      for (let c = 0; c + 1 < xs.length; c++) {
        const items = content.get(`${r}:${c}`) ?? []
        const base: ExactCell = {
          span: 1,
          lines: [],
          align: 'left',
          lineHeight: LINE * 8,
          spaceBefore: 0,
          borders: gridBorders(grid, r, c)
        }
        if (items.length === 0) {
          cells.push(base)
          continue
        }
        // Las líneas de texto de la casilla, de arriba hacia abajo
        const byLine = new Map<number, { line: Line; cells: Cell[] }>()
        for (const item of items) {
          const key = [...byLine.keys()].find(
            (y) => Math.abs(y - item.line.y) <= 0.4 * cellSize(item.cell)
          )
          const entry = byLine.get(key ?? item.line.y) ?? { line: item.line, cells: [] }
          entry.cells.push(item.cell)
          byLine.set(key ?? item.line.y, entry)
        }
        const textLines = [...byLine.entries()].sort((a, b) => a[0] - b[0])
        const size = Math.max(...items.map((i) => cellSize(i.cell)))
        const ys0 = textLines.map(([y]) => y)
        const pitch =
          ys0.length > 1 ? (ys0[ys0.length - 1] - ys0[0]) / (ys0.length - 1) : LINE * size
        const lineHeight = Math.min(2.5 * size, Math.max(0.9 * size, pitch))
        const runsOf = (cs: Cell[]): ExactCell['lines'][number] =>
          [...cs]
            .sort((a, b) => a.x - b.x)
            .flatMap((cell, k) => (k ? [{ ...cell.runs[0], text: ' ' }, ...cell.runs] : cell.runs))
        const minX = Math.min(...items.map((i) => i.cell.x))
        const maxX = Math.max(...items.map((i) => i.cell.xEnd))
        const marginLeft = Math.max(0, minX - xs[c])
        const marginRight = Math.max(0, xs[c + 1] - maxX)
        let align: ExactCell['align'] = 'left'
        if (marginLeft > 3 && Math.abs(marginLeft - marginRight) <= 2) align = 'center'
        else if (marginRight <= 3 && marginLeft > 6) align = 'right'
        cells.push({
          ...base,
          lines: textLines.map(([, entry]) => runsOf(entry.cells)),
          align,
          lineHeight,
          spaceBefore: Math.max(0, ys0[0] - baselineOffset(lineHeight, size) - ys[r]),
          marginLeft: align === 'left' ? marginLeft : align === 'right' ? 0 : 0,
          marginRight: align === 'right' ? marginRight : 0
        })
      }
      rows.push({ height: ys[r + 1] - ys[r], cells })
    }
    blocks.push({
      kind: 'table',
      spaceBefore: Math.max(afterTable, ys[0] - cursor),
      x: xs[0],
      columns: xs.slice(1).map((v, k) => v - xs[k]),
      rows
    })
    cursor = Math.max(cursor, ys[0]) + (ys[ys.length - 1] - ys[0])
  }
  /** Coloca las tablas con bordes que empiezan antes de la altura indicada */
  const emitGridsAbove = (y: number): void => {
    while (pendingGrids.length && pendingGrids[0].grid.ys[0] <= y) {
      emitRulesAbove(pendingGrids[0].grid.ys[0] - 0.5)
      emitGrid(pendingGrids.shift()!)
    }
  }

  // ----- Recorrido de arriba hacia abajo -----
  let i = 0
  while (i < lines.length) {
    emitGridsAbove(lines[i].y - 0.55 * lineSize(lines[i]))
    if (lines[i].cells.length >= 2) {
      let j = i
      while (j < lines.length && lines[j].cells.length >= 2) j++
      emitTable(lines.slice(i, j))
      i = j
    } else {
      let j = i + 1
      let pitch: number | undefined
      while (j < lines.length && canMerge(lines[j - 1], lines[j], pitch)) {
        pitch = lines[j].y - lines[j - 1].y
        j++
      }
      emitParagraph(lines.slice(i, j))
      i = j
    }
  }
  emitGridsAbove(Infinity)
  emitRulesAbove(Infinity)

  return { images, blocks }
}
