import { ImageKind, OPS, Util } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { PDFPageProxy } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { WordImage, WordRun } from '../../../shared/types'
import { naturalWidth } from './textMetrics'

export interface Cell {
  x: number
  xEnd: number
  runs: WordRun[]
}

export interface Line {
  y: number
  x: number
  xEnd: number
  text: string
  /** Texto separado en celdas: un hueco grande entre dos textos empieza una celda nueva */
  cells: Cell[]
  /** Altura donde termina la línea (en una imagen, su borde de abajo) */
  yEnd: number
  /** Si es una imagen en vez de texto */
  image?: WordImage
}

/** Una línea horizontal (o fila muy fina) dibujada en la página */
export interface Rule {
  x1: number
  x2: number
  y: number
  thickness: number
  /** Color en hexadecimal, por ejemplo "#000000" */
  color: string
}

/** Una línea vertical dibujada en la página */
export interface VRule {
  x: number
  y1: number
  y2: number
  thickness: number
  color: string
}

/** Un rectángulo con relleno de color */
export interface Fill {
  x1: number
  y1: number
  x2: number
  y2: number
  color: string
}

export interface PageLines {
  width: number
  height: number
  lines: Line[]
  rules: Rule[]
  vrules: VRule[]
  fills: Fill[]
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

export const sameStyle = (a: WordRun, b: WordRun): boolean =>
  a.font === b.font &&
  a.size === b.size &&
  a.bold === b.bold &&
  a.italic === b.italic &&
  a.color === b.color &&
  a.scale === b.scale

/** Igual que sameStyle, pero también el espacio entre letras (para las celdas del modo "idéntico") */
const sameLook = (a: WordRun, b: WordRun): boolean =>
  sameStyle(a, b) && Math.abs((a.spacing ?? 0) - (b.spacing ?? 0)) < 0.06

/** Cantidad máxima de imágenes por página (algunos PDFs cortan una imagen en decenas de tiras) */
const MAX_IMAGES_PER_PAGE = 30
/** Las imágenes se reducen a este lado máximo en píxeles, para que el Word no pese demasiado */
const MAX_IMAGE_SIDE = 1400

type PdfImage = {
  width: number
  height: number
  kind?: number
  data?: Uint8ClampedArray
  bitmap?: ImageBitmap
}

/** Convierte una imagen de pdfjs en PNG (si tiene transparencia) o JPG, reducida si es muy grande. */
function encodeImage(img: PdfImage): Omit<WordImage, 'width' | 'height'> | null {
  const { width, height } = img
  if (!width || !height) return null

  const source = document.createElement('canvas')
  source.width = width
  source.height = height
  const sctx = source.getContext('2d', { willReadFrequently: true })!
  if (img.bitmap) {
    sctx.drawImage(img.bitmap, 0, 0)
  } else if (img.data) {
    const rgba = new ImageData(width, height)
    const out = rgba.data
    const src = img.data
    if (img.kind === ImageKind.RGBA_32BPP && src.length >= width * height * 4) {
      out.set(src.subarray(0, width * height * 4))
    } else if (img.kind === ImageKind.RGB_24BPP && src.length >= width * height * 3) {
      for (let i = 0, j = 0; i < width * height; i++, j += 3) {
        out[i * 4] = src[j]
        out[i * 4 + 1] = src[j + 1]
        out[i * 4 + 2] = src[j + 2]
        out[i * 4 + 3] = 255
      }
    } else if (img.kind === ImageKind.GRAYSCALE_1BPP) {
      const rowBytes = (width + 7) >> 3
      for (let y = 0; y < height; y++)
        for (let x = 0; x < width; x++) {
          const bit = (src[y * rowBytes + (x >> 3)] >> (7 - (x & 7))) & 1
          const o = (y * width + x) * 4
          out[o] = out[o + 1] = out[o + 2] = bit ? 255 : 0
          out[o + 3] = 255
        }
    } else {
      return null
    }
    sctx.putImageData(rgba, 0, 0)
  } else {
    return null
  }

  const scale = Math.min(1, MAX_IMAGE_SIDE / Math.max(width, height))
  const target = document.createElement('canvas')
  target.width = Math.max(1, Math.round(width * scale))
  target.height = Math.max(1, Math.round(height * scale))
  const tctx = target.getContext('2d', { willReadFrequently: true })!
  tctx.drawImage(source, 0, 0, target.width, target.height)

  // Con transparencia se guarda PNG; si no, JPG (pesa mucho menos)
  const pixels = tctx.getImageData(0, 0, target.width, target.height).data
  let transparent = false
  for (let i = 3; i < pixels.length; i += 4)
    if (pixels[i] < 250) {
      transparent = true
      break
    }
  const url = transparent ? target.toDataURL('image/png') : target.toDataURL('image/jpeg', 0.88)
  return { data: url.split(',')[1], format: transparent ? 'png' : 'jpg' }
}

/** Pide a pdfjs los datos de una imagen (los entrega de forma asíncrona, apenas los termina de procesar). */
function readImage(page: PDFPageProxy, id: string): Promise<PdfImage | null> {
  return new Promise((resolve) => {
    const timer = setTimeout(() => resolve(null), 5000)
    try {
      const store = id.startsWith('g_') ? page.commonObjs : page.objs
      store.get(id, (image: unknown) => {
        clearTimeout(timer)
        resolve(image as PdfImage)
      })
    } catch {
      clearTimeout(timer)
      resolve(null)
    }
  })
}

/** Busca las imágenes dibujadas en la página, con su posición (sin las muy chicas ni las que son el fondo de toda la página). */
async function findImages(
  page: PDFPageProxy,
  opList: Awaited<ReturnType<PDFPageProxy['getOperatorList']>>,
  viewport: ReturnType<PDFPageProxy['getViewport']>,
  cache: Map<string, Omit<WordImage, 'width' | 'height'> | null>
): Promise<Line[]> {
  let ctm = [1, 0, 0, 1, 0, 0]
  const stack: number[][] = []
  const found: { id: string; inline: PdfImage | null; box: [number, number, number, number] }[] = []

  opList.fnArray.forEach((fn, i) => {
    const args = opList.argsArray[i] as unknown[]
    if (fn === OPS.save) stack.push(ctm)
    else if (fn === OPS.restore) ctm = stack.pop() ?? ctm
    else if (fn === OPS.transform) ctm = Util.transform(ctm, args as number[]) as number[]
    else if (fn === OPS.paintFormXObjectBegin) {
      stack.push(ctm)
      if (Array.isArray(args[0])) ctm = Util.transform(ctm, args[0] as number[]) as number[]
    } else if (fn === OPS.paintFormXObjectEnd) ctm = stack.pop() ?? ctm
    else if (fn === OPS.paintImageXObject || fn === OPS.paintInlineImageXObject) {
      const m = Util.transform(viewport.transform, ctm) as number[]
      // Imágenes giradas: no se soportan
      if (Math.abs(m[1]) + Math.abs(m[2]) > 0.1 * (Math.abs(m[0]) + Math.abs(m[3]))) return
      const xs = [m[4], m[4] + m[0], m[4] + m[2], m[4] + m[0] + m[2]]
      const ys = [m[5], m[5] + m[1], m[5] + m[3], m[5] + m[1] + m[3]]
      const box: [number, number, number, number] = [
        Math.min(...xs),
        Math.min(...ys),
        Math.max(...xs),
        Math.max(...ys)
      ]
      const inline = fn === OPS.paintInlineImageXObject
      found.push({
        id: inline ? `inline-${i}` : String(args[0]),
        inline: inline ? (args[0] as PdfImage) : null,
        box
      })
    }
  })

  const pageArea = viewport.width * viewport.height
  const seen = new Set<string>()
  const lines: Line[] = []
  const candidates = found
    .map((f) => ({ ...f, w: f.box[2] - f.box[0], h: f.box[3] - f.box[1] }))
    .filter((f) => f.w >= 12 && f.h >= 12 && f.w * f.h < pageArea * 0.7)
    .sort((a, b) => b.w * b.h - a.w * a.h)
    .slice(0, MAX_IMAGES_PER_PAGE)

  for (const f of candidates) {
    const key = `${f.id}@${Math.round(f.box[0])},${Math.round(f.box[1])}`
    if (seen.has(key)) continue
    seen.add(key)
    if (!cache.has(f.id)) {
      const image = f.inline ?? (await readImage(page, f.id))
      cache.set(f.id, image ? encodeImage(image) : null)
    }
    const encoded = cache.get(f.id)
    if (!encoded) continue
    lines.push({
      y: f.box[1],
      yEnd: f.box[3],
      x: f.box[0],
      xEnd: f.box[2],
      text: '',
      cells: [],
      image: { ...encoded, width: f.w, height: f.h }
    })
  }
  return lines
}

/** Convierte un color de pdfjs ("#rrggbb") y dice si es casi blanco */
const isWhite = (hex: string): boolean => {
  const n = parseInt(hex.slice(1), 16)
  if (Number.isNaN(n)) return true
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255]
  return (r + g + b) / 3 > 247
}

interface GraphicsState {
  ctm: number[]
  fill: string
  stroke: string
  lineWidth: number
}

/** Cuántos puntos de la ruta (moveTo = 0, lineTo = 1, curva = 2 o 3, cerrar = 4) ocupa cada operación */
const PATH_ARGS: Record<number, number> = { 0: 2, 1: 2, 2: 6, 3: 4, 4: 0 }

/** Une los tramos de una misma línea (las tablas suelen dibujar un tramo por columna) y los dibujados dos veces casi igual. */
function mergeRules(rules: Rule[]): Rule[] {
  const sorted = [...rules].sort((a, b) => a.y - b.y || a.x1 - b.x1)
  const out: Rule[] = []
  for (const rule of sorted) {
    const same = out.find(
      (o) =>
        o.color === rule.color &&
        Math.abs(o.y - rule.y) <= 1 &&
        rule.x1 <= o.x2 + 1.5 &&
        rule.x2 >= o.x1 - 1.5
    )
    if (same) {
      same.x1 = Math.min(same.x1, rule.x1)
      same.x2 = Math.max(same.x2, rule.x2)
      same.thickness = Math.max(same.thickness, rule.thickness)
    } else out.push({ ...rule })
  }
  return out.sort((a, b) => a.y - b.y)
}

/** Igual que mergeRules, para líneas verticales */
function mergeVRules(rules: VRule[]): VRule[] {
  const sorted = [...rules].sort((a, b) => a.x - b.x || a.y1 - b.y1)
  const out: VRule[] = []
  for (const rule of sorted) {
    const same = out.find(
      (o) =>
        o.color === rule.color &&
        Math.abs(o.x - rule.x) <= 1 &&
        rule.y1 <= o.y2 + 1.5 &&
        rule.y2 >= o.y1 - 1.5
    )
    if (same) {
      same.y1 = Math.min(same.y1, rule.y1)
      same.y2 = Math.max(same.y2, rule.y2)
      same.thickness = Math.max(same.thickness, rule.thickness)
    } else out.push({ ...rule })
  }
  return out.sort((a, b) => a.x - b.x)
}

/** Lee las líneas y los rellenos de color que dibuja la página (rectángulos y trazos rectos). */
function findGraphics(
  opList: Awaited<ReturnType<PDFPageProxy['getOperatorList']>>,
  viewport: ReturnType<PDFPageProxy['getViewport']>
): { rules: Rule[]; vrules: VRule[]; fills: Fill[] } {
  let state: GraphicsState = {
    ctm: [1, 0, 0, 1, 0, 0],
    fill: '#000000',
    stroke: '#000000',
    lineWidth: 1
  }
  const stack: GraphicsState[] = []
  const rules: Rule[] = []
  const vrules: VRule[] = []
  const fills: Fill[] = []
  const pageArea = viewport.width * viewport.height

  const addRect = (x1: number, y1: number, x2: number, y2: number, color: string): void => {
    const w = x2 - x1
    const h = y2 - y1
    if (isWhite(color)) return
    if (w >= 8 && h <= 2.5)
      rules.push({ x1, x2, y: (y1 + y2) / 2, thickness: Math.max(0.4, h), color })
    else if (w <= 2.5 && h >= 8)
      vrules.push({ x: (x1 + x2) / 2, y1, y2, thickness: Math.max(0.4, w), color })
    else if (w >= 4 && h >= 4 && w * h < pageArea * 0.85) fills.push({ x1, y1, x2, y2, color })
  }

  opList.fnArray.forEach((fn, i) => {
    const args = opList.argsArray[i] as unknown[]
    if (fn === OPS.save) stack.push({ ...state })
    else if (fn === OPS.restore) state = stack.pop() ?? state
    else if (fn === OPS.transform)
      state.ctm = Util.transform(state.ctm, args as number[]) as number[]
    else if (fn === OPS.paintFormXObjectBegin) {
      stack.push({ ...state })
      if (Array.isArray(args[0]))
        state.ctm = Util.transform(state.ctm, args[0] as number[]) as number[]
    } else if (fn === OPS.paintFormXObjectEnd) state = stack.pop() ?? state
    else if (fn === OPS.setFillRGBColor) state.fill = String(args[0])
    else if (fn === OPS.setStrokeRGBColor) state.stroke = String(args[0])
    else if (fn === OPS.setLineWidth) state.lineWidth = Number(args[0])
    else if (fn === OPS.constructPath) {
      const paint = args[0] as number
      const isFill =
        paint === OPS.fill ||
        paint === OPS.eoFill ||
        paint === OPS.fillStroke ||
        paint === OPS.eoFillStroke ||
        paint === OPS.closeFillStroke ||
        paint === OPS.closeEOFillStroke
      const isStroke =
        paint === OPS.stroke ||
        paint === OPS.closeStroke ||
        paint === OPS.fillStroke ||
        paint === OPS.eoFillStroke ||
        paint === OPS.closeFillStroke ||
        paint === OPS.closeEOFillStroke
      if (!isFill && !isStroke) return // recortes y rutas sin pintar
      const m = Util.transform(viewport.transform, state.ctm) as number[]
      const map = (x: number, y: number): [number, number] => [
        m[0] * x + m[2] * y + m[4],
        m[1] * x + m[3] * y + m[5]
      ]
      const data = Array.from((args[1] as ArrayLike<number>[])[0] ?? [])

      // Se separa la ruta en subrutas de puntos (las curvas se ignoran)
      const subpaths: [number, number][][] = []
      let current: [number, number][] = []
      let curved = false
      for (let k = 0; k < data.length;) {
        const op = data[k++]
        const n = PATH_ARGS[op] ?? 0
        if (op === 0) {
          if (current.length) subpaths.push(current)
          current = [map(data[k], data[k + 1])]
        } else if (op === 1) current.push(map(data[k], data[k + 1]))
        else if (op === 2 || op === 3) curved = true
        k += n
      }
      if (current.length) subpaths.push(current)
      if (curved) return

      for (const pts of subpaths) {
        const xs = pts.map((p) => p[0])
        const ys = pts.map((p) => p[1])
        const x1 = Math.min(...xs)
        const x2 = Math.max(...xs)
        const y1 = Math.min(...ys)
        const y2 = Math.max(...ys)
        const onCorners = pts.every(
          (p) =>
            (Math.abs(p[0] - x1) < 0.3 || Math.abs(p[0] - x2) < 0.3) &&
            (Math.abs(p[1] - y1) < 0.3 || Math.abs(p[1] - y2) < 0.3)
        )
        if (pts.length >= 4 && onCorners && isFill) addRect(x1, y1, x2, y2, state.fill)
        // Un trazo recto horizontal es una línea con el grosor del trazo
        if (isStroke && pts.length === 2 && Math.abs(pts[0][0] - pts[1][0]) < 0.3 && y2 - y1 >= 8) {
          const thickness = Math.max(0.4, Math.abs(state.lineWidth * m[0]))
          if (!isWhite(state.stroke))
            vrules.push({ x: pts[0][0], y1, y2, thickness, color: state.stroke })
        }
        if (isStroke && pts.length === 2 && Math.abs(pts[0][1] - pts[1][1]) < 0.3 && x2 - x1 >= 8) {
          const thickness = Math.max(0.4, Math.abs(state.lineWidth * m[3]))
          if (!isWhite(state.stroke))
            rules.push({ x1, x2, y: pts[0][1], thickness, color: state.stroke })
        }
      }
    }
  })

  // Se descartan los duplicados exactos (algunos PDFs dibujan lo mismo dos veces)
  const unique = <T extends object>(list: T[]): T[] => {
    const seen = new Set<string>()
    return list.filter((item) => {
      const key = Object.values(item)
        .map((v) => (typeof v === 'number' ? Math.round(v * 2) : v))
        .join('|')
      return !seen.has(key) && !!seen.add(key)
    })
  }
  return {
    rules: mergeRules(unique(rules)),
    vrules: mergeVRules(unique(vrules)),
    fills: unique(fills)
  }
}

/**
 * Color de los textos. pdfjs no lo da junto con el texto, así que se anota el color y el origen de cada
 * operación de dibujar texto y luego se busca la más cercana en la misma línea.
 */
function findTextColors(
  opList: Awaited<ReturnType<PDFPageProxy['getOperatorList']>>,
  viewport: ReturnType<PDFPageProxy['getViewport']>
): { x: number; y: number; color: string }[] {
  let ctm = [1, 0, 0, 1, 0, 0]
  let fill = '#000000'
  const stack: { ctm: number[]; fill: string }[] = []
  let tlm = [1, 0, 0, 1, 0, 0]
  let leading = 0
  /** Después de mostrar texto no se sabe dónde termina, hasta que se reposiciona */
  let known = false
  const anchors: { x: number; y: number; color: string }[] = []

  const move = (tx: number, ty: number): void => {
    tlm = [
      tlm[0],
      tlm[1],
      tlm[2],
      tlm[3],
      tlm[0] * tx + tlm[2] * ty + tlm[4],
      tlm[1] * tx + tlm[3] * ty + tlm[5]
    ]
    known = true
  }
  const show = (): void => {
    if (known) {
      const m = Util.transform(Util.transform(viewport.transform, ctm), tlm) as number[]
      anchors.push({ x: m[4], y: m[5], color: fill })
    }
    known = false
  }

  opList.fnArray.forEach((fn, i) => {
    const args = opList.argsArray[i] as number[]
    if (fn === OPS.save) stack.push({ ctm, fill })
    else if (fn === OPS.restore) ({ ctm, fill } = stack.pop() ?? { ctm, fill })
    else if (fn === OPS.transform) ctm = Util.transform(ctm, args) as number[]
    else if (fn === OPS.paintFormXObjectBegin) {
      stack.push({ ctm, fill })
      if (Array.isArray(args[0])) ctm = Util.transform(ctm, args[0] as number[]) as number[]
    } else if (fn === OPS.paintFormXObjectEnd) ({ ctm, fill } = stack.pop() ?? { ctm, fill })
    else if (fn === OPS.setFillRGBColor) fill = String(args[0])
    else if (fn === OPS.beginText) {
      tlm = [1, 0, 0, 1, 0, 0]
      known = true
    } else if (fn === OPS.setTextMatrix) {
      // pdfjs la entrega como un arreglo tipado dentro de otro arreglo
      tlm = Array.from((ArrayBuffer.isView(args[0]) ? args[0] : args) as ArrayLike<number>)
      known = true
    } else if (fn === OPS.moveText) move(args[0], args[1])
    else if (fn === OPS.setLeadingMoveText) {
      leading = -args[1]
      move(args[0], args[1])
    } else if (fn === OPS.setLeading) leading = args[0]
    else if (fn === OPS.nextLine) move(0, -leading)
    else if (fn === OPS.showText || fn === OPS.showSpacedText) show()
    else if (fn === OPS.nextLineShowText || fn === OPS.nextLineSetSpacingShowText) {
      move(0, -leading)
      show()
    }
  })
  return anchors
}

/**
 * pdfjs borra los guiones "suaves" (U+00AD) del texto, pero algunos PDFs los dibujan como guiones visibles
 * (por ejemplo en "MH-DGT-RES-0027-2024"). Se leen de los glifos que se dibujan y se devuelven a su lugar.
 */
function findSoftHyphens(
  opList: Awaited<ReturnType<PDFPageProxy['getOperatorList']>>
): [string, string][] {
  const fixes: [string, string][] = []
  const clean = (text: string): string => text.replace(/\u00a0/g, ' ').trim()
  opList.fnArray.forEach((fn, i) => {
    if (fn !== OPS.showText && fn !== OPS.showSpacedText) return
    const glyphs = ((opList.argsArray[i] as unknown[][])[0] ?? []).filter(
      (g): g is { unicode?: string } => typeof g === 'object' && g !== null
    )
    const text = glyphs.map((g) => g.unicode ?? '').join('')
    if (!text.includes('\u00ad')) return
    fixes.push([clean(text.replace(/\u00ad/g, '')), clean(text.replace(/\u00ad/g, '-'))])
  })
  return fixes
}

export async function readPage(
  page: PDFPageProxy,
  imageCache: Map<string, Omit<WordImage, 'width' | 'height'> | null>
): Promise<PageLines> {
  const viewport = page.getViewport({ scale: 1 })
  const opList = await page.getOperatorList() // también carga las letras, para poder leer sus nombres
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
  const softHyphens = findSoftHyphens(opList)
  const restoreHyphens = (text: string): string => {
    for (const [from, to] of softHyphens)
      if (from && text.includes(from)) return text.replace(from, to)
    return text
  }
  const colors = findTextColors(opList, viewport)
  /** El color de la operación de texto que empieza justo antes (en la misma línea) */
  const colorAt = (x: number, y: number, size: number): string | undefined => {
    let best: { x: number; color: string } | undefined
    for (const a of colors)
      if (Math.abs(a.y - y) <= Math.max(1, size * 0.25) && a.x <= x + 1 && (!best || a.x > best.x))
        best = a
    return best && best.color !== '#000000' ? best.color : undefined
  }
  for (const raw of content.items) {
    // pdfjs usa ítems con solo espacios para representar huecos: el hueco se calcula con las posiciones
    if (!('str' in raw) || raw.str.trim().length === 0) continue
    const t = Util.transform(viewport.transform, raw.transform) as number[]
    // Tamaño real de la letra (vertical) y cuánto está comprimida o estirada a lo ancho (algunos PDFs lo hacen)
    const across = Math.hypot(t[0], t[1])
    const size = Math.hypot(t[2], t[3])
    if (size < 1 || across < 1 || Math.abs(t[1]) > across * 0.3) continue // texto girado (marcas de agua, etc.)
    const squeeze = across / size
    const text = restoreHyphens(raw.str)
    const info = fontInfo(page, raw.fontName)
    // Espacio extra entre letras: lo que le falta o le sobra al texto para medir lo mismo que en el PDF
    const scale = Math.abs(squeeze - 1) > 0.015 ? Math.round(squeeze * 100) : undefined
    const natural = naturalWidth(text, info.family, size, info.bold, info.italic)
    const extra =
      natural === null || text.length < 2
        ? 0
        : (raw.width - natural * (scale ? scale / 100 : 1)) / text.length
    const spacing =
      Math.abs(extra) < 0.04 || Math.abs(extra) > size * 0.5
        ? undefined
        : Math.round(extra * 20) / 20
    items.push({
      text,
      x: t[4],
      y: t[5],
      width: raw.width,
      size,
      run: {
        font: info.family,
        size: Math.round(size * 2) / 2,
        bold: info.bold,
        italic: info.italic,
        color: colorAt(t[4], t[5], size),
        spacing,
        scale
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

  /** Arma una línea de texto dividida en celdas. */
  const assemble = (group: Item[]): Line => {
    group.sort((a, b) => a.x - b.x)
    // Un hueco mayor a ~1.2 veces el tamaño de la letra empieza una celda nueva
    const cells: Cell[] = []
    let current: Cell | null = null
    let end = group[0].x
    for (const item of group) {
      const gap = item.x - end
      if (!current || gap > item.size * 1.2) {
        current = { x: item.x, xEnd: item.x + item.width, runs: [] }
        cells.push(current)
      } else {
        const tail = current.runs[current.runs.length - 1]
        if (gap > item.size * 0.12 && !tail.text.endsWith(' ') && !item.text.startsWith(' '))
          tail.text += ' '
      }
      const tail = current.runs[current.runs.length - 1]
      if (tail && sameLook(tail, { ...item.run, text: '' })) tail.text += item.text
      else current.runs.push({ ...item.run, text: item.text })
      current.xEnd = item.x + item.width
      end = current.xEnd
    }
    // Los espacios de los bordes de la celda no cuentan para su posición
    for (const cell of cells) {
      const first = cell.runs[0]
      const lastRun = cell.runs[cell.runs.length - 1]
      const lead = first.text.length - first.text.trimStart().length
      cell.x += lead * first.size * 0.278
      first.text = first.text.trimStart()
      const trail = lastRun.text.length - lastRun.text.trimEnd().length
      cell.xEnd -= trail * lastRun.size * 0.278
      lastRun.text = lastRun.text.trimEnd()
    }
    return {
      y: group[0].y,
      x: cells[0].x,
      xEnd: cells[cells.length - 1].xEnd,
      text: cells.map((c) => c.runs.map((r) => r.text).join('')).join(' '),
      cells,
      yEnd: group[0].y
    }
  }

  const lines: Line[] = groups
    .map(assemble)
    .filter((line) => line.text.trim().length > 0)
    .concat(await findImages(page, opList, viewport, imageCache))
    .sort((a, b) => a.y - b.y)

  const { rules, vrules, fills } = findGraphics(opList, viewport)
  return { width: viewport.width, height: viewport.height, lines, rules, vrules, fills }
}
