export interface PatternPrintMeta {
  mimeType?: string
  extension?: string
}

export interface PatternPrintContext {
  blob: Blob
  blobUrl: string
  fileName?: string
  meta: PatternPrintMeta
  scale: number
}

export interface PatternPrintHandler {
  canHandle(meta: PatternPrintMeta): boolean
  print(context: PatternPrintContext): Promise<void>
}
