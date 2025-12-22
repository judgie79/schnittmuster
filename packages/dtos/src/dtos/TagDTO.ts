import type { UUID } from './types'

export interface TagCategoryDTO {
  id: UUID
  name: string
  displayOrder?: number
  tags: TagDTO[]
}

export interface TagDTO {
  id: UUID
  name: string
  categoryId: UUID
  categoryName: string
  colorHex?: string
  category?: TagCategoryDTO
}
