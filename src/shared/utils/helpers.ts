import { PaginationMeta } from "@shared/types";

export const buildPaginationMeta = (
  page: number,
  pageSize: number,
  total: number
): PaginationMeta => ({
  page,
  pageSize,
  total,
  totalPages: Math.ceil(total / pageSize),
});

export const isUuid = (value: string): boolean => {
  return /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    value
  );
};
