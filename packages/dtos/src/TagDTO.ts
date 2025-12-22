import type { UUID } from './types.js'

export interface TagCategoryDTO {
  id: UUID
  name: string
  displayOrder?: number
  userId: UUID
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
