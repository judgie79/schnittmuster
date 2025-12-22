import { apiClient } from '@schnittmuster/core'
import type {
  ApiResponse,
  AdminUserDTO,
  AdminUserUpdateDTO,
  AdminUserBulkActionDTO,
  SystemMetricsDTO,
  AnalyticsReportDTO,
  SystemSettingsDTO,
  AdminNotificationDTO,
  AdminActionLogDTO,
} from 'shared-dtos'
import type { PaginatedResponse } from '@/types'

export type AdminAnalyticsPeriod = 'daily' | 'weekly' | 'monthly'

export interface AdminUserQueryParams {
  page?: number
  pageSize?: number
  status?: AdminUserDTO['status'] | 'all'
  role?: AdminUserDTO['admin_role'] | 'all'
  search?: string
}

const sanitizeFilters = (filters: AdminUserQueryParams) => {
  const params: Record<string, unknown> = {}
  if (filters.page) params.page = filters.page
  if (filters.pageSize) params.pageSize = filters.pageSize
  if (filters.status && filters.status !== 'all') params.status = filters.status
  if (filters.role && filters.role !== 'all') params.role = filters.role
  if (filters.search) params.search = filters.search
  return params
}

export const adminService = {
  async getSystemMetrics(): Promise<SystemMetricsDTO> {
    const response = await apiClient.get<ApiResponse<SystemMetricsDTO>>('/admin/dashboard/metrics')
    return response.data.data
  },

  async getAnalytics(period: AdminAnalyticsPeriod = 'daily'): Promise<AnalyticsReportDTO> {
    const response = await apiClient.get<ApiResponse<AnalyticsReportDTO>>('/admin/dashboard/analytics', {
      params: { period },
    })
    return response.data.data
  },

  async listUsers(params: AdminUserQueryParams = {}): Promise<PaginatedResponse<AdminUserDTO[]>> {
    const response = await apiClient.get<PaginatedResponse<AdminUserDTO[]>>('/admin/users', {
      params: sanitizeFilters(params),
    })
    return response.data
  },

  async getUser(userId: string): Promise<AdminUserDTO> {
    const response = await apiClient.get<ApiResponse<AdminUserDTO>>(`/admin/users/${userId}`)
    return response.data.data
  },

  async updateUser(userId: string, payload: AdminUserUpdateDTO): Promise<AdminUserDTO> {
    const response = await apiClient.patch<ApiResponse<AdminUserDTO>>(`/admin/users/${userId}`, payload)
    return response.data.data
  },

  async bulkAction(payload: AdminUserBulkActionDTO) {
    const response = await apiClient.post<ApiResponse<{ success: number; failed: number }>>(
      '/admin/users/bulk-actions',
      payload
    )
    return response.data.data
  },

  async suspendUser(userId: string, reason?: string): Promise<AdminUserDTO> {
    const response = await apiClient.post<ApiResponse<AdminUserDTO>>(`/admin/users/${userId}/suspend`, { reason })
    return response.data.data
  },

  async activateUser(userId: string): Promise<AdminUserDTO> {
    const response = await apiClient.post<ApiResponse<AdminUserDTO>>(`/admin/users/${userId}/activate`)
    return response.data.data
  },

  async deleteUser(userId: string, reason?: string): Promise<void> {
    await apiClient.delete(`/admin/users/${userId}`, { data: { reason } })
  },

  async getSettings(): Promise<SystemSettingsDTO> {
    const response = await apiClient.get<ApiResponse<SystemSettingsDTO>>('/admin/settings')
    return response.data.data
  },

  async updateSettings(payload: Partial<SystemSettingsDTO>): Promise<SystemSettingsDTO> {
    const response = await apiClient.put<ApiResponse<SystemSettingsDTO>>('/admin/settings', payload)
    return response.data.data
  },

  async getNotifications(): Promise<AdminNotificationDTO[]> {
    const response = await apiClient.get<ApiResponse<AdminNotificationDTO[]>>('/admin/notifications')
    return response.data.data
  },

  async markNotificationRead(notificationId: string): Promise<AdminNotificationDTO> {
    const response = await apiClient.post<ApiResponse<AdminNotificationDTO>>(
      `/admin/notifications/${notificationId}/read`
    )
    return response.data.data
  },

  async getAuditLogs(limit = 50): Promise<AdminActionLogDTO[]> {
    const response = await apiClient.get<ApiResponse<AdminActionLogDTO[]>>('/admin/audit/logs', {
      params: { limit },
    })
    return response.data.data
  },
}
