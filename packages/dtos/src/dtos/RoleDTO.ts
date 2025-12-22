import type { ISODateString, UUID, UserRole } from './types'

export interface RoleDTO {
  id: UUID
  name: UserRole | string
  description?: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface UserRoleAssignmentDTO {
  userId: UUID
  roleId: UUID
}
