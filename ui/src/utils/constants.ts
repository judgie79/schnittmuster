export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:5001/api/v1'
export const REQUEST_TIMEOUT = 10000

export const STORAGE_KEYS = {
  accessToken: 'schnittmuster.access_token',
  refreshToken: 'schnittmuster.refresh_token',
  preferences: 'schnittmuster.preferences',
} as const
