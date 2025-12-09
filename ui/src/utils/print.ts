type PrintAssetOptions = {
  delayMs?: number
  onBeforePrint?: () => void
  onAfterPrint?: () => void
  fetchOptions?: RequestInit
}

const DEFAULT_DELAY_MS = 300

export const printAssetFromUrl = async (assetUrl?: string, options: PrintAssetOptions = {}) => {
  if (typeof window === 'undefined') {
    throw new Error('printAssetFromUrl can only run in the browser')
  }

  if (!assetUrl) {
    throw new Error('Keine Datei zum Drucken vorhanden')
  }

  const { delayMs = DEFAULT_DELAY_MS, onBeforePrint, onAfterPrint, fetchOptions } = options
  const response = await fetch(assetUrl, {
    credentials: 'include',
    ...fetchOptions,
  })

  if (!response.ok) {
    throw new Error('Datei konnte nicht geladen werden')
  }

  const blob = await response.blob()
  const blobUrl = URL.createObjectURL(blob)

  const iframe = window.document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.left = '-9999px'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'

  const cleanup = () => {
    iframe.parentNode?.removeChild(iframe)
    URL.revokeObjectURL(blobUrl)
  }

  await new Promise<void>((resolve, reject) => {
    const handleLoad = () => {
      detachListeners()
      window.setTimeout(() => {
        try {
          onBeforePrint?.()
          iframe.contentWindow?.focus()
          iframe.contentWindow?.print()
          onAfterPrint?.()
          resolve()
        } catch (error) {
          reject(error)
        } finally {
          window.setTimeout(() => {
            cleanup()
          }, delayMs)
        }
      }, Math.max(delayMs, 100))
    }

    const handleError = () => {
      detachListeners()
      cleanup()
      reject(new Error('Druckdatei konnte nicht geladen werden'))
    }

    const detachListeners = () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
    iframe.src = blobUrl
    window.document.body.appendChild(iframe)
  })
}
