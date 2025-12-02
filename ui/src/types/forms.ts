import type { PatternStatus, TagDTO } from './models'

export interface AuthCredentials {
  email: string
  password: string
}

export interface SignupPayload extends AuthCredentials {
  name: string
}

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
