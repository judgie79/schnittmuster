import type { ISODateString, UUID } from './types.js'
import type { TagDTO } from './TagDTO.js'
import type { PatternMeasurementDTO, FabricRequirementsDTO } from './MeasurementDTO.js'

//export type PatternStatus = 'draft' | 'geplant' | 'genaeht' | 'getestet' | 'archiviert'


export enum PatternStatus {
  draft = 'draft',
  geplant = 'geplant',
  genaeht = 'genaeht',
  getestet = 'getestet',
  archiviert = 'archiviert',
}

export interface PatternDTO {
  id: UUID
  name: string
  description?: string
  thumbnailUrl?: string
  fileUrl?: string
  status: PatternStatus
  isFavorite: boolean
  tags: TagDTO[]
  measurements?: PatternMeasurementDTO[]
  fabricRequirements?: FabricRequirementsDTO
  ownerId: UUID
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface PatternCreateDTO {
  name: string
  description?: string
  tagIds?: UUID[]
  fileUrl?: string
  status?: PatternStatus
  isFavorite?: boolean
  fabricRequirements?: FabricRequirementsDTO
}

export interface PatternUpdateDTO {
  name?: string
  description?: string
  tagIds?: UUID[]
  fileUrl?: string
  status?: PatternStatus
  isFavorite?: boolean
  fabricRequirements?: FabricRequirementsDTO
}
