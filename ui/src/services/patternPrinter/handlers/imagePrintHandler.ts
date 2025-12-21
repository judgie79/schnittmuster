import { createHiddenIframe, scheduleIframeCleanup, waitForIframeLoad, triggerIframePrint } from '../dom'
import type { PatternPrintContext, PatternPrintHandler, PatternPrintMeta } from '../types'

interface ImageHandlerConfig {
  label: string
  extensions: string[]
  mimeTypes: string[]
}

const toLower = (value?: string) => value?.toLowerCase()

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

export class RasterImagePrintHandler implements PatternPrintHandler {
  private readonly extensions: Set<string>
  private readonly mimeTypes: Set<string>
  private readonly label: string

  constructor(config: ImageHandlerConfig) {
    this.extensions = new Set(config.extensions.map((item) => item.toLowerCase()))
    this.mimeTypes = new Set(config.mimeTypes.map((item) => item.toLowerCase()))
    this.label = config.label
  }

  canHandle(meta: PatternPrintMeta): boolean {
    const extension = toLower(meta.extension)
    const mimeType = toLower(meta.mimeType)
    const matchesExtension = extension ? this.extensions.has(extension) : false
    const matchesMime = mimeType ? this.mimeTypes.has(mimeType) : false
    return matchesExtension || matchesMime
  }

  async print({ blobUrl, fileName, scale }: PatternPrintContext): Promise<void> {
    const iframe = createHiddenIframe()
    try {
      const ready = waitForIframeLoad(iframe)
      iframe.srcdoc = this.buildDocument(blobUrl, fileName, scale)
      await ready
      triggerIframePrint(iframe)
    } finally {
      scheduleIframeCleanup(iframe)
    }
  }

  private buildDocument(blobSrc: string, fileName: string | undefined, scale: number): string {
    const normalizedScale = Number.isFinite(scale) && scale > 0 ? scale : 1
    const percentScale = Math.min(400, Math.max(10, Math.round(normalizedScale * 100)))
    const safeSrc = escapeHtml(blobSrc)
    const safeTitle = fileName ? `<title>${escapeHtml(fileName)}</title>` : ''
    return `<!doctype html>
<html>
  <head>
    ${safeTitle}
    <meta charset="utf-8" />
    <style>
      * { box-sizing: border-box; }
      html, body { margin: 0; padding: 0; }
      body {
        display: flex;
        align-items: center;
        justify-content: center;
        background: #fff;
      }
      img {
        width: ${percentScale}%;
        max-width: none;
        height: auto;
        image-rendering: crisp-edges;
        image-rendering: pixelated;
      }
      @page {
        margin: 0;
      }
    </style>
  </head>
  <body>
    <img src="${safeSrc}" alt="${this.label} Druck" />
  </body>
</html>`
  }
}
