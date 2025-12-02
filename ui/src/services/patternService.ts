import type { AxiosProgressEvent } from 'axios'
import { apiClient } from './api'
import type { ApiResponse, PatternDTO } from 'shared-dtos'
import type { PaginatedResponse } from '@/types'

export interface PatternListParams {
  page?: number
  pageSize?: number
  filters?: Record<string, unknown>
}

export interface PatternRequestOptions {
  onUploadProgress?: (progress: number) => void
}

const handleProgress = (event: AxiosProgressEvent, onUploadProgress?: (progress: number) => void) => {
  if (!onUploadProgress || !event.total) return
  const percent = Math.round((event.loaded / event.total) * 100)
  onUploadProgress(percent)
}

export const patternService = {
  async list(params: PatternListParams = {}): Promise<PaginatedResponse<PatternDTO[]>> {
    const { page = 1, pageSize = 20, filters = {} } = params
    const response = await apiClient.get<PaginatedResponse<PatternDTO[]>>('/patterns', {
      params: { page, pageSize, ...filters },
    })
    return response.data
  },

  async get(patternId: string): Promise<PatternDTO> {
    const response = await apiClient.get<ApiResponse<PatternDTO>>(`/patterns/${patternId}`)
    return response.data.data
  },

  async create(formData: FormData, options: PatternRequestOptions = {}): Promise<PatternDTO> {
    const response = await apiClient.post<ApiResponse<PatternDTO>>('/patterns', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => handleProgress(event, options.onUploadProgress),
    })
    return response.data.data
  },

  async update(
    patternId: string,
    payload: Partial<PatternDTO> | FormData,
    options: PatternRequestOptions = {}
  ): Promise<PatternDTO> {
    const headers = payload instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    const response = await apiClient.put<ApiResponse<PatternDTO>>(`/patterns/${patternId}`, payload, {
      headers,
      onUploadProgress: (event) => handleProgress(event, options.onUploadProgress),
    })
    return response.data.data
  },

  async remove(patternId: string): Promise<void> {
    await apiClient.delete(`/patterns/${patternId}`)
  },

  async assignTags(patternId: string, tagIds: string[]): Promise<PatternDTO> {
    const response = await apiClient.post<ApiResponse<PatternDTO>>(`/patterns/${patternId}/tags`, { tagIds })
    return response.data.data
  },

  async removeTag(patternId: string, tagId: string): Promise<PatternDTO> {
    const response = await apiClient.delete<ApiResponse<PatternDTO>>(`/patterns/${patternId}/tags/${tagId}`)
    return response.data.data
  },
}
