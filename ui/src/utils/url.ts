import { API_BASE_URL } from './constants'

const ABSOLUTE_URL_REGEX = /^https?:\/\//i

export const resolveAssetUrl = (input?: string | null): string | undefined => {
  if (!input) {
    return undefined
  }
  if (ABSOLUTE_URL_REGEX.test(input)) {
    return input
  }
  try {
    return new URL(input, API_BASE_URL).toString()
  } catch {
    return input
  }
}
