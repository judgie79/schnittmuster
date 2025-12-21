import type { PatternPrintHandler, PatternPrintMeta } from './types'
import { jpegPrintHandler, pdfPrintHandler, pngPrintHandler } from './handlers'

export class PatternPrintHandlerFactory {
  private readonly handlers: PatternPrintHandler[]

  constructor(initialHandlers: PatternPrintHandler[] = []) {
    this.handlers = [...initialHandlers]
  }

  register(handler: PatternPrintHandler) {
    this.handlers.push(handler)
  }

  resolve(meta: PatternPrintMeta): PatternPrintHandler | null {
    return this.handlers.find((handler) => handler.canHandle(meta)) ?? null
  }
}

export const patternPrintHandlerFactory = new PatternPrintHandlerFactory([
  pdfPrintHandler,
  jpegPrintHandler,
  pngPrintHandler,
])
