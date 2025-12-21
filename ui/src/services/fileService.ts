import { apiClient } from './api'
import type { ApiResponse } from 'shared-dtos'
import { resolveAssetUrl } from '@/utils/url'

const parseFileName = (contentDisposition?: string | null) => {
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
}

export const fileService = {
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
    const fileName = parseFileName(response.headers['content-disposition'])
    return { mimeType, fileName }
  },
}
