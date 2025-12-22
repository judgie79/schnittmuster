import type { UserDTO } from '../UserDTO.js'

export interface AdminUserDTO extends UserDTO {
  admin_role: 'super_admin' | 'admin' | 'moderator'
  status: 'active' | 'suspended' | 'deleted'
  last_login?: Date | string
  login_count: number
  failed_login_attempts: number
  last_failed_login?: Date | string
  is_2fa_enabled: boolean
  storage_used_mb: number
  patterns_count: number
  created_at: Date | string
  updated_at: Date | string
}

export interface AdminUserUpdateDTO {
  admin_role?: 'super_admin' | 'admin' | 'moderator'
  status?: 'active' | 'suspended' | 'deleted'
  is_2fa_enabled?: boolean
}

export interface AdminUserBulkActionDTO {
  user_ids: string[]
  action: 'suspend' | 'activate' | 'delete' | 'change_role'
  role?: 'super_admin' | 'admin' | 'moderator'
}
