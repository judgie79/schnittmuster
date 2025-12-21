import { API_BASE_URL } from './constants'

const ABSOLUTE_URL_REGEX = /^https?:\/\//i

const getAbsoluteBaseUrl = (): string | undefined => {
  if (!API_BASE_URL) {
    return undefined
  }
  if (ABSOLUTE_URL_REGEX.test(API_BASE_URL)) {
    return API_BASE_URL.endsWith('/') ? API_BASE_URL : `${API_BASE_URL}/`
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    const normalizedPath = API_BASE_URL.startsWith('/') ? API_BASE_URL : `/${API_BASE_URL}`
    const absoluteBase = `${window.location.origin}${normalizedPath}`
    return absoluteBase.endsWith('/') ? absoluteBase : `${absoluteBase}/`
  }
  return undefined
}

export const resolveAssetUrl = (input?: string | null): string | undefined => {
  if (!input) {
    return undefined
  }
  if (ABSOLUTE_URL_REGEX.test(input)) {
    return input
  }

  const baseUrl = getAbsoluteBaseUrl()
  if (!baseUrl) {
    return input
  }

  const normalizedInput = input.startsWith('/') ? input : `/${input}`

  try {
    return new URL(normalizedInput, baseUrl).toString()
  } catch {
    return normalizedInput
  }
}
