import { environment } from "./environment";
import { ValidationError } from "@shared/errors/ValidationError";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

export const paginationConfig = {
  DEFAULT_PAGE_SIZE: environment.pagination.defaultPageSize,
  MAX_PAGE_SIZE: environment.pagination.maxPageSize,
};

export function validatePagination(page?: number, pageSize?: number): PaginationParams {
  const validPage = Math.max(1, page ?? 1);
  const size = pageSize ?? paginationConfig.DEFAULT_PAGE_SIZE;
  if (size > paginationConfig.MAX_PAGE_SIZE) {
    throw new ValidationError(`pageSize cannot exceed ${paginationConfig.MAX_PAGE_SIZE}`);
  }
  return { page: validPage, pageSize: size };
}
