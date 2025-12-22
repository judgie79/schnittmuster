import axios, { type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import { REQUEST_TIMEOUT, STORAGE_KEYS } from '../utils/constants';
import { getStorage } from '../utils/storage';

let apiBaseUrl = 'http://localhost:5001/api/v1';

export const setApiBaseUrl = (url: string) => {
  apiBaseUrl = url;
  apiClient.defaults.baseURL = url;
};

export const apiClient: AxiosInstance = axios.create({
  baseURL: apiBaseUrl,
  timeout: REQUEST_TIMEOUT,
  withCredentials: true,
});

apiClient.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  const token = await getStorage().getItem(STORAGE_KEYS.accessToken);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise: Promise<string | null> | null = null;

const refreshAccessToken = async (): Promise<string | null> => {
  const refreshToken = await getStorage().getItem(STORAGE_KEYS.refreshToken);
  if (!refreshToken) {
    return null;
  }
  try {
    const response = await axios.post(
      `${apiBaseUrl}/auth/refresh`,
      { refreshToken },
      { withCredentials: true },
    );
    const tokens = response.data?.data as { accessToken?: string; refreshToken?: string } | undefined;
    if (tokens?.accessToken) {
      await getStorage().setItem(STORAGE_KEYS.accessToken, tokens.accessToken);
    }
    if (tokens?.refreshToken) {
      await getStorage().setItem(STORAGE_KEYS.refreshToken, tokens.refreshToken);
    }
    return tokens?.accessToken ?? null;
  } catch (error) {
    return null;
  }
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        refreshPromise = refreshPromise ?? refreshAccessToken();
        const newToken = await refreshPromise;
        refreshPromise = null;

        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        refreshPromise = null;
        // Handle logout or redirect here if needed, or let the error propagate
      }
    }
    return Promise.reject(error);
  },
);
