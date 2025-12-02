import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { adminService } from '@/services'
import type { PaginatedResponse } from '@/types'
import type { AdminUserDTO, AdminUserUpdateDTO } from 'shared-dtos'

const USERS_QUERY_KEY = ['admin', 'users'] as const

type AdminRoleOption = AdminUserDTO['admin_role'] | 'all'
type AdminStatusOption = AdminUserDTO['status'] | 'all'

interface AdminUserFilters {
  search: string
  role: AdminRoleOption
  status: AdminStatusOption
}

const DEFAULT_FILTERS: AdminUserFilters = {
  search: '',
  role: 'all',
  status: 'all',
}

export const useAdminUsers = () => {
  const [page, setPage] = useState(1)
  const [filters, setFiltersState] = useState<AdminUserFilters>(DEFAULT_FILTERS)
  const queryClient = useQueryClient()

  const usersQuery = useQuery<PaginatedResponse<AdminUserDTO[]>>({
    queryKey: [...USERS_QUERY_KEY, page, filters],
    queryFn: () =>
      adminService.listUsers({
        page,
        search: filters.search || undefined,
        role: filters.role,
        status: filters.status,
      }),
    placeholderData: keepPreviousData,
  })

  const updateMutation = useMutation({
    mutationFn: ({ userId, payload }: { userId: string; payload: AdminUserUpdateDTO }) =>
      adminService.updateUser(userId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })

  const suspendMutation = useMutation({
    mutationFn: ({ userId, reason }: { userId: string; reason?: string }) =>
      adminService.suspendUser(userId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })

  const activateMutation = useMutation({
    mutationFn: (userId: string) => adminService.activateUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: USERS_QUERY_KEY })
    },
  })

  const setFilters = (next: Partial<AdminUserFilters>) => {
    setFiltersState((prev: AdminUserFilters) => ({ ...prev, ...next }))
    setPage(1)
  }

  return {
    users: usersQuery.data?.data ?? [],
    pagination: usersQuery.data?.pagination ?? null,
    isLoading: usersQuery.isLoading,
    isFetching: usersQuery.isFetching,
    error: usersQuery.error,
    page,
    filters,
    setPage,
    setFilters,
    refresh: () => void usersQuery.refetch(),
    changeRole: (userId: string, role: AdminUserDTO['admin_role']) =>
      updateMutation.mutateAsync({ userId, payload: { admin_role: role } }),
    changeStatus: (userId: string, status: AdminUserDTO['status']) =>
      updateMutation.mutateAsync({ userId, payload: { status } }),
    suspendUser: (userId: string, reason?: string) => suspendMutation.mutateAsync({ userId, reason }),
    activateUser: (userId: string) => activateMutation.mutateAsync(userId),
    mutations: {
      update: updateMutation,
      suspend: suspendMutation,
      activate: activateMutation,
    },
  }
}
