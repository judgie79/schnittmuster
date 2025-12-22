import type { AccessRight, ISODateString, ResourceType, UUID } from './types.js'

export interface ResourceDTO {
  id: UUID
  type: ResourceType
  ownerId: UUID
  referenceId?: UUID
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface ResourceAccessDTO {
  resourceId: UUID
  userId: UUID
  rights: AccessRight[]
  grantedBy?: UUID
  createdAt: ISODateString
  updatedAt: ISODateString
}
