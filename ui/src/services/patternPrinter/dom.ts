const HIDDEN_IFRAME_STYLE: Partial<CSSStyleDeclaration> = {
  position: 'fixed',
  width: '0',
  height: '0',
  border: '0',
  opacity: '0',
  pointerEvents: 'none',
  right: '0',
  bottom: '0',
}

export const createHiddenIframe = (): HTMLIFrameElement => {
  if (typeof document === 'undefined') {
    throw new Error('Druck ist nur im Browser verfügbar.')
  }

  const iframe = document.createElement('iframe')
  Object.assign(iframe.style, HIDDEN_IFRAME_STYLE)
  iframe.setAttribute('aria-hidden', 'true')
  iframe.tabIndex = -1
  document.body.appendChild(iframe)
  return iframe
}

export const waitForIframeLoad = (iframe: HTMLIFrameElement): Promise<void> => {
  return new Promise((resolve, reject) => {
    const handleLoad = () => {
      cleanup()
      resolve()
    }

    const handleError = () => {
      cleanup()
      reject(new Error('Druckansicht konnte nicht geladen werden.'))
    }

    const cleanup = () => {
      iframe.removeEventListener('load', handleLoad)
      iframe.removeEventListener('error', handleError)
    }

    iframe.addEventListener('load', handleLoad)
    iframe.addEventListener('error', handleError)
  })
}

export const triggerIframePrint = (iframe: HTMLIFrameElement) => {
  const frameWindow = iframe.contentWindow
  if (!frameWindow) {
    throw new Error('Druckvorschau nicht verfügbar.')
  }
  frameWindow.focus()
  frameWindow.print()
}

export const scheduleIframeCleanup = (iframe: HTMLIFrameElement, delayMs = 2500) => {
  if (typeof window === 'undefined') {
    return
  }
  window.setTimeout(() => {
    iframe.remove()
  }, delayMs)
}
