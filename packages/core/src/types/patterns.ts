import { ApiResponse as SharedApiResponse, PaginationInfo } from 'schnittmuster-manager-dtos';

export type ApiResponse<T> = SharedApiResponse<T>;

export interface PaginatedResponse<T> extends ApiResponse<T> {
  pagination: PaginationInfo;
}

export interface PatternListParams {
  page?: number;
  pageSize?: number;
  filters?: Record<string, unknown>;
}

export interface PatternRequestOptions {
  onUploadProgress?: (progress: number) => void;
}

export interface TagProposalPayload {
  name: string;
  tagCategoryId: string;
  colorHex: string;
}
