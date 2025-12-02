export type UUID = string
export type ISODateString = string

export type ResourceType = 'pattern' | 'tag' | 'file'
export type AccessRight = 'read' | 'write' | 'delete'
export type UserRole = 'user' | 'editor' | 'admin'

export interface PaginationInfo {
  page: number
  pageSize: number
  totalPages: number
  totalItems: number
}
