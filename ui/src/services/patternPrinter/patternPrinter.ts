import { fileService } from '@schnittmuster/core'
import { resolveAssetUrl } from '@/utils/url'
import { patternPrintHandlerFactory } from './factory'
import { pdfJsPrintHandler } from './handlers'
import type { PatternPrintMeta } from './types'

export interface PatternPrintRequest {
  fileUrl?: string | null
  fileName?: string
  scale?: number
  renderer?: PatternPrintRenderer
}

export type PatternPrintRenderer = 'native' | 'pdfjs'

const getExtension = (input?: string): string | undefined => {
  if (!input) {
    return undefined
  }
  const sanitized = input.split(/[?#]/)[0]
  const match = sanitized.match(/\.([a-z0-9]+)$/i)
  return match ? match[1].toLowerCase() : undefined
}

const buildMeta = (sourceIdentifier: string | undefined, mimeType?: string): PatternPrintMeta => ({
  mimeType: mimeType || undefined,
  extension: getExtension(sourceIdentifier),
})

export const patternPrinter = {
  async print(request: PatternPrintRequest): Promise<void> {
    if (typeof window === 'undefined') {
      throw new Error('Drucken ist nur im Browser möglich.')
    }

    if (!request.fileUrl) {
      throw new Error('Für dieses Schnittmuster liegt keine Datei vor.')
    }

    const resolvedUrl = resolveAssetUrl(request.fileUrl) ?? request.fileUrl
    const blob = await fileService.get(resolvedUrl)
    const meta = buildMeta(request.fileName ?? resolvedUrl, blob.type)
    const handler = resolveHandler(meta, request.renderer)

    if (!handler) {
      throw new Error('Dieser Dateityp wird aktuell nicht für den Druck unterstützt.')
    }

    const blobUrl = URL.createObjectURL(blob)
    const scale = typeof request.scale === 'number' && Number.isFinite(request.scale) && request.scale > 0 ? request.scale : 1

    try {
      await handler.print({
        blob,
        blobUrl,
        fileName: request.fileName,
        meta,
        scale,
      })
    } finally {
      window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
    }
  },
}

const resolveHandler = (meta: PatternPrintMeta, renderer?: PatternPrintRenderer) => {
  if (renderer === 'pdfjs') {
    if (!pdfJsPrintHandler.canHandle(meta)) {
      throw new Error('PDF.js Druck steht nur für PDF-Dateien zur Verfügung.')
    }
    return pdfJsPrintHandler
  }
  return patternPrintHandlerFactory.resolve(meta)
}
