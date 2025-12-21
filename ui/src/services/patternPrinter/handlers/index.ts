import { RasterImagePrintHandler } from './imagePrintHandler'
import { PdfPrintHandler } from './pdfPrintHandler'
import { PdfJsPrintHandler } from './pdfJsPrintHandler'

export const pdfPrintHandler = new PdfPrintHandler()
export const pdfJsPrintHandler = new PdfJsPrintHandler()
export const jpegPrintHandler = new RasterImagePrintHandler({
  label: 'JPEG',
  extensions: ['jpg', 'jpeg'],
  mimeTypes: ['image/jpeg'],
})

export const pngPrintHandler = new RasterImagePrintHandler({
  label: 'PNG',
  extensions: ['png'],
  mimeTypes: ['image/png'],
})
