import { apiClient } from './api'
import type { ApiResponse, TagCategoryDTO, TagDTO } from 'shared-dtos'

export const tagService = {
  async getCategories(): Promise<TagCategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<TagCategoryDTO[]>>('/tags/categories')
    return response.data.data
  },

  async getByCategory(categoryId: string): Promise<TagDTO[]> {
    const response = await apiClient.get<ApiResponse<TagDTO[]>>(`/tags/categories/${categoryId}/tags`)
    return response.data.data
  },

  async search(query: string): Promise<TagDTO[]> {
    const response = await apiClient.get<ApiResponse<TagDTO[]>>('/tags/search', { params: { q: query } })
    return response.data.data
  },
}
