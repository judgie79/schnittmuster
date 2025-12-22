import { apiClient } from './api';
import { STORAGE_KEYS } from '../utils/constants';
import { getStorage } from '../utils/storage';
import { resolveAssetUrl } from '../utils/url';
import type { ApiResponse } from '@schnittmuster/dtos';

const FALLBACK_NAME = 'schnittmuster-datei.pdf'

export const fileService = {
  parseFileName(contentDisposition?: string | null) {
    if (!contentDisposition) {
      return null
    }
    const matches = /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i.exec(contentDisposition)
    if (!matches) {
      return null
    }
    if (matches[1]) {
      try {
        return decodeURIComponent(matches[1])
      } catch {
        return matches[1]
      }
    }
    return matches[2] ?? null
  },

  sanitizeFileName(input?: string | null) {
    if (!input) {
      return FALLBACK_NAME
    }
    const normalized = input.trim().replace(/[/\\]/g, '_')
    return normalized.length ? normalized : FALLBACK_NAME
  },

  guessFileNameFromUrl(input: string) {
    const sanitized = input.split(/[?#]/)[0]
    const segments = sanitized.split('/')
    const candidate = segments.pop() || FALLBACK_NAME
    try {
      return decodeURIComponent(candidate)
    } catch {
      return candidate
    }
  },

  async buildAuthHeaders() {
    const headers: Record<string, string> = { Accept: '*/*' }
    const token = await getStorage().getItem(STORAGE_KEYS.accessToken)
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
    return headers
  },

  getExtension(input?: string | null) {
    if (!input) {
      return undefined
    }
    const sanitized = input.split(/[?#]/)[0]
    const match = sanitized.match(/\.([a-z0-9]+)$/i)
    return match ? match[1].toLowerCase() : undefined
  },

  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<{ url: string }>>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },

  async get(fileUrl: string): Promise<Blob> {
    const resolvedUrl = resolveAssetUrl(fileUrl) ?? fileUrl
    const response = await apiClient.get<Blob>(resolvedUrl, {
      responseType: 'blob',
    })
    return response.data
  },

  async getMetadata(fileUrl: string): Promise<{ mimeType: string | null; fileName: string | null }> {
    const resolvedUrl = resolveAssetUrl(fileUrl) ?? fileUrl
    const response = await apiClient.head(resolvedUrl)
    const mimeType = response.headers['content-type'] ?? null
    const fileName = this.parseFileName(response.headers['content-disposition'])
    return { mimeType, fileName }
  },
}
