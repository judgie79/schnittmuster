import { apiClient } from './api'
import type { ApiResponse, PatternTagProposalDTO, TagCategoryDTO, TagDTO } from 'shared-dtos'

export interface TagCategoryPayload {
  name: string
  displayOrder?: number
}

export interface TagPayload {
  name: string
  tagCategoryId: string
  colorHex: string
}

export interface TagUpdatePayload extends Partial<TagPayload> {}
export interface TagCategoryUpdatePayload extends Partial<TagCategoryPayload> {}

export const tagService = {
  async getCategories(): Promise<TagCategoryDTO[]> {
    const response = await apiClient.get<ApiResponse<TagCategoryDTO[]>>('/tags/categories')
    return response.data.data
  },

  async createCategory(payload: TagCategoryPayload): Promise<TagCategoryDTO> {
    const response = await apiClient.post<ApiResponse<TagCategoryDTO>>('/tags/categories', payload)
    return response.data.data
  },

  async updateCategory(categoryId: string, payload: TagCategoryUpdatePayload): Promise<TagCategoryDTO> {
    const response = await apiClient.put<ApiResponse<TagCategoryDTO>>(`/tags/categories/${categoryId}`, payload)
    return response.data.data
  },

  async deleteCategory(categoryId: string): Promise<void> {
    await apiClient.delete(`/tags/categories/${categoryId}`)
  },

  async getByCategory(categoryId: string): Promise<TagDTO[]> {
    const response = await apiClient.get<ApiResponse<TagDTO[]>>(`/tags/categories/${categoryId}/tags`)
    return response.data.data
  },

  async search(query: string): Promise<TagDTO[]> {
    const response = await apiClient.get<ApiResponse<TagDTO[]>>('/tags/search', { params: { q: query } })
    return response.data.data
  },

  async createTag(payload: TagPayload): Promise<TagDTO> {
    const response = await apiClient.post<ApiResponse<TagDTO>>('/tags', payload)
    return response.data.data
  },

  async updateTag(tagId: string, payload: TagUpdatePayload): Promise<TagDTO> {
    const response = await apiClient.put<ApiResponse<TagDTO>>(`/tags/${tagId}`, payload)
    return response.data.data
  },

  async deleteTag(tagId: string): Promise<void> {
    await apiClient.delete(`/tags/${tagId}`)
  },

  async getProposals(): Promise<PatternTagProposalDTO[]> {
    const response = await apiClient.get<ApiResponse<PatternTagProposalDTO[]>>('/tags/proposals')
    return response.data.data
  },

  async approveProposal(proposalId: string): Promise<PatternTagProposalDTO> {
    const response = await apiClient.post<ApiResponse<PatternTagProposalDTO>>(`/tags/proposals/${proposalId}/approve`)
    return response.data.data
  },

  async rejectProposal(proposalId: string): Promise<PatternTagProposalDTO> {
    const response = await apiClient.post<ApiResponse<PatternTagProposalDTO>>(`/tags/proposals/${proposalId}/reject`)
    return response.data.data
  },
}
