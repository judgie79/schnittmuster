import { PatternStatus } from "@schnittmuster/dtos";

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