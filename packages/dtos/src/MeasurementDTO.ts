import type { ISODateString, UUID } from './types.js'

export enum MeasurementUnit {
  cm = 'cm',
  inch = 'inch',
  mm = 'mm',
}

export enum MeasurementCategory {
  body = 'body',
  garment = 'garment',
  custom = 'custom',
}

export interface MeasurementTypeDTO {
  id: UUID
  userId: UUID | null
  name: string
  description?: string
  unit: MeasurementUnit
  category: MeasurementCategory
  isSystemDefault: boolean
  displayOrder: number
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface MeasurementTypeCreateDTO {
  name: string
  description?: string
  unit: MeasurementUnit
  category: MeasurementCategory
  displayOrder?: number
}

export interface MeasurementTypeUpdateDTO {
  name?: string
  description?: string
  unit?: MeasurementUnit
  category?: MeasurementCategory
  displayOrder?: number
}

export interface PatternMeasurementDTO {
  id: UUID
  patternId: UUID
  measurementTypeId: UUID
  measurementType: MeasurementTypeDTO
  value: number | null
  notes?: string
  isRequired: boolean
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface PatternMeasurementCreateDTO {
  measurementTypeId: UUID
  value?: number
  notes?: string
  isRequired?: boolean
}

export interface PatternMeasurementUpdateDTO {
  value?: number
  notes?: string
  isRequired?: boolean
}

export interface FabricRequirementsDTO {
  fabricWidth?: number
  fabricLength?: number
  fabricType?: string
}
