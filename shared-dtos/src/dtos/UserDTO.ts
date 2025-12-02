import type { ISODateString, UUID } from './types'
import type { RoleDTO } from './RoleDTO'

export type AuthProvider = 'local' | 'google'

export interface UserDTO {
  id: UUID
  username: string
  email: string
  authProvider: AuthProvider
  photoUrl?: string
  roles?: RoleDTO[]
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface UserCreateDTO {
  username: string
  email: string
  password: string
}

export interface UserUpdateDTO {
  username?: string
  email?: string
  password?: string
  photoUrl?: string
}
