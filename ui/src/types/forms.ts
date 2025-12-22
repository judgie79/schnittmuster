import type { TagDTO } from '@schnittmuster/dtos'

// Re-export core types
export type { AuthCredentials, SignupPayload } from '@schnittmuster/core'



export interface TagFilterState {
  query?: string
  categories?: string[]
  selectedTags: TagDTO[]
}
