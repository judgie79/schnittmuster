import { apiClient } from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { getStorage } from '../utils/storage';
import { AuthCredentials, SignupPayload } from '../types';
import { ApiResponse, UserDTO } from 'schnittmuster-manager-dtos';

const persistTokens = async (accessToken?: string, refreshToken?: string) => {
  if (accessToken) {
    await getStorage().setItem(STORAGE_KEYS.accessToken, accessToken);
  }
  if (refreshToken) {
    await getStorage().setItem(STORAGE_KEYS.refreshToken, refreshToken);
  }
};

export const authService = {
  async login(credentials: AuthCredentials): Promise<UserDTO> {
    const response = await apiClient.post<ApiResponse<{ user: UserDTO; accessToken: string; refreshToken?: string }>>(
      '/auth/login',
      credentials,
    );
    await persistTokens(response.data.data.accessToken, response.data.data.refreshToken);
    return response.data.data.user;
  },

  async signup(payload: SignupPayload): Promise<UserDTO> {
    const response = await apiClient.post<
      ApiResponse<{ user: UserDTO; accessToken?: string; refreshToken?: string }>
    >('/auth/register', payload);
    await persistTokens(response.data.data.accessToken, response.data.data.refreshToken);
    return response.data.data.user;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      await getStorage().removeItem(STORAGE_KEYS.accessToken);
      await getStorage().removeItem(STORAGE_KEYS.refreshToken);
    }
  },

  async getProfile(): Promise<UserDTO> {
    const response = await apiClient.get<ApiResponse<{ user: UserDTO }>>('/auth/profile');
    return response.data.data.user;
  },
};
