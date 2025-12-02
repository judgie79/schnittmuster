import axios from 'axios'
import { API_BASE_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from '@/utils/constants'
import { logger } from '@/utils/logger'

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
})

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(STORAGE_KEYS.accessToken)
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

let refreshPromise: Promise<string | null> | null = null

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = localStorage.getItem(STORAGE_KEYS.refreshToken)
  if (!refreshToken) {
    return null
  }
  const response = await axios.post(
    `${API_BASE_URL}/auth/refresh`,
    { token: refreshToken },
    { withCredentials: true },
  )
  const newToken = response.data?.accessToken as string | undefined
  if (newToken) {
    localStorage.setItem(STORAGE_KEYS.accessToken, newToken)
    return newToken
  }
  return null
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config
    const status = error.response?.status

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken()
        const newToken = await refreshPromise
        refreshPromise = null
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return apiClient(originalRequest)
        }
      } catch (refreshError) {
        refreshPromise = null
        localStorage.removeItem(STORAGE_KEYS.accessToken)
        localStorage.removeItem(STORAGE_KEYS.refreshToken)
        logger.error('Token refresh failed', refreshError)
      }
    }

    return Promise.reject(error)
  },
)

export { apiClient }
