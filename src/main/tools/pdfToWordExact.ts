import {
  AlignmentType,
  BorderStyle,
  Document,
  HeightRule,
  HorizontalPositionRelativeFrom,
  ImageRun,
  LineRuleType,
  Paragraph,
  ShadingType,
  Table,
  TableBorders,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  TextWrappingType,
  VerticalAlign,
  VerticalPositionRelativeFrom,
  WidthType
} from 'docx'
import type {
  ExactBlock,
  ExactCell,
  ExactImage,
  ExactPage,
  WordModel,
  WordRun
} from '../../shared/types'

const twips = (points: number): number => Math.round(points * 20)
/** Las medidas de las imágenes en Word van en píxeles (96 por pulgada); las del PDF vienen en puntos (72) */
const PT_TO_PX = 96 / 72
const EMU_PER_PT = 12700
const hex = (color?: string): string | undefined => color?.replace('#', '').toUpperCase()
const NO_MARGINS = { marginUnitType: WidthType.DXA, top: 0, bottom: 0, left: 0, right: 0 } as const

/** Un párrafo vacío de alto exacto: sirve para dejar un espacio en blanco de la medida justa. */
function spacer(points: number): Paragraph {
  return new Paragraph({
    spacing: {
      before: 0,
      after: 0,
      line: Math.max(1, twips(points)),
      lineRule: LineRuleType.EXACT
    },
    run: { size: 2 }
  })
}

function textRuns(lines: WordRun[][]): TextRun[] {
  return lines.flatMap((runs, line) =>
    runs.map(
      (run, i) =>
        new TextRun({
          text: run.text,
          font: run.font,
          size: Math.round(run.size * 2),
          bold: run.bold,
          italics: run.italic,
          color: hex(run.color),
          scale: run.scale,
          characterSpacing: run.spacing ? Math.round(run.spacing * 20) : undefined,
          // Cada línea del PDF es un salto de línea dentro del mismo párrafo
          break: line > 0 && i === 0 ? 1 : undefined
        })
    )
  )
}

function image(img: ExactImage): ImageRun {
  return new ImageRun({
    type: img.format,
    data: Buffer.from(img.data, 'base64'),
    transformation: {
      width: Math.max(1, Math.round(img.width * PT_TO_PX)),
      height: Math.max(1, Math.round(img.height * PT_TO_PX))
    },
    // Anclada a la hoja, en el punto exacto donde estaba en el PDF
    floating: {
      horizontalPosition: {
        relative: HorizontalPositionRelativeFrom.PAGE,
        offset: Math.round(img.x * EMU_PER_PT)
      },
      verticalPosition: {
        relative: VerticalPositionRelativeFrom.PAGE,
        offset: Math.round(img.y * EMU_PER_PT)
      },
      allowOverlap: true,
      behindDocument: false,
      lockAnchor: true,
      wrap: { type: TextWrappingType.NONE }
    }
  })
}

const border = (b: {
  width: number
  color: string
}): { style: typeof BorderStyle.SINGLE; size: number; color: string } => ({
  style: BorderStyle.SINGLE,
  size: Math.min(96, Math.max(2, Math.round(b.width * 8))),
  color: hex(b.color) ?? '000000'
})

function tableCell(cell: ExactCell, width: number): TableCell {
  return new TableCell({
    columnSpan: cell.span > 1 ? cell.span : undefined,
    width: { size: width, type: WidthType.DXA },
    margins: {
      marginUnitType: WidthType.DXA,
      top: 0,
      bottom: 0,
      left: twips(cell.marginLeft ?? 0),
      right: twips(cell.marginRight ?? 0)
    },
    verticalAlign: VerticalAlign.TOP,
    borders: cell.borders
      ? Object.fromEntries(Object.entries(cell.borders).map(([side, b]) => [side, border(b)]))
      : undefined,
    shading: cell.shade
      ? { type: ShadingType.CLEAR, fill: hex(cell.shade), color: 'auto' }
      : undefined,
    children: [
      new Paragraph({
        alignment:
          cell.align === 'right'
            ? AlignmentType.RIGHT
            : cell.align === 'center'
              ? AlignmentType.CENTER
              : AlignmentType.LEFT,
        spacing: {
          before: twips(cell.spaceBefore),
          after: 0,
          line: twips(cell.lineHeight),
          lineRule: LineRuleType.EXACT
        },
        run: { size: 2 },
        children: textRuns(cell.lines)
      })
    ]
  })
}

function blockToElements(block: ExactBlock): (Paragraph | Table)[] {
  if (block.kind === 'paragraph') {
    return [
      new Paragraph({
        alignment: block.align === 'center' ? AlignmentType.CENTER : AlignmentType.LEFT,
        indent: block.indentLeft > 0 ? { left: twips(block.indentLeft) } : undefined,
        spacing: {
          before: twips(block.spaceBefore),
          after: 0,
          line: twips(block.lineHeight),
          lineRule: LineRuleType.EXACT
        },
        children: textRuns(block.lines)
      })
    ]
  }

  if (block.kind === 'rule') {
    // Una línea del PDF: un párrafo casi sin altura con borde abajo
    return [
      new Paragraph({
        indent: { left: twips(block.indentLeft), right: twips(block.indentRight) },
        spacing: {
          before: twips(block.spaceBefore),
          after: 0,
          line: 20,
          lineRule: LineRuleType.EXACT
        },
        border: { bottom: { ...border({ width: block.thickness, color: block.color }), space: 0 } },
        run: { size: 2 }
      })
    ]
  }

  const widths = block.columns.map(twips)
  const elements: (Paragraph | Table)[] = []
  // Una tabla no tiene "espacio arriba": se deja con un párrafo vacío de la medida justa
  if (block.spaceBefore >= 0.05) elements.push(spacer(block.spaceBefore))
  elements.push(
    new Table({
      indent: { size: twips(block.x), type: WidthType.DXA },
      width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
      columnWidths: widths,
      layout: TableLayoutType.FIXED,
      borders: TableBorders.NONE,
      margins: NO_MARGINS,
      rows: block.rows.map(
        (row) =>
          new TableRow({
            height: { value: twips(row.height), rule: HeightRule.EXACT },
            cantSplit: true,
            children: (() => {
              let column = 0
              return row.cells.map((cell) => {
                const width = widths.slice(column, column + cell.span).reduce((a, b) => a + b, 0)
                column += cell.span
                return tableCell(cell, width)
              })
            })()
          })
      )
    })
  )
  return elements
}

function pageElements(page: ExactPage, index: number, isLast: boolean): (Paragraph | Table)[] {
  const elements: (Paragraph | Table)[] = [
    // Primer párrafo de cada hoja (de 1 pt): salta de página y sostiene las imágenes
    new Paragraph({
      pageBreakBefore: index > 0,
      spacing: { before: 0, after: 0, line: 20, lineRule: LineRuleType.EXACT },
      run: { size: 2 },
      children: page.images.map(image)
    })
  ]
  for (const block of page.blocks) elements.push(...blockToElements(block))
  // Un documento no puede terminar en una tabla
  if (isLast && page.blocks[page.blocks.length - 1]?.kind === 'table') elements.push(spacer(0.05))
  return elements
}

/** Arma el documento del modo "idéntico al PDF": todo con márgenes en cero y cada cosa en su posición. */
export function buildExactDocument(model: WordModel): Document {
  const pages = model.exact ?? []
  const { page } = model
  return new Document({
    styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
    sections: [
      {
        properties: {
          page: {
            size: { width: twips(page.width), height: twips(page.height) },
            margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0 }
          }
        },
        children: pages.flatMap((p, i) => pageElements(p, i, i === pages.length - 1))
      }
    ]
  })
}
