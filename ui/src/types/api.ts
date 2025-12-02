import type { ApiResponse as SharedApiResponse, PaginationInfo } from 'shared-dtos'

export type ApiResponse<T> = SharedApiResponse<T>

export interface PaginatedResponse<T> extends SharedApiResponse<T> {
  pagination: PaginationInfo
}
