import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import type { PDFDocumentLoadingTask, PDFDocumentProxy } from 'pdfjs-dist/types/src/display/api'
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url'
import { createHiddenIframe, scheduleIframeCleanup, triggerIframePrint, waitForIframeLoad } from '../dom'
import type { PatternPrintContext, PatternPrintHandler, PatternPrintMeta } from '../types'

GlobalWorkerOptions.workerSrc = workerSrc

const PDF_EXTENSIONS = new Set(['pdf'])
const PDF_MIME_TYPES = new Set(['application/pdf'])

const toLower = (value?: string) => value?.toLowerCase()

export class PdfJsPrintHandler implements PatternPrintHandler {
  canHandle(meta: PatternPrintMeta): boolean {
    const matchesExtension = meta.extension ? PDF_EXTENSIONS.has(toLower(meta.extension) ?? '') : false
    const matchesMime = meta.mimeType ? PDF_MIME_TYPES.has(toLower(meta.mimeType) ?? '') : false
    return matchesExtension || matchesMime
  }

  async print({ blob, fileName, scale }: PatternPrintContext): Promise<void> {
    const iframe = createHiddenIframe()
    let loadingTask: PDFDocumentLoadingTask | null = null

    try {
      const pdfResult = await this.loadPdf(blob)
      loadingTask = pdfResult.loadingTask
      const ready = waitForIframeLoad(iframe)
      iframe.srcdoc = this.buildDocument(fileName)
      await ready

      const targetDocument = iframe.contentDocument
      if (!targetDocument) {
        throw new Error('Druckdokument konnte nicht erstellt werden.')
      }
      const container = targetDocument.getElementById('pdf-pages')
      if (!container) {
        throw new Error('Die Druckansicht konnte nicht initialisiert werden.')
      }

      await this.renderPdf(pdfResult.pdf, container, scale)
      triggerIframePrint(iframe)
    } finally {
      if (loadingTask) {
        await loadingTask.destroy()
      }
      scheduleIframeCleanup(iframe, 4000)
    }
  }

  private async loadPdf(blob: Blob): Promise<{ pdf: PDFDocumentProxy; loadingTask: PDFDocumentLoadingTask }> {
    const data = await blob.arrayBuffer()
    const loadingTask = getDocument({ data })
    const pdf = await loadingTask.promise
    return { pdf, loadingTask }
  }

  private async renderPdf(pdf: PDFDocumentProxy, container: HTMLElement, scale?: number) {
    const normalizedScale = this.normalizeScale(scale)
    container.replaceChildren()
    const doc = container.ownerDocument ?? document

    for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
      const page = await pdf.getPage(pageNumber)
      const viewport = page.getViewport({ scale: normalizedScale })
      const canvas = doc.createElement('canvas')
      canvas.width = viewport.width
      canvas.height = viewport.height
      canvas.className = 'pdf-canvas'
      canvas.style.width = `${viewport.width}px`
      canvas.style.height = `${viewport.height}px`
      const context = canvas.getContext('2d', { willReadFrequently: true })
      if (!context) {
        throw new Error('Canvas-Kontext konnte nicht erstellt werden.')
      }
      await page.render({ canvasContext: context, viewport, canvas }).promise
      container.appendChild(canvas)
    }
  }

  private normalizeScale(scale?: number): number {
    if (!Number.isFinite(scale) || !scale) {
      return 1
    }
    return Math.min(2, Math.max(0.25, scale))
  }

  private buildDocument(fileName?: string): string {
    const safeTitle = fileName ? `<title>${this.escapeHtml(fileName)}</title>` : ''
    return `<!doctype html>
<html>
  <head>
    ${safeTitle}
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; background: #fff; }
      body {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
        padding: 1rem;
      }
      #pdf-pages {
        width: 100%;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 1rem;
      }
      canvas {
        width: auto;
        height: auto;
        image-rendering: crisp-edges;
      }
      @page {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <div id="pdf-pages"></div>
  </body>
</html>`
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }
}
