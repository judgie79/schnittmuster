import { apiClient } from './api'
import type { ApiResponse, UserDTO } from 'shared-dtos'
import type { AuthCredentials, SignupPayload } from '@/types'
import { STORAGE_KEYS } from '@/utils/constants'

const persistTokens = (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    localStorage.setItem(STORAGE_KEYS.accessToken, accessToken)
  }
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.refreshToken, refreshToken)
  }
}

export const authService = {
  async login(credentials: AuthCredentials): Promise<UserDTO> {
    const response = await apiClient.post<ApiResponse<{ user: UserDTO; accessToken: string; refreshToken?: string }>>(
      '/auth/login',
      credentials,
    )
    persistTokens(response.data.data.accessToken, response.data.data.refreshToken)
    return response.data.data.user
  },

  async signup(payload: SignupPayload): Promise<UserDTO> {
    const response = await apiClient.post<ApiResponse<{ user: UserDTO }>>('/auth/register', payload)
    return response.data.data.user
  },

  async logout(): Promise<void> {
    await apiClient.post('/auth/logout')
    localStorage.removeItem(STORAGE_KEYS.accessToken)
    localStorage.removeItem(STORAGE_KEYS.refreshToken)
  },

  async getProfile(): Promise<UserDTO> {
    const response = await apiClient.get<ApiResponse<{ user: UserDTO }>>('/auth/profile')
    return response.data.data.user
  },
}
