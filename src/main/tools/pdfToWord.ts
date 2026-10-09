import {
  AlignmentType,
  Document,
  Footer,
  Header,
  PageNumber,
  Packer,
  Paragraph,
  Tab,
  TabStopType,
  TextRun
} from 'docx'
import { writeFileSync } from 'fs'
import { handle } from '../ipc'
import { UserError } from '../jobs'
import { nameOf, outputDir, uniquePath } from '../paths'
import { PAGE_NUMBER_TOKEN, type WordModel, type WordParagraph } from '../../shared/types'

const twips = (points: number): number => Math.round(points * 20)

const ALIGN = {
  left: AlignmentType.LEFT,
  center: AlignmentType.CENTER,
  right: AlignmentType.RIGHT
} as const

function toParagraph(p: WordParagraph): Paragraph {
  return new Paragraph({
    alignment: ALIGN[p.align],
    indent: p.indentLeft > 0 ? { left: twips(p.indentLeft) } : undefined,
    spacing: { after: twips(p.spacingAfter) },
    tabStops: p.tabStops.map((position) => ({ type: TabStopType.LEFT, position: twips(position) })),
    pageBreakBefore: p.pageBreakBefore,
    children: p.runs.flatMap((run) => {
      const style = {
        font: run.font,
        size: Math.round(run.size * 2),
        bold: run.bold,
        italics: run.italic
      }
      // Los tabuladores y el número de página son "piezas" especiales dentro del texto
      return run.text.split('\t').flatMap((chunk, i) => {
        const pieces: TextRun[] = []
        if (i > 0) pieces.push(new TextRun({ ...style, children: [new Tab()] }))
        chunk.split(PAGE_NUMBER_TOKEN).forEach((text, j) => {
          if (j > 0) pieces.push(new TextRun({ ...style, children: [PageNumber.CURRENT] }))
          if (text) pieces.push(new TextRun({ ...style, text }))
        })
        return pieces
      })
    })
  })
}

export function registerPdfToWordTools(): void {
  /** La ventana lee el PDF y manda su estructura; aquí se escribe el archivo .docx */
  handle('pdf:toWord', async (_e, p: { input: string; model: WordModel }) => {
    const { page, paragraphs, header, footer } = p.model
    if (paragraphs.length === 0) throw new UserError('No se encontró texto en el PDF.')
    const doc = new Document({
      styles: { default: { document: { run: { font: 'Calibri', size: 22 } } } },
      sections: [
        {
          properties: {
            page: {
              size: { width: twips(page.width), height: twips(page.height) },
              margin: {
                top: twips(page.margin.top),
                right: twips(page.margin.right),
                bottom: twips(page.margin.bottom),
                left: twips(page.margin.left),
                header: twips(page.margin.header),
                footer: twips(page.margin.footer)
              }
            }
          },
          headers: header.length
            ? { default: new Header({ children: header.map(toParagraph) }) }
            : undefined,
          footers: footer.length
            ? { default: new Footer({ children: footer.map(toParagraph) }) }
            : undefined,
          children: paragraphs.map(toParagraph)
        }
      ]
    })
    const output = uniquePath(outputDir(), nameOf(p.input), '.docx')
    writeFileSync(output, await Packer.toBuffer(doc))
    return { output }
  })
}
