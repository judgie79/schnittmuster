import { createHiddenIframe, scheduleIframeCleanup, triggerIframePrint, waitForIframeLoad } from '../dom'
import type { PatternPrintContext, PatternPrintHandler, PatternPrintMeta } from '../types'

const toLower = (value?: string) => value?.toLowerCase()

export class PdfPrintHandler implements PatternPrintHandler {
  private readonly extensions = new Set(['pdf'])
  private readonly mimeTypes = new Set(['application/pdf'])

  canHandle(meta: PatternPrintMeta): boolean {
    const extension = toLower(meta.extension)
    const mimeType = toLower(meta.mimeType)
    const matchesExtension = extension ? this.extensions.has(extension) : false
    const matchesMime = mimeType ? this.mimeTypes.has(mimeType) : false
    return matchesExtension || matchesMime
  }

  async print({ blobUrl }: PatternPrintContext): Promise<void> {
    const iframe = createHiddenIframe()
    try {
      const ready = waitForIframeLoad(iframe)
      iframe.src = blobUrl
      await ready
      triggerIframePrint(iframe)
    } finally {
      scheduleIframeCleanup(iframe)
    }
  }
}
