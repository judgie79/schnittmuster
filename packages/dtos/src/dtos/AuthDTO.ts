import type { AccessRight, ISODateString, ResourceType, UUID } from './types'
import type { RoleDTO } from './RoleDTO'

export interface AuthTokenDTO {
  accessToken: string
  refreshToken?: string
  issuedAt: ISODateString
  expiresAt: ISODateString
}

export interface AuthorizationContextDTO {
  userId: UUID
  roles: RoleDTO[]
  rights: Array<{
    resourceType: ResourceType
    resourceId?: UUID
    access: AccessRight[]
  }>
}
