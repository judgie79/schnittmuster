export interface AdminActionLogDTO {
  id: string
  admin_id: string
  action: 'user_suspend' | 'user_activate' | 'user_delete' | 'user_role_change' | 'pattern_delete' | 'setting_change'
  target_user_id?: string
  target_resource_id?: string
  changes: Record<string, unknown>
  reason?: string
  status: 'success' | 'failure'
  error_message?: string
  created_at: Date | string
}

export interface AdminNotificationDTO {
  id: string
  type: 'alert' | 'warning' | 'info' | 'critical'
  title: string
  message: string
  related_metric?: string
  read: boolean
  created_at: Date | string
}
