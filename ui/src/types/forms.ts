import type { PatternStatus, TagDTO } from 'shared-dtos'

// Re-export core types
export type { AuthCredentials, SignupPayload } from '@schnittmuster/core'

export interface PatternFormValues {
  name: string
  description?: string
  status: PatternStatus
  isFavorite: boolean
  file?: File | null
  thumbnail?: File | null
  tagIds: string[]
  notes?: string
}

export interface TagFilterState {
  query?: string
  categories?: string[]
  selectedTags: TagDTO[]
}
