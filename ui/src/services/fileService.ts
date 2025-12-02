import { apiClient } from './api'
import type { ApiResponse } from 'shared-dtos'

export const fileService = {
  async upload(file: File): Promise<{ url: string }> {
    const formData = new FormData()
    formData.append('file', file)
    const response = await apiClient.post<ApiResponse<{ url: string }>>('/files', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
    return response.data.data
  },
}
